import { appendFileSync, existsSync, mkdirSync } from "fs"
import path from "path"

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

const LOG_DIR = path.join(process.cwd(), "logs")
const FALLBACK_LOG_FILE = path.join(LOG_DIR, "fallback_orders.log")

// Ensure log directory exists
if (!existsSync(LOG_DIR)) {
  mkdirSync(LOG_DIR, { recursive: true })
}

export function logOrderForManualProcessing(orderData: OrderData, orderItems: OrderItemData[]) {
  const logEntry = `
--- MANUAL PROCESSING REQUIRED ---
Timestamp: ${new Date().toISOString()}
Order ID: ${orderData.orderId}
Customer Name: ${orderData.customerName}
Customer Email: ${orderData.email}
Customer Phone: ${orderData.phone}
Delivery Method: ${orderData.deliveryMethod}
Delivery Address: ${orderData.deliveryMethod === "delivery" ? `${orderData.address}, ${orderData.city}, ${orderData.state} ${orderData.zipCode}, ${orderData.country}` : "Pickup in Aachen"}
Total Amount: €${orderData.totalAmount.toFixed(2)}
Proof of Payment URL: ${orderData.proofOfPaymentUrl}
Notes: ${orderData.notes || "N/A"}

Items:
${orderItems.map((item) => `  - ${item.productName} (Qty: ${item.quantity}, Price: €${item.price.toFixed(2)}, Subtotal: €${item.subtotal.toFixed(2)}) ${item.selectedSize ? `Size: ${item.selectedSize}` : ""}${item.selectedColor ? ` Color: ${item.selectedColor}` : ""}`).join("\n")}
----------------------------------
`
  try {
    appendFileSync(FALLBACK_LOG_FILE, logEntry + "\n")
    console.log(`Order ${orderData.orderId} logged for manual processing in ${FALLBACK_LOG_FILE}`)
  } catch (error) {
    console.error(`Failed to write fallback log for order ${orderData.orderId}:`, error)
  }
}

export function generatePlainTextCustomerEmail(orderData: OrderData, orderItems: OrderItemData[]): string {
  const itemsList = orderItems
    .map(
      (item) =>
        `- ${item.productName} (Qty: ${item.quantity}) - EUR${item.subtotal.toFixed(2)}` +
        (item.selectedSize ? `, Size: ${item.selectedSize}` : "") +
        (item.selectedColor ? `, Color: ${item.selectedColor}` : ""),
    )
    .join("\n")

  const deliveryInfo =
    orderData.deliveryMethod === "pickup"
      ? `Pickup Information:
We will contact you within 24 hours to arrange the pickup location and time in Aachen. Please keep your phone available for our call.`
      : `Delivery Information:
Your order will be shipped to:
${orderData.address}
${orderData.city}, ${orderData.state} ${orderData.zipCode}
${orderData.country}
You will receive tracking information once your order has been shipped.`

  return `Subject: Order Confirmation - ${orderData.orderId} | Aachen Studio

Dear ${orderData.customerName},

Thank you for your order! We have received your order and proof of payment.
We will process your order within 24 hours and keep you updated on the progress.

--- Order Details ---
Order ID: ${orderData.orderId}
Date: ${orderData.date} at ${orderData.time}
Delivery Method: ${orderData.deliveryMethod === "pickup" ? "Pickup in Aachen" : "Delivery"}

--- Items Ordered ---
${itemsList}

--- Payment Summary ---
Subtotal: EUR${orderData.subtotal.toFixed(2)}
${orderData.deliveryMethod === "pickup" ? "Pickup" : "Delivery"} Cost: EUR${orderData.shippingCost.toFixed(2)}
Total Amount: EUR${orderData.totalAmount.toFixed(2)}

--- ${deliveryInfo} ---

Proof of Payment Link: ${orderData.proofOfPaymentUrl}

Questions about your order?
Email: funding@ppiaachen.de
Instagram: @aachen.studio

Thank you for supporting Indonesian culture through Aachen Studio!
PPI Aachen - Connecting Indonesian heritage with modern style
`
}
