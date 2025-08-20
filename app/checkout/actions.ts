"use server"

import { Resend } from "resend"
import { uploadProofOfPaymentToDrive } from "@/lib/google-drive-upload" // Corrected import name

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY)

// Google Sheets configuration
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n")
const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID // Added for POS action

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  description?: string
  selectedSize?: string
  selectedColor?: string
  sizes?: string[]
  colors?: string[]
  stock: number // Total stock (for backward compatibility)
  variantStock?: number // Stock for the specific variant
  variantId?: string // Unique variant identifier
}

interface ProductVariant {
  productId: number
  size?: string
  color?: string
  stock: number
  variantId: string
}

interface ProductData {
  id: number
  name: string
  price: number
  image: string
  images?: string[]
  description: string
  detailedDescription?: string
  features?: string[]
  specifications?: { [key: string]: string }
  materials?: string[]
  careInstructions?: string[]
  sizes?: string[]
  colors?: string[]
  stock: number // Total stock (sum of all variants)
  variants?: ProductVariant[] // Individual variant stock levels
}

interface OrderData {
  orderId: string
  date: string
  time: string
  customerName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  deliveryMethod: string
  totalItems: number
  subtotal: number
  shippingCost: number
  totalAmount: number
  notes: string
  proofOfPaymentUrl: string
  status: string
}

interface OrderItemData {
  orderId: string
  itemId: number
  productName: string
  price: number
  quantity: number
  subtotal: number
  description: string
  selectedSize: string
  selectedColor: string
}

async function getGoogleSheetsAuth() {
  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    throw new Error("Google Sheets credentials not configured")
  }

  const now = Math.floor(Date.now() / 1000)

  const header = {
    alg: "RS256",
    typ: "JWT",
  }

  const payload = {
    iss: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  }

  function base64UrlEncode(str: string): string {
    return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
  }

  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const unsignedToken = `${encodedHeader}.${encodedPayload}`

  const privateKeyPem = GOOGLE_PRIVATE_KEY
  const privateKeyDer = pemToDer(privateKeyPem)

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    privateKeyDer,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  )

  const encoder = new TextEncoder()
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, encoder.encode(unsignedToken))

  const encodedSignature = base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)))

  const jwt = `${unsignedToken}.${encodedSignature}`

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  })

  const authData = await response.json()

  if (!response.ok) {
    throw new Error(`Auth error: ${authData.error_description || authData.error}`)
  }

  return authData.access_token
}

function pemToDer(pem: string): ArrayBuffer {
  const pemContents = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "")

  const binaryString = atob(pemContents)
  const bytes = new Uint8Array(binaryString.length)

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  return bytes.buffer
}

export async function getProductsFromGoogleSheet(): Promise<ProductData[]> {
  try {
    const accessToken = await getGoogleSheetsAuth()

    // Fetch products
    const productsResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/Products?valueRenderOption=FORMATTED_VALUE`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    if (!productsResponse.ok) {
      const errorData = await productsResponse.json()
      throw new Error(`Google Sheets API error: ${productsResponse.statusText} - ${JSON.stringify(errorData)}`)
    }

    const productsData = await productsResponse.json()
    const productRows = productsData.values as string[][]

    if (!productRows || productRows.length < 2) {
      console.warn("No product data found in Google Sheet or only headers present.")
      return []
    }

    // Fetch variants (if Product_Variants sheet exists)
    let variantsData: ProductVariant[] = []
    try {
      const variantsResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/Product_Variants?valueRenderOption=FORMATTED_VALUE`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )

      if (variantsResponse.ok) {
        const variantsJson = await variantsResponse.json()
        const variantRows = variantsJson.values as string[][]

        if (variantRows && variantRows.length > 1) {
          const variantHeaders = variantRows[0]
          variantsData = variantRows.slice(1).map((row) => {
            const variant: any = {}
            variantHeaders.forEach((header, index) => {
              const value = row[index]
              if (header === "product_id" || header === "stock") {
                variant[header === "product_id" ? "productId" : "stock"] = Number(value)
              } else if (header === "size" || header === "color") {
                variant[header] = value === "null" || value === "" ? undefined : value
              } else {
                variant[header] = value
              }
            })
            return variant as ProductVariant
          })
        }
      }
    } catch (error) {
      console.warn("Product_Variants sheet not found or error fetching variants:", error)
      // Continue without variants - will use legacy stock system
    }

    // Process products
    const productHeaders = productRows[0]
    const products = productRows.slice(1).map((row) => {
      const product: any = {}
      productHeaders.forEach((header, index) => {
        const value = row[index]
        // Convert specific fields to numbers or arrays
        if (header === "id" || header === "price") {
          product[header] = Number(value)
        } else if (header === "stock") {
          // Stock is now handled by variants, but keep for backward compatibility
          product[header] = Number(value) || 0
        } else if (
          header === "sizes" ||
          header === "colors" ||
          header === "features" ||
          header === "materials" ||
          header === "careInstructions"
        ) {
          product[header] = value ? value.split(",").map((s: string) => s.trim()) : []
        } else if (header === "images") {
          product[header] = value ? value.split(",").map((s: string) => s.trim()) : []
        } else if (header === "specifications") {
          try {
            product[header] = value ? JSON.parse(value) : {}
          } catch (e) {
            console.error(`Error parsing specifications for product: ${product.name}`, e)
            product[header] = {}
          }
        } else {
          product[header] = value
        }
      })

      // Add variants for this product
      const productVariants = variantsData.filter((v) => v.productId === product.id)
      if (productVariants.length > 0) {
        product.variants = productVariants
        // Calculate total stock from variants
        product.stock = productVariants.reduce((total, variant) => total + variant.stock, 0)
      } else {
        // If no variants found, set stock to 0 (since stock column was removed)
        product.stock = 0
      }

      return product as ProductData
    })

    return products
  } catch (error) {
    console.error("Error fetching products from Google Sheet:", error)
    throw error
  }
}

async function addOrderToGoogleSheet(orderData: OrderData) {
  try {
    const accessToken = await getGoogleSheetsAuth()

    const values = [
      [
        orderData.orderId,
        orderData.date,
        orderData.time,
        orderData.customerName,
        orderData.email,
        orderData.phone,
        orderData.address,
        orderData.city,
        orderData.state,
        orderData.zipCode,
        orderData.country,
        orderData.deliveryMethod,
        orderData.totalItems,
        orderData.subtotal,
        orderData.shippingCost,
        orderData.totalAmount,
        orderData.notes,
        orderData.proofOfPaymentUrl,
        orderData.status,
      ],
    ]

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/Orders:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values,
        }),
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Google Sheets API error: ${response.statusText} - ${JSON.stringify(errorData)}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error adding order to Google Sheet:", error)
    throw error
  }
}

async function validateStockAvailability(cartItems: CartItem[]): Promise<{ valid: boolean; errors: string[] }> {
  try {
    const accessToken = await getGoogleSheetsAuth()

    // Try to get variant data first (new system)
    let variantsData: ProductVariant[] = []
    try {
      const variantsResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/Product_Variants`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (variantsResponse.ok) {
        const variantsJson = await variantsResponse.json()
        const variantRows = variantsJson.values || []

        if (variantRows.length > 1) {
          const variantHeaders = variantRows[0]
          variantsData = variantRows.slice(1).map((row: string[]) => {
            const variant: any = {}
            variantHeaders.forEach((header: string, index: number) => {
              const value = row[index]
              if (header === "product_id" || header === "stock") {
                variant[header === "product_id" ? "productId" : "stock"] = Number(value)
              } else if (header === "size" || header === "color") {
                variant[header] = value === "null" || value === "" ? undefined : value
              } else {
                variant[header] = value
              }
            })
            return variant as ProductVariant
          })
        }
      }
    } catch (error) {
      console.warn("Product_Variants sheet not found, using legacy stock validation")
    }

    // If we have variant data, use variant-based validation
    if (variantsData.length > 0) {
      return validateVariantStock(cartItems, variantsData)
    }

    // Fallback to legacy stock validation
    return validateLegacyStock(cartItems, accessToken)
  } catch (error) {
    console.error("Error validating stock availability:", error)
    return { valid: false, errors: ["Failed to validate stock availability"] }
  }
}

async function validateVariantStock(
  cartItems: CartItem[],
  variantsData: ProductVariant[],
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = []

  for (const cartItem of cartItems) {
    // Find the specific variant for this cart item
    const variant = variantsData.find((v) => {
      // Handle both cases: when size/color are selected and when they're not
      const sizeMatch = cartItem.selectedSize
        ? v.size === cartItem.selectedSize
        : v.size === undefined || v.size === null || v.size === ""
      const colorMatch = cartItem.selectedColor
        ? v.color === cartItem.selectedColor
        : v.color === undefined || v.color === null || v.color === ""
      return v.productId === cartItem.id && sizeMatch && colorMatch
    })

    if (!variant) {
      errors.push(
        `${cartItem.name} (${cartItem.selectedSize || "No size"}${cartItem.selectedColor ? `, ${cartItem.selectedColor}` : ""}): Variant not found`,
      )
      continue
    }

    if (variant.stock <= 0) {
      errors.push(
        `${cartItem.name} (${cartItem.selectedSize || "No size"}${cartItem.selectedColor ? `, ${cartItem.selectedColor}` : ""}): Out of stock`,
      )
      continue
    }

    if (cartItem.quantity > variant.stock) {
      errors.push(
        `${cartItem.name} (${cartItem.selectedSize || "No size"}${cartItem.selectedColor ? `, ${cartItem.selectedColor}` : ""}): Only ${variant.stock} available, but ${cartItem.quantity} requested`,
      )
      continue
    }
  }

  return { valid: errors.length === 0, errors }
}

async function validateLegacyStock(
  cartItems: CartItem[],
  accessToken: string,
): Promise<{ valid: boolean; errors: string[] }> {
  // Get the current Products sheet data
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/Products`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`Google Sheets API error: ${response.statusText} - ${JSON.stringify(errorData)}`)
  }

  const productsData = await response.json()
  const products = productsData.values || []

  if (products.length === 0) {
    return { valid: false, errors: ["No products found in Products sheet"] }
  }

  // Find the stock column index
  const headers = products[0]
  const stockColumnIndex = headers.findIndex((header: string) => header.toLowerCase() === "stock")
  const idColumnIndex = headers.findIndex((header: string) => header.toLowerCase() === "id")

  if (stockColumnIndex === -1 || idColumnIndex === -1) {
    return { valid: false, errors: ["Stock or ID column not found in Products sheet"] }
  }

  // Create a map of product ID to current stock
  const productStockMap = new Map<number, { rowIndex: number; currentStock: number }>()

  for (let i = 1; i < products.length; i++) {
    const row = products[i]
    const productId = Number.parseInt(row[idColumnIndex])
    const currentStock = Number.parseInt(row[stockColumnIndex]) || 0
    const productName = row[headers.findIndex((h: string) => h.toLowerCase() === "name")] || "Unknown Product"

    if (!isNaN(productId)) {
      productStockMap.set(productId, { currentStock, name: productName })
    }
  }

  // Validate each cart item against current stock
  const errors: string[] = []

  for (const cartItem of cartItems) {
    const productStock = productStockMap.get(cartItem.id)

    if (!productStock) {
      errors.push(`${cartItem.name}: Product not found in database`)
      continue
    }

    if (productStock.currentStock <= 0) {
      errors.push(`${cartItem.name}: Out of stock`)
      continue
    }

    if (cartItem.quantity > productStock.currentStock) {
      errors.push(`${cartItem.name}: Only ${productStock.currentStock} available, but ${cartItem.quantity} requested`)
      continue
    }
  }

  return { valid: errors.length === 0, errors }
}

async function updateProductStock(cartItems: CartItem[]) {
  try {
    const accessToken = await getGoogleSheetsAuth()

    // Try to update variant stock first (new system)
    let variantsUpdated = false
    try {
      const variantsResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/Product_Variants`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (variantsResponse.ok) {
        const variantsJson = await variantsResponse.json()
        const variantRows = variantsJson.values || []

        if (variantRows.length > 1) {
          variantsUpdated = await updateVariantStock(cartItems, variantRows, accessToken)
        }
      }
    } catch (error) {
      console.warn("Product_Variants sheet not found, using legacy stock update")
    }

    // If variant update failed or not available, fall back to legacy update
    if (!variantsUpdated) {
      await updateLegacyStock(cartItems, accessToken)
    }
  } catch (error) {
    console.error("Error updating product stock:", error)
    // Don't throw error here to avoid breaking the order process
    // Just log the error and continue
  }
}

async function updateVariantStock(
  cartItems: CartItem[],
  variantRows: string[][],
  accessToken: string,
): Promise<boolean> {
  try {
    const variantHeaders = variantRows[0]
    const productIdIndex = variantHeaders.findIndex((h) => h === "product_id")
    const sizeIndex = variantHeaders.findIndex((h) => h === "size")
    const colorIndex = variantHeaders.findIndex((h) => h === "color")
    const stockIndex = variantHeaders.findIndex((h) => h === "stock")

    if (productIdIndex === -1 || stockIndex === -1) {
      console.warn("Required columns not found in Product_Variants sheet")
      return false
    }

    // Create a map of variant identifiers to row index and current stock
    const variantMap = new Map<string, { rowIndex: number; currentStock: number }>()

    for (let i = 1; i < variantRows.length; i++) {
      const row = variantRows[i]
      const productId = Number.parseInt(row[productIdIndex])
      const size = row[sizeIndex] === "null" || row[sizeIndex] === "" ? undefined : row[sizeIndex]
      const color = row[colorIndex] === "null" || row[colorIndex] === "" ? undefined : row[colorIndex]
      const currentStock = Number.parseInt(row[stockIndex]) || 0

      if (!isNaN(productId)) {
        // Use the same encoding as the variant ID generation
        const encodedSize = size ? encodeURIComponent(size) : "null"
        const encodedColor = color ? encodeURIComponent(color) : "null"
        const variantKey = `${productId}-${encodedSize}-${encodedColor}`
        variantMap.set(variantKey, { rowIndex: i + 1, currentStock }) // +1 because sheets are 1-indexed
      }
    }

    // Prepare variant stock updates
    const variantUpdates: { range: string; values: number[][] }[] = []

    for (const cartItem of cartItems) {
      // Use the same encoding as the variant ID generation
      const encodedSize = cartItem.selectedSize ? encodeURIComponent(cartItem.selectedSize) : "null"
      const encodedColor = cartItem.selectedColor ? encodeURIComponent(cartItem.selectedColor) : "null"
      const variantKey = `${cartItem.id}-${encodedSize}-${encodedColor}`
      const variantData = variantMap.get(variantKey)

      if (variantData) {
        const newStock = Math.max(0, variantData.currentStock - cartItem.quantity)
        const range = `Product_Variants!${String.fromCharCode(65 + stockIndex)}${variantData.rowIndex}`

        variantUpdates.push({
          range,
          values: [[newStock]],
        })

        console.log(
          `Updating variant stock for ${cartItem.name} (${cartItem.selectedSize || "No size"}${cartItem.selectedColor ? `, ${cartItem.selectedColor}` : ""}): ${variantData.currentStock} -> ${newStock}`,
        )
      } else {
        console.warn(
          `Variant not found for product ${cartItem.id} (${cartItem.selectedSize || "No size"}${cartItem.selectedColor ? `, ${cartItem.selectedColor}` : ""})`,
        )
      }
    }

    // Update variant stock values in batch
    if (variantUpdates.length > 0) {
      const batchUpdateResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values:batchUpdate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            valueInputOption: "RAW",
            data: variantUpdates,
          }),
        },
      )

      if (!batchUpdateResponse.ok) {
        const errorData = await batchUpdateResponse.json()
        throw new Error(`Google Sheets API error: ${batchUpdateResponse.statusText} - ${JSON.stringify(errorData)}`)
      }

      console.log(`Successfully updated variant stock for ${variantUpdates.length} items`)
      return true
    }

    return false
  } catch (error) {
    console.error("Error updating variant stock:", error)
    return false
  }
}

async function updateLegacyStock(cartItems: CartItem[], accessToken: string) {
  // Get the current Products sheet data
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/Products`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`Google Sheets API error: ${response.statusText} - ${JSON.stringify(errorData)}`)
  }

  const productsData = await response.json()
  const products = productsData.values || []

  if (products.length === 0) {
    console.warn("No products found in Products sheet")
    return
  }

  // Find the stock column index
  const headers = products[0]
  const stockColumnIndex = headers.findIndex((header: string) => header.toLowerCase() === "stock")
  const idColumnIndex = headers.findIndex((header: string) => header.toLowerCase() === "id")

  if (stockColumnIndex === -1 || idColumnIndex === -1) {
    console.warn("Stock or ID column not found in Products sheet")
    return
  }

  // Create a map of product ID to current stock
  const productStockMap = new Map<number, { rowIndex: number; currentStock: number }>()

  for (let i = 1; i < products.length; i++) {
    const row = products[i]
    const productId = Number.parseInt(row[idColumnIndex])
    const currentStock = Number.parseInt(row[stockColumnIndex]) || 0
    const productName = row[headers.findIndex((h: string) => h.toLowerCase() === "name")] || "Unknown Product"

    if (!isNaN(productId)) {
      productStockMap.set(productId, { rowIndex: i + 1, currentStock }) // +1 because sheets are 1-indexed
    }
  }

  // Prepare stock updates for each cart item
  const stockUpdates: { range: string; values: number[][] }[] = []

  for (const cartItem of cartItems) {
    const productStock = productStockMap.get(cartItem.id)

    if (productStock) {
      const newStock = Math.max(0, productStock.currentStock - cartItem.quantity)
      const range = `Products!${String.fromCharCode(65 + stockColumnIndex)}${productStock.rowIndex}`

      stockUpdates.push({
        range,
        values: [[newStock]],
      })

      console.log(
        `Updating legacy stock for product ${cartItem.id} (${cartItem.name}): ${productStock.currentStock} -> ${newStock}`,
      )
    } else {
      console.warn(`Product with ID ${cartItem.id} not found in Products sheet`)
    }
  }

  // Update all stock values in batch
  if (stockUpdates.length > 0) {
    const batchUpdateResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values:batchUpdate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          valueInputOption: "RAW",
          data: stockUpdates,
        }),
      },
    )

    if (!batchUpdateResponse.ok) {
      const errorData = await batchUpdateResponse.json()
      throw new Error(`Google Sheets API error: ${batchUpdateResponse.statusText} - ${JSON.stringify(errorData)}`)
    }

    console.log(`Successfully updated legacy stock for ${stockUpdates.length} products`)
  }
}

async function addOrderItemsToGoogleSheet(orderItems: OrderItemData[]) {
  try {
    const accessToken = await getGoogleSheetsAuth()

    const values = orderItems.map((item) => [
      item.orderId,
      item.itemId,
      item.productName,
      item.price,
      item.quantity,
      item.subtotal,
      item.description,
      item.selectedSize || "",
      item.selectedColor || "",
    ])

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/Order_Items:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values,
        }),
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Google Sheets API error: ${response.statusText} - ${JSON.stringify(errorData)}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error adding order items to Google Sheet:", error)
    throw error
  }
}

async function sendCustomerConfirmationEmail(orderData: OrderData, orderItems: OrderItemData[]) {
  try {
    if (!process.env.RESEND_API_KEY || !process.env.RESEND_API_KEY.startsWith("re_")) {
      console.log("Resend API key not configured, skipping customer email")
      return { success: false, error: "Email service not configured" }
    }

    const itemsTable = orderItems
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.productName}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            ${item.selectedSize ? `Size: ${item.selectedSize}` : ""}
            ${item.selectedColor ? `${item.selectedSize ? ", " : ""}Color: ${item.selectedColor}` : ""}
            ${!item.selectedSize && !item.selectedColor ? "-" : ""}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">€${item.subtotal.toFixed(2)}</td>
        </tr>
      `,
      )
      .join("")

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation - ${orderData.orderId}</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
         
          <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Aachen Studio</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">by PPI Aachen</p>
          </div>
         
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
           
            <h2 style="color: #16a34a; margin-top: 0; font-size: 24px;">Order Confirmation</h2>
           
            <p style="font-size: 16px; margin-bottom: 25px;">Dear ${orderData.customerName},</p>
           
            <p style="font-size: 16px; margin-bottom: 25px;">
              Thank you for your order! We have received your order and proof of payment.
              We will process your order within 24 hours and keep you updated on the progress.
            </p>
           
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h3 style="margin-top: 0; color: #1e293b; font-size: 18px;">Order Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: 600;">Order ID:</td>
                  <td style="padding: 8px 0;">${orderData.orderId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: 600;">Date:</td>
                  <td style="padding: 8px 0;">${orderData.date} at ${orderData.time}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: 600;">Delivery Method:</td>
                  <td style="padding: 8px 0;">
                    ${orderData.deliveryMethod === "pickup" ? "🏪 Pickup in Aachen" : "🚚 Delivery"}
                  </td>
                </tr>
              </table>
            </div>
           
            <h3 style="color: #1e293b; font-size: 18px; margin-top: 30px;">Items Ordered</h3>
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
              <thead>
                <tr style="background: #f9fafb;">
                  <th style="padding: 15px 12px; text-align: left; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Product</th>
                  <th style="padding: 15px 12px; text-align: left; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Options</th>
                  <th style="padding: 15px 12px; text-align: center; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Qty</th>
                  <th style="padding: 15px 12px; text-align: right; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsTable}
              </tbody>
            </table>
           
            <div style="margin-top: 25px; padding: 20px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 5px 0; font-size: 16px;">Subtotal:</td>
                  <td style="padding: 5px 0; text-align: right; font-size: 16px;">€${orderData.subtotal.toFixed(2)}</td> 
                </tr>
                <tr>
                  <td style="padding: 5px 0; font-size: 16px;">${orderData.deliveryMethod === "pickup" ? "Pickup" : "Delivery"}:</td>
                  <td style="padding: 5px 0; text-align: right; font-size: 16px;">€${orderData.shippingCost.toFixed(2)}</td>
                </tr>
                <tr style="border-top: 2px solid #16a34a;">
                  <td style="padding: 15px 0 5px 0; font-size: 20px; font-weight: bold; color: #16a34a;">Total:</td>
                  <td style="padding: 15px 0 5px 0; text-align: right; font-size: 20px; font-weight: bold; color: #16a34a;">€${orderData.totalAmount.toFixed(2)}</td>
                </tr>
              </table>
            </div>
           
            ${
              orderData.deliveryMethod === "pickup"
                ? `
              <div style="margin-top: 25px; padding: 20px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px;">
                <h4 style="margin-top: 0; color: #1e40af; font-size: 16px;">🏪 Pickup Information</h4>
                <p style="margin-bottom: 0; color: #1e40af;">
                  We will contact you within 24 hours to arrange the pickup location and time in Aachen.
                  Please keep your phone available for our call.
                </p>
              </div>
            `
                : `
              <div style="margin-top: 25px; padding: 20px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px;">
                <h4 style="margin-top: 0; color: #1e40af; font-size: 16px;">🚚 Delivery Information</h4>
                <p style="margin-bottom: 0; color: #1e40af;">
                  Your order will be shipped to:<br>
                  <strong>${orderData.address}</strong><br>
                  ${orderData.city}, ${orderData.state} ${orderData.zipCode}<br>
                  ${orderData.country}</strong><br><br>
                  You will receive tracking information once your order has been shipped.
                </p>
              </div>
            `
            }
           
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin-bottom: 10px; color: #6b7280;">Questions about your order?</p>
              <p style="margin: 0;">
                <strong>Email:</strong> <a href="mailto:funding@ppiaachen.de" style="color: #16a34a; text-decoration: none;">funding@ppiaachen.de</a><br>
                <strong>Instagram:</strong> <a href="https://instagram.com/aachen.studio" style="color: #16a34a; text-decoration: none;">@aachen.studio</a>
              </p>
            </div>
           
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280;">
              <p style="margin: 0; font-size: 14px;">
                Thank you for supporting Indonesian culture through Aachen Studio!<br>
                <strong>PPI Aachen</strong> - Connecting Indonesian heritage with modern style
              </p>
            </div>
           
          </div>
        </body>
      </html>
    `

    const { data, error } = await resend.emails.send({
      from: "No Reply Aachen Studio <no-reply@shop.ppiaachen.de>",
      to: [orderData.email],
      subject: `Order Confirmation - ${orderData.orderId} | Aachen Studio`,
      html: emailHtml,
    })

    if (error) {
      console.error("Error sending customer email:", error)
      return { success: false, error: error.message }
    }

    console.log("Customer confirmation email sent successfully:", data)
    return { success: true, data }
  } catch (error) {
    console.error("Error sending customer email:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

async function sendBusinessNotificationEmail(orderData: OrderData, orderItems: OrderItemData[]) {
  try {
    if (!process.env.RESEND_API_KEY || !process.env.RESEND_API_KEY.startsWith("re_")) {
      console.log("Resend API key not configured, skipping business notification")
      return { success: false, error: "Email service not configured" }
    }

    const itemsTable = orderItems
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.productName}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            ${item.selectedSize ? `Size: ${item.selectedSize}` : ""}
            ${item.selectedColor ? `${item.selectedSize ? ", " : ""}Color: ${item.selectedColor}` : ""}
            ${!item.selectedSize && !item.selectedColor ? "-" : ""}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">€${item.subtotal.toFixed(2)}</td>
        </tr>
      `,
      )
      .join("")

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Order - ${orderData.orderId}</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px;">
         
          <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 25px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: bold;">🚨 NEW ORDER RECEIVED</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 18px;">${orderData.orderId}</p>
          </div>
         
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
           
            <div style="background: #fef2f2; border: 2px solid #fecaca; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
              <h3 style="margin-top: 0; color: #dc2626; font-size: 18px;">⚡ ACTION REQUIRED</h3>
              <p style="margin-bottom: 0; color: #dc2626; font-weight: 600;">
                Please review the proof of payment and process this order within 24 hours.
              </p>
            </div>
           
            <h3 style="color: #1e293b; font-size: 18px; margin-top: 0;">👤 Customer Information</h3>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; width: 140px;">Name:</td>
                  <td style="padding: 8px 0;">${orderData.customerName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: 600;">Email:</td>
                  <td style="padding: 8px 0;"><a href="mailto:${orderData.email}" style="color: #16a34a;">${orderData.email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: 600;">Phone:</td>
                  <td style="padding: 8px 0;"><a href="tel:${orderData.phone}" style="color: #16a34a;">${orderData.phone}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: 600;">Delivery:</td>
                  <td style="padding: 8px 0;">
                    <span style="background: ${orderData.deliveryMethod === "pickup" ? "#dcfce7" : "#dbeafe"}; color: ${orderData.deliveryMethod === "pickup" ? "#166534" : "#1e40af"}; padding: 4px 8px; border-radius: 4px; font-weight: 600;">
                      ${orderData.deliveryMethod === "pickup" ? "🏪 PICKUP" : "🚚 DELIVERY"}
                    </span>
                  </td>
                </tr>
              </table>
            </div>
           
            ${
              orderData.deliveryMethod === "delivery"
                ? `
              <h3 style="color: #1e293b; font-size: 18px;">📍 Delivery Address</h3>
              <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                <p style="margin: 0; font-size: 16px; line-height: 1.5;">
                  <strong>${orderData.address}</strong><br>
                  ${orderData.city}, ${orderData.state} ${orderData.zipCode}<br>
                  ${orderData.country}
                </p>
              </div>
            `
                : `
              <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                <p style="margin: 0; color: #166534; font-weight: 600;">
                  📞 Contact customer to arrange pickup location and time in Aachen
                </p>
              </div>
            `
            }
           
            <h3 style="color: #1e293b; font-size: 18px;">📦 Order Details</h3>
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-bottom: 25px;">
              <thead>
                <tr style="background: #f9fafb;">
                  <th style="padding: 15px 12px; text-align: left; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Product</th>
                  <th style="padding: 15px 12px; text-align: left; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Options</th>
                  <th style="padding: 15px 12px; text-align: center; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Qty</th>
                  <th style="padding: 15px 12px; text-align: right; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsTable}
              </tbody>
            </table>
           
            <div style="background: #fef2f2; border: 2px solid #fecaca; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
              <h4 style="margin-top: 0; color: #dc2626; font-size: 16px;">💰 Payment Information</h4>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 5px 0; font-size: 16px;">Subtotal:</td>
                  <td style="padding: 5px 0; text-align: right; font-size: 16px;">€${orderData.subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; font-size: 16px;">Shipping:</td>
                  <td style="padding: 5px 0; text-align: right; font-size: 16px;">€${orderData.shippingCost.toFixed(2)}</td>
                </tr>
                <tr style="border-top: 2px solid #dc2626;">
                  <td style="padding: 15px 0 5px 0; font-size: 20px; font-weight: bold; color: #dc2626;">TOTAL AMOUNT:</td>
                  <td style="padding: 15px 0 5px 0; text-align: right; font-size: 20px; font-weight: bold; color: #dc2626;">€${orderData.totalAmount.toFixed(2)}</td>
                </tr>
              </table>
             
              <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #fecaca;">
                <p style="margin: 0; font-weight: 600; color: #dc2626;">
                  📎 <a href="${orderData.proofOfPaymentUrl}" style="color: #dc2626; text-decoration: underline;" target="_blank">
                    VIEW PROOF OF PAYMENT
                  </a>
                </p>
              </div>
            </div>
           
            ${
              orderData.notes
                ? `
              <div style="background: #fffbeb; border: 1px solid #fde047; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                <h4 style="margin-top: 0; color: #a16207; font-size: 16px;">📝 Customer Notes</h4>
                <p style="margin-bottom: 0; color: #a16207; font-style: italic;">
                  "${orderData.notes}"
                </p>
              </div>
            `
                : ""
            }
           
            <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px;">
              <h4 style="margin-top: 0; color: #0369a1; font-size: 16px;">🚀 Quick Actions</h4>
              <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <a href="mailto:${orderData.email}?subject=Order Update - ${orderData.orderId}"
                   style="background: #16a34a; color: white; padding: 10px 15px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">
                  📧 Email Customer
                </a>
                <a href="tel:${orderData.phone}"
                   style="background: #0ea5e9; color: white; padding: 10px 15px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">
                  📞 Call Customer
                </a>
                <a href="${orderData.proofOfPaymentUrl}" target="_blank"
                   style="background: #dc2626; color: white; padding: 10px 15px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">
                  💰 View Payment
                </a>
              </div>
            </div>
           
          </div>
        </body>
      </html>
    `

    const { data, error } = await resend.emails.send({
      from: "Webshop Aachen Studio <orders@shop.ppiaachen.de>",
      to: ["fundraising@ppiaachen.de"],
      subject: `🚨 NEW ORDER: ${orderData.orderId} - €${orderData.totalAmount.toFixed(2)} | Action Required`,
      html: emailHtml,
    })

    if (error) {
      console.error("Error sending business notification:", error)
      return { success: false, error: error.message }
    }

    console.log("Business notification email sent successfully:", data)
    return { success: true, data }
  } catch (error) {
    console.error("Error sending business notification:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function submitOrder(formData: FormData) {
  try {
    const cartItems = JSON.parse(formData.get("cartItems") as string) as CartItem[]
    const deliveryMethod = formData.get("deliveryMethod") as string
    const subtotal = Number.parseFloat(formData.get("subtotal") as string)
    const shippingCost = Number.parseFloat(formData.get("shippingCost") as string)
    const totalAmount = Number.parseFloat(formData.get("totalAmount") as string)
    const itemCount = Number.parseInt(formData.get("itemCount") as string)
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const address = formData.get("address") as string
    const city = formData.get("city") as string
    const state = formData.get("state") as string
    const zipCode = formData.get("zipCode") as string
    const country = formData.get("country") as string
    const notes = (formData.get("notes") as string) || ""
    const proofFile = formData.get("proofOfPayment") as File

    // Validate cart items for required options
    const validationErrors: string[] = []
    cartItems.forEach((item, index) => {
      if (item.sizes && item.sizes.length > 0 && !item.selectedSize) {
        validationErrors.push(`Item ${index + 1} (${item.name}): Size is required`)
      }
      if (item.colors && item.colors.length > 0 && !item.selectedColor) {
        validationErrors.push(`Item ${index + 1} (${item.name}): Color is required`)
      }
    })

    if (validationErrors.length > 0) {
      return {
        success: false,
        error: "Required options missing: " + validationErrors.join(", "),
      }
    }

    // Validate stock availability before proceeding with order
    console.log("Validating stock availability...")
    const stockValidation = await validateStockAvailability(cartItems)

    if (!stockValidation.valid) {
      console.log("Stock validation failed:", stockValidation.errors)
      return {
        success: false,
        error: "Stock validation failed: " + stockValidation.errors.join(", "),
      }
    }

    console.log("Stock validation passed - proceeding with order")

    const now = new Date()
    // Generate order ID with format: PU/DL + DDMMYY + random 3-char alphanumeric
    const deliveryPrefix = deliveryMethod === "pickup" ? "PU" : "DL"
    const dateStr = now
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })
      .replace(/\//g, "")
    const randomSuffix = Math.random().toString(36).substr(2, 3).toUpperCase()
    const orderId = `${deliveryPrefix}${dateStr}-${randomSuffix}`

    const customerName = `${firstName} ${lastName}`

    // Upload proof of payment to Google Drive
    console.log("Uploading proof of payment to Google Drive...")
    const uploadResult = await uploadProofOfPaymentToDrive(proofFile, orderId, customerName)

    if (!uploadResult.success) {
      console.error("Failed to upload proof of payment:", uploadResult.error)
      throw new Error(`Failed to upload proof of payment: ${uploadResult.error}`)
    }

    console.log("Proof of payment uploaded successfully:", uploadResult.webViewLink)

    const date = now.toLocaleDateString("en-GB")
    const time = now.toLocaleTimeString("en-GB", { hour12: false })

    const orderData: OrderData = {
      orderId,
      date,
      time,
      customerName,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      country,
      deliveryMethod,
      totalItems: itemCount,
      subtotal,
      shippingCost,
      totalAmount,
      notes,
      proofOfPaymentUrl: uploadResult.webViewLink || "",
      status: "Pending Review",
    }

    const orderItemsData: OrderItemData[] = cartItems.map((item) => ({
      orderId,
      itemId: item.id,
      productName: item.name,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
      description: item.description || "",
      selectedSize: item.selectedSize || "",
      selectedColor: item.selectedColor || "",
    }))

    await Promise.all([addOrderToGoogleSheet(orderData), addOrderItemsToGoogleSheet(orderItemsData)])

    // Update stock in Google Sheet
    try {
      await updateProductStock(cartItems)
    } catch (stockError) {
      console.error("Error updating stock in Google Sheet:", stockError)
      return { success: false, error: "Failed to update stock" }
    }

    const emailResults = await Promise.allSettled([
      sendCustomerConfirmationEmail(orderData, orderItemsData),
      sendBusinessNotificationEmail(orderData, orderItemsData),
    ])

    let emailsFailed = false
    emailResults.forEach((result, index) => {
      const emailType = index === 0 ? "Customer" : "Business"
      if (result.status === "fulfilled" && result.value.success) {
        console.log(`${emailType} email sent successfully`)
      } else {
        console.error(`${emailType} email failed:`, result.status === "fulfilled" ? result.value.error : result.reason)
        emailsFailed = true
      }
    })

    if (emailsFailed) {
      console.log("📧 Email service unavailable - logging order for manual processing")
      const { logOrderForManualProcessing, generatePlainTextCustomerEmail } = await import(
        "@/lib/fallback-notifications"
      )
      logOrderForManualProcessing(orderData, orderItemsData)
      const plainTextEmail = generatePlainTextCustomerEmail(orderData, orderItemsData)
      console.log("📧 CUSTOMER EMAIL TEMPLATE (copy and send manually):")
      console.log(plainTextEmail)
    }

    return { success: true, orderId, emailsSent: !emailsFailed, orderData, orderItemsData }
  } catch (error) {
    console.error("Error submitting order:", error)
    return { success: false, error: "Failed to submit order" }
  }
}

// NEW SERVER ACTION FOR POS PAGE
export async function submitPOSOrder(formData: FormData) {
  if (!GOOGLE_SHEET_ID || !GOOGLE_DRIVE_FOLDER_ID) {
    return { success: false, message: "Server configuration error: Google Sheet ID or Drive Folder ID missing." }
  }

  const customerName = formData.get("customerName") as string
  const customerContact = formData.get("customerContact") as string
  const deliveryAddress = formData.get("deliveryAddress") as string
  const cartItemsJson = formData.get("cartItems") as string
  const totalAmountStr = formData.get("totalAmount") as string // This will now be the subtotal from POS
  const proofOfPaymentFile = formData.get("proofOfPayment") as File

  if (
    !customerName ||
    !customerContact ||
    !deliveryAddress ||
    !cartItemsJson ||
    !totalAmountStr ||
    !proofOfPaymentFile
  ) {
    return { success: false, message: "Missing required order details or proof of payment file." }
  }

  const cartItems: CartItem[] = JSON.parse(cartItemsJson)
  const totalAmount = Number.parseFloat(totalAmountStr) // This is now the subtotal from POS

  // Validate stock availability before proceeding with order
  console.log("Validating stock availability for POS order...")
  const stockValidation = await validateStockAvailability(cartItems)

  if (!stockValidation.valid) {
    console.log("Stock validation failed for POS order:", stockValidation.errors)
    return {
      success: false,
      message: "Stock validation failed: " + stockValidation.errors.join(", "),
    }
  }
  console.log("Stock validation passed for POS order.")

  let proofOfPaymentUrl = ""
  try {
    const uploadResult = await uploadProofOfPaymentToDrive(proofOfPaymentFile, "POS_Order", customerName) // Use a generic order ID for upload if not yet generated
    if (!uploadResult.success || !uploadResult.webViewLink) {
      throw new Error(uploadResult.error || "Unknown upload error")
    }
    proofOfPaymentUrl = uploadResult.webViewLink
  } catch (error) {
    console.error("Error uploading proof of payment to Google Drive for POS order:", error)
    return { success: false, message: "Failed to upload proof of payment. Please try again." }
  }

  const now = new Date()
  // Generate order ID with format: POS + DDMMYY + random 3-char alphanumeric
  const dateStr = now
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    })
    .replace(/\//g, "")
  const randomSuffix = Math.random().toString(36).substr(2, 3).toUpperCase()
  const orderId = `POS${dateStr}-${randomSuffix}`

  const date = now.toLocaleDateString("en-GB")
  const time = now.toLocaleTimeString("en-GB", { hour12: false })

  // For POS orders, simplify delivery method and costs
  const deliveryMethod = "POS Sale"
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingCost = 0 // No shipping cost for POS sales
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const orderData: OrderData = {
    orderId,
    date,
    time,
    customerName,
    email: customerContact, // Using customerContact for email/primary contact
    phone: "", // Phone might be part of customerContact, or left empty
    address: deliveryAddress, // Using deliveryAddress for full address
    city: "",
    state: "",
    zipCode: "",
    country: "", // These might be parsed from deliveryAddress if needed
    deliveryMethod,
    totalItems: itemCount,
    subtotal, // Subtotal is the total without tax
    shippingCost,
    totalAmount: totalAmount, // Total amount is now the same as subtotal for POS
    notes: "POS Sale - Customer details collected at point of sale.",
    proofOfPaymentUrl: proofOfPaymentUrl,
    status: "Completed (POS)", // Directly mark as completed for POS
  }

  const orderItemsData: OrderItemData[] = cartItems.map((item) => ({
    orderId,
    itemId: item.id,
    productName: item.name,
    price: item.price,
    quantity: item.quantity,
    subtotal: item.price * item.quantity,
    description: item.description || "",
    selectedSize: item.selectedSize || "",
    selectedColor: item.selectedColor || "",
  }))

  try {
    await Promise.all([
      addOrderToGoogleSheet(orderData),
      addOrderItemsToGoogleSheet(orderItemsData),
      updateProductStock(cartItems), // Update stock after successful order
    ])

    // Optionally send confirmation emails for POS sales if desired, but typically not needed for in-person
    // The email templates below are for the main checkout, not POS specific.
    // If POS needs emails, a separate, tax-free template would be ideal.
    // For now, I'll modify the existing ones to remove tax display.
    // const emailResults = await Promise.allSettled([
    //   sendCustomerConfirmationEmail(orderData, orderItemsData),
    //   sendBusinessNotificationEmail(orderData, orderItemsData),
    // ])

    return { success: true, message: `Order ${orderId} successfully processed!` }
  } catch (error: any) {
    console.error("Error submitting POS order:", error.message, error.stack)
    return { success: false, message: `Failed to process POS order: ${error.message}` }
  }
}
