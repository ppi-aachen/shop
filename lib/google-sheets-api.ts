// Interfaces
export interface ProductData {
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
  stock: number
}

export interface OrderData {
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

export interface OrderItemData {
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

// Google Sheets configuration
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n")

// Helper functions for Google Sheets Auth
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

// API functions
export async function getProductsFromGoogleSheet(): Promise<ProductData[]> {
  try {
    const accessToken = await getGoogleSheetsAuth()
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/Products?valueRenderOption=FORMATTED_VALUE`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Google Sheets API error: ${response.statusText} - ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    const rows = data.values as string[][]

    if (!rows || rows.length < 2) {
      console.warn("No product data found in Google Sheet or only headers present.")
      return []
    }

    const headers = rows[0]
    const products = rows.slice(1).map((row) => {
      const product: any = {}
      headers.forEach((header, index) => {
        const value = row[index]
        if (header === "id" || header === "price" || header === "stock") {
          product[header] = Number(value)
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
      return product as ProductData
    })

    return products
  } catch (error) {
    console.error("Error fetching products from Google Sheet:", error)
    throw error
  }
}

export async function addOrderToGoogleSheet(orderData: OrderData) {
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

export async function addOrderItemsToGoogleSheet(orderItems: OrderItemData[]) {
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

export async function updateProductStockInSheet(orderItems: OrderItemData[]) {
  try {
    const accessToken = await getGoogleSheetsAuth()

    // 1. Get current product data to find row indices and current stock
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/Products?valueRenderOption=FORMATTED_VALUE`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(
        `Google Sheets API error fetching products for stock update: ${response.statusText} - ${JSON.stringify(errorData)}`,
      )
    }

    const data = await response.json()
    const rows = data.values as string[][]

    if (!rows || rows.length < 2) {
      console.warn("No product data found in Google Sheet for stock update.")
      return { success: false, error: "No product data found for stock update." }
    }

    const headers = rows[0]
    const productIdColumnIndex = headers.indexOf("id")
    const stockColumnIndex = headers.indexOf("stock")

    if (productIdColumnIndex === -1 || stockColumnIndex === -1) {
      throw new Error("Product 'id' or 'stock' column not found in Google Sheet 'Products' tab.")
    }

    const updates: { range: string; values: string[][] }[] = []

    for (const orderItem of orderItems) {
      const productId = orderItem.itemId
      const quantityOrdered = orderItem.quantity

      // Find the row for the product (skip header row, so start search from index 1)
      const productRowIndex = rows.findIndex(
        (row, index) => index > 0 && Number(row[productIdColumnIndex]) === productId,
      )

      if (productRowIndex === -1) {
        console.warn(`Product with ID ${productId} not found in Google Sheet. Cannot update stock.`)
        continue
      }

      const currentRow = rows[productRowIndex]
      const currentStock = Number(currentRow[stockColumnIndex])
      const newStock = currentStock - quantityOrdered

      if (isNaN(currentStock)) {
        console.warn(
          `Current stock for product ID ${productId} is not a number: ${currentRow[stockColumnIndex]}. Skipping stock update.`,
        )
        continue
      }

      // Google Sheets API uses 1-based indexing for rows and columns
      // The actual row in the sheet is productRowIndex + 1 (because headers are row 1, data starts from row 2)
      // The column is stockColumnIndex + 1
      const range = `Products!R${productRowIndex + 1}C${stockColumnIndex + 1}`
      updates.push({
        range: range,
        values: [[Math.max(0, newStock).toString()]], // Ensure stock doesn't go below 0
      })
    }

    if (updates.length === 0) {
      console.log("No stock updates to perform.")
      return { success: true, message: "No stock updates performed." }
    }

    // Perform batch update
    const batchUpdateResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values:batchUpdate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: updates,
          valueInputOption: "RAW",
        }),
      },
    )

    if (!batchUpdateResponse.ok) {
      const errorData = await batchUpdateResponse.json()
      throw new Error(
        `Google Sheets API batch update error: ${batchUpdateResponse.statusText} - ${JSON.stringify(errorData)}`,
      )
    }

    console.log("Stock updated successfully in Google Sheet.")
    return { success: true, data: await batchUpdateResponse.json() }
  } catch (error) {
    console.error("Error updating product stock in Google Sheet:", error)
    throw error
  }
}
