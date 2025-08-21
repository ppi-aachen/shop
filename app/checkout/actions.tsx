"use server"

import { GoogleAuth } from "google-auth-library"
import { GoogleSpreadsheet } from "google-spreadsheet"
import { Resend } from "resend"
import { uploadProofOfPaymentToDrive } from "@/lib/google-drive-upload"
import { generateOrderPDF } from "@/lib/pdf-generator"
import { sendFallbackNotification } from "@/lib/fallback-notifications"

const resend = new Resend(process.env.RESEND_API_KEY)

interface Product {
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
  discount?: number // NEW: Discount percentage
  variants?: {
    productId: number
    size?: string
    color?: string
    stock: number
    variantId: string
  }[]
}

interface CartItem {
  id: number
  name: string
  price: number
  originalPrice?: number // Store original price for display
  discount?: number
  quantity: number
  selectedSize?: string
  selectedColor?: string
  image: string
}

interface OrderData {
  orderId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  deliveryMethod: string
  deliveryAddress?: string
  subtotal: number
  shippingCost: number
  totalAmount: number
  itemCount: number
  orderDate: string
  proofOfPaymentUrl?: string
}

interface OrderItemData {
  orderId: string
  productId: number
  productName: string
  price: number
  originalPrice?: number
  discount?: number
  quantity: number
  selectedSize?: string
  selectedColor?: string
  subtotal: number
}

// Helper function to calculate discounted price
function calculateDiscountedPrice(originalPrice: number, discount?: number): number {
  if (!discount || discount <= 0) return originalPrice
  return originalPrice * (1 - discount / 100)
}

export async function getProductsFromGoogleSheet(): Promise<Product[]> {
  try {
    const auth = new GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, auth)
    await doc.loadInfo()

    // Load Products sheet
    const productsSheet = doc.sheetsByTitle["Products"]
    if (!productsSheet) {
      throw new Error("Products sheet not found")
    }

    const productsRows = await productsSheet.getRows()
    const products: Product[] = []

    for (const row of productsRows) {
      const product: Product = {
        id: Number.parseInt(row.get("id") || "0"),
        name: row.get("name") || "",
        price: Number.parseFloat(row.get("price") || "0"),
        image: row.get("image") || "",
        images: row.get("images")
          ? row
              .get("images")
              .split(",")
              .map((img: string) => img.trim())
          : [],
        description: row.get("description") || "",
        detailedDescription: row.get("detailedDescription") || "",
        features: row.get("features")
          ? row
              .get("features")
              .split(",")
              .map((f: string) => f.trim())
          : [],
        specifications: row.get("specifications") ? JSON.parse(row.get("specifications")) : {},
        materials: row.get("materials")
          ? row
              .get("materials")
              .split(",")
              .map((m: string) => m.trim())
          : [],
        careInstructions: row.get("careInstructions")
          ? row
              .get("careInstructions")
              .split(",")
              .map((c: string) => c.trim())
          : [],
        sizes: row.get("sizes")
          ? row
              .get("sizes")
              .split(",")
              .map((s: string) => s.trim())
          : [],
        colors: row.get("colors")
          ? row
              .get("colors")
              .split(",")
              .map((c: string) => c.trim())
          : [],
        stock: Number.parseInt(row.get("stock") || "0"),
        discount: Number.parseFloat(row.get("discount") || "0"), // NEW: Parse discount
      }

      products.push(product)
    }

    // Load Variants sheet if it exists
    const variantsSheet = doc.sheetsByTitle["Variants"]
    if (variantsSheet) {
      const variantsRows = await variantsSheet.getRows()

      for (const row of variantsRows) {
        const productId = Number.parseInt(row.get("productId") || "0")
        const product = products.find((p) => p.id === productId)

        if (product) {
          if (!product.variants) {
            product.variants = []
          }

          product.variants.push({
            productId,
            size: row.get("size") || undefined,
            color: row.get("color") || undefined,
            stock: Number.parseInt(row.get("stock") || "0"),
            variantId:
              row.get("variantId") || `${productId}-${row.get("size") || "no-size"}-${row.get("color") || "no-color"}`,
          })
        }
      }
    }

    return products
  } catch (error) {
    console.error("Error fetching products from Google Sheet:", error)
    throw error
  }
}

export async function submitOrder(formData: FormData) {
  try {
    // Extract form data
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const deliveryMethod = formData.get("deliveryMethod") as string
    const address = formData.get("address") as string
    const city = formData.get("city") as string
    const state = formData.get("state") as string
    const zipCode = formData.get("zipCode") as string
    const country = formData.get("country") as string
    const notes = formData.get("notes") as string
    const proofOfPaymentFile = formData.get("proofOfPayment") as File

    // Parse cart items and recalculate with discounts
    const cartItemsString = formData.get("cartItems") as string
    const originalCartItems = JSON.parse(cartItemsString)

    // Fetch current product data to get latest prices and discounts
    const products = await getProductsFromGoogleSheet()

    // Recalculate cart items with current prices and discounts
    const cartItems: CartItem[] = originalCartItems.map((item: any) => {
      const product = products.find((p) => p.id === item.id)
      if (!product) {
        throw new Error(`Product with ID ${item.id} not found`)
      }

      const originalPrice = product.price
      const discountedPrice = calculateDiscountedPrice(originalPrice, product.discount)

      return {
        id: item.id,
        name: item.name,
        price: discountedPrice, // Use discounted price
        originalPrice: originalPrice,
        discount: product.discount,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        image: item.image,
      }
    })

    // Recalculate totals with discounted prices
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

    // Calculate shipping cost
    let shippingCost = 0
    if (deliveryMethod === "delivery") {
      if (itemCount >= 1 && itemCount <= 3) shippingCost = 6.19
      else if (itemCount >= 4 && itemCount <= 7) shippingCost = 7.69
      else shippingCost = 10.49
    }

    const totalAmount = subtotal + shippingCost

    // Generate order ID
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Upload proof of payment to Google Drive
    let proofOfPaymentUrl = ""
    try {
      proofOfPaymentUrl = await uploadProofOfPaymentToDrive(proofOfPaymentFile, orderId)
    } catch (error) {
      console.error("Error uploading proof of payment:", error)
      // Continue with order processing even if upload fails
    }

    // Prepare order data
    const orderData: OrderData = {
      orderId,
      customerName: `${firstName} ${lastName}`,
      customerEmail: email,
      customerPhone: phone,
      deliveryMethod,
      deliveryAddress:
        deliveryMethod === "delivery" ? `${address}, ${city}, ${state} ${zipCode}, ${country}` : "Pickup in Aachen",
      subtotal,
      shippingCost,
      totalAmount,
      itemCount,
      orderDate: new Date().toISOString(),
      proofOfPaymentUrl,
    }

    // Prepare order items data
    const orderItemsData: OrderItemData[] = cartItems.map((item) => ({
      orderId,
      productId: item.id,
      productName: item.name,
      price: item.price,
      originalPrice: item.originalPrice,
      discount: item.discount,
      quantity: item.quantity,
      selectedSize: item.selectedSize,
      selectedColor: item.selectedColor,
      subtotal: item.price * item.quantity,
    }))

    // Save to Google Sheets
    const auth = new GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, auth)
    await doc.loadInfo()

    // Save to Orders sheet
    const ordersSheet = doc.sheetsByTitle["Orders"]
    if (ordersSheet) {
      await ordersSheet.addRow({
        orderId: orderData.orderId,
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        customerPhone: orderData.customerPhone,
        deliveryMethod: orderData.deliveryMethod,
        deliveryAddress: orderData.deliveryAddress,
        subtotal: orderData.subtotal.toFixed(2),
        shippingCost: orderData.shippingCost.toFixed(2),
        totalAmount: orderData.totalAmount.toFixed(2),
        itemCount: orderData.itemCount,
        orderDate: orderData.orderDate,
        proofOfPaymentUrl: orderData.proofOfPaymentUrl,
        notes: notes || "",
      })
    }

    // Save to Order Items sheet
    const orderItemsSheet = doc.sheetsByTitle["Order Items"]
    if (orderItemsSheet) {
      for (const item of orderItemsData) {
        await orderItemsSheet.addRow({
          orderId: item.orderId,
          productId: item.productId,
          productName: item.productName,
          price: item.price.toFixed(2),
          originalPrice: item.originalPrice?.toFixed(2) || item.price.toFixed(2),
          discount: item.discount || 0,
          quantity: item.quantity,
          selectedSize: item.selectedSize || "",
          selectedColor: item.selectedColor || "",
          subtotal: item.subtotal.toFixed(2),
        })
      }
    }

    // Update stock levels
    for (const item of cartItems) {
      const product = products.find((p) => p.id === item.id)
      if (!product) continue

      if (product.variants && product.variants.length > 0) {
        // Update variant stock
        const variant = product.variants.find((v) => v.size === item.selectedSize && v.color === item.selectedColor)
        if (variant) {
          const variantsSheet = doc.sheetsByTitle["Variants"]
          if (variantsSheet) {
            const variantRows = await variantsSheet.getRows()
            const variantRow = variantRows.find((row) => row.get("variantId") === variant.variantId)
            if (variantRow) {
              const currentStock = Number.parseInt(variantRow.get("stock") || "0")
              const newStock = Math.max(0, currentStock - item.quantity)
              variantRow.set("stock", newStock.toString())
              await variantRow.save()
            }
          }
        }
      } else {
        // Update main product stock
        const productsSheet = doc.sheetsByTitle["Products"]
        if (productsSheet) {
          const productRows = await productsSheet.getRows()
          const productRow = productRows.find((row) => Number.parseInt(row.get("id") || "0") === item.id)
          if (productRow) {
            const currentStock = Number.parseInt(productRow.get("stock") || "0")
            const newStock = Math.max(0, currentStock - item.quantity)
            productRow.set("stock", newStock.toString())
            await productRow.save()
          }
        }
      }
    }

    // Send email notifications
    try {
      if (!process.env.RESEND_API_KEY) {
        throw new Error("RESEND_API_KEY not configured")
      }

      // Generate PDF receipt
      const pdfBuffer = await generateOrderPDF(orderData, orderItemsData)

      // Send customer confirmation email
      await resend.emails.send({
        from: "Aachen Studio <orders@aachenstudio.com>",
        to: [email],
        subject: `Order Confirmation - ${orderId}`,
        html: `
          <h2>Thank you for your order!</h2>
          <p>Dear ${firstName} ${lastName},</p>
          <p>We have received your order <strong>${orderId}</strong> and will process it shortly.</p>
          
          <h3>Order Summary:</h3>
          <ul>
            ${cartItems
              .map(
                (item) => `
              <li>
                ${item.name}${item.selectedSize ? ` (Size: ${item.selectedSize})` : ""}${item.selectedColor ? ` (Color: ${item.selectedColor})` : ""} 
                - Quantity: ${item.quantity} 
                - €${item.price.toFixed(2)} each
                ${item.discount ? ` <span style="color: #666; text-decoration: line-through;">€${item.originalPrice?.toFixed(2)}</span>` : ""}
              </li>
            `,
              )
              .join("")}
          </ul>
          
          <p><strong>Subtotal:</strong> €${subtotal.toFixed(2)}</p>
          <p><strong>Shipping:</strong> €${shippingCost.toFixed(2)}</p>
          <p><strong>Total:</strong> €${totalAmount.toFixed(2)}</p>
          
          <p><strong>Delivery Method:</strong> ${deliveryMethod === "pickup" ? "Pickup in Aachen" : "Delivery"}</p>
          ${deliveryMethod === "delivery" ? `<p><strong>Delivery Address:</strong> ${address}, ${city}, ${state} ${zipCode}, ${country}</p>` : ""}
          
          <p>We will contact you within 24 hours to confirm your order and arrange ${deliveryMethod === "pickup" ? "pickup" : "delivery"}.</p>
          
          <p>Best regards,<br>Aachen Studio Team</p>
        `,
        attachments: [
          {
            filename: `receipt-${orderId}.pdf`,
            content: pdfBuffer,
          },
        ],
      })

      // Send admin notification email
      await resend.emails.send({
        from: "Aachen Studio <orders@aachenstudio.com>",
        to: ["admin@aachenstudio.com"],
        subject: `New Order Received - ${orderId}`,
        html: `
          <h2>New Order Received</h2>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Customer:</strong> ${firstName} ${lastName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Total:</strong> €${totalAmount.toFixed(2)}</p>
          <p><strong>Delivery Method:</strong> ${deliveryMethod}</p>
          ${deliveryMethod === "delivery" ? `<p><strong>Address:</strong> ${address}, ${city}, ${state} ${zipCode}, ${country}</p>` : ""}
          ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ""}
          
          <h3>Items:</h3>
          <ul>
            ${cartItems
              .map(
                (item) => `
              <li>
                ${item.name}${item.selectedSize ? ` (Size: ${item.selectedSize})` : ""}${item.selectedColor ? ` (Color: ${item.selectedColor})` : ""} 
                - Quantity: ${item.quantity} 
                - €${item.price.toFixed(2)} each
                ${item.discount ? ` (${item.discount}% discount applied)` : ""}
              </li>
            `,
              )
              .join("")}
          </ul>
          
          ${proofOfPaymentUrl ? `<p><strong>Proof of Payment:</strong> <a href="${proofOfPaymentUrl}">View File</a></p>` : ""}
        `,
        attachments: [
          {
            filename: `receipt-${orderId}.pdf`,
            content: pdfBuffer,
          },
        ],
      })
    } catch (emailError) {
      console.error("Email sending failed:", emailError)

      // Send fallback notification
      try {
        await sendFallbackNotification(orderData, orderItemsData)
      } catch (fallbackError) {
        console.error("Fallback notification failed:", fallbackError)
      }

      // Return success but indicate email issue
      return {
        success: true,
        orderId,
        message: "Order submitted successfully, but email notifications may not have been sent.",
        orderData,
        orderItemsData,
        error: `Email error: ${emailError instanceof Error ? emailError.message : "Unknown email error"}`,
      }
    }

    return {
      success: true,
      orderId,
      message: "Order submitted successfully!",
      orderData,
      orderItemsData,
    }
  } catch (error) {
    console.error("Error submitting order:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function submitPOSOrder(formData: FormData) {
  try {
    const customerName = formData.get("customerName") as string
    const customerContact = formData.get("customerContact") as string
    const deliveryAddress = formData.get("deliveryAddress") as string
    const proofOfPaymentFile = formData.get("proofOfPayment") as File
    const cartItemsString = formData.get("cartItems") as string
    const totalAmountString = formData.get("totalAmount") as string

    // Parse cart items and recalculate with discounts
    const originalCartItems = JSON.parse(cartItemsString)

    // Fetch current product data to get latest prices and discounts
    const products = await getProductsFromGoogleSheet()

    // Recalculate cart items with current prices and discounts
    const cartItems: CartItem[] = originalCartItems.map((item: any) => {
      const product = products.find((p) => p.id === item.id)
      if (!product) {
        throw new Error(`Product with ID ${item.id} not found`)
      }

      const originalPrice = product.price
      const discountedPrice = calculateDiscountedPrice(originalPrice, product.discount)

      return {
        id: item.id,
        name: item.name,
        price: discountedPrice, // Use discounted price
        originalPrice: originalPrice,
        discount: product.discount,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        image: item.image,
      }
    })

    // Recalculate total with discounted prices
    const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

    // Generate order ID
    const orderId = `POS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Upload proof of payment to Google Drive
    let proofOfPaymentUrl = ""
    try {
      proofOfPaymentUrl = await uploadProofOfPaymentToDrive(proofOfPaymentFile, orderId)
    } catch (error) {
      console.error("Error uploading proof of payment:", error)
    }

    // Save to Google Sheets
    const auth = new GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, auth)
    await doc.loadInfo()

    // Save to Orders sheet
    const ordersSheet = doc.sheetsByTitle["Orders"]
    if (ordersSheet) {
      await ordersSheet.addRow({
        orderId,
        customerName,
        customerEmail: customerContact.includes("@") ? customerContact : "",
        customerPhone: customerContact.includes("@") ? "" : customerContact,
        deliveryMethod: "POS Sale",
        deliveryAddress,
        subtotal: totalAmount.toFixed(2),
        shippingCost: "0.00",
        totalAmount: totalAmount.toFixed(2),
        itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        orderDate: new Date().toISOString(),
        proofOfPaymentUrl,
        notes: "POS Sale",
      })
    }

    // Save to Order Items sheet
    const orderItemsSheet = doc.sheetsByTitle["Order Items"]
    if (orderItemsSheet) {
      for (const item of cartItems) {
        await orderItemsSheet.addRow({
          orderId,
          productId: item.id,
          productName: item.name,
          price: item.price.toFixed(2),
          originalPrice: item.originalPrice?.toFixed(2) || item.price.toFixed(2),
          discount: item.discount || 0,
          quantity: item.quantity,
          selectedSize: item.selectedSize || "",
          selectedColor: item.selectedColor || "",
          subtotal: (item.price * item.quantity).toFixed(2),
        })
      }
    }

    // Update stock levels
    for (const item of cartItems) {
      const product = products.find((p) => p.id === item.id)
      if (!product) continue

      if (product.variants && product.variants.length > 0) {
        // Update variant stock
        const variant = product.variants.find((v) => v.size === item.selectedSize && v.color === item.selectedColor)
        if (variant) {
          const variantsSheet = doc.sheetsByTitle["Variants"]
          if (variantsSheet) {
            const variantRows = await variantsSheet.getRows()
            const variantRow = variantRows.find((row) => row.get("variantId") === variant.variantId)
            if (variantRow) {
              const currentStock = Number.parseInt(variantRow.get("stock") || "0")
              const newStock = Math.max(0, currentStock - item.quantity)
              variantRow.set("stock", newStock.toString())
              await variantRow.save()
            }
          }
        }
      } else {
        // Update main product stock
        const productsSheet = doc.sheetsByTitle["Products"]
        if (productsSheet) {
          const productRows = await productsSheet.getRows()
          const productRow = productRows.find((row) => Number.parseInt(row.get("id") || "0") === item.id)
          if (productRow) {
            const currentStock = Number.parseInt(productRow.get("stock") || "0")
            const newStock = Math.max(0, currentStock - item.quantity)
            productRow.set("stock", newStock.toString())
            await productRow.save()
          }
        }
      }
    }

    return {
      success: true,
      orderId,
      message: "POS order submitted successfully!",
    }
  } catch (error) {
    console.error("Error submitting POS order:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
