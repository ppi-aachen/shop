import { appendFileSync } from "fs"
import { join } from "path"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  description?: string
  selectedSize?: string
  selectedColor?: string
}

interface OrderData {
  orderId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  deliveryAddress: string
  cartItems: string // JSON string of cart items
  totalAmount: string
  proofOfPaymentUrl: string
  pdfReceiptUrl: string
  orderDate: string
}

const LOG_FILE_PATH = join(process.cwd(), "order_log.txt")

export function logOrderForManualProcessing(orderData: OrderData, cartItems: CartItem[]) {
  const logEntry = `
--- MANUAL PROCESSING REQUIRED ---
Order ID: ${orderData.orderId}
Date: ${orderData.orderDate}
Customer Name: ${orderData.customerName}
Customer Email: ${orderData.customerEmail}
Customer Phone: ${orderData.customerPhone}
Delivery Address: ${orderData.deliveryAddress}
Total Amount: €${Number.parseFloat(orderData.totalAmount).toFixed(2)}
Proof of Payment URL: ${orderData.proofOfPaymentUrl}
PDF Receipt URL: ${orderData.pdfReceiptUrl}
Items:
${cartItems
  .map(
    (item) =>
      `  - ${item.name} (ID: ${item.id}, Qty: ${item.quantity}, Price: €${item.price.toFixed(2)}${
        item.selectedSize ? `, Size: ${item.selectedSize}` : ""
      }${item.selectedColor ? `, Color: ${item.selectedColor}` : ""})`,
  )
  .join("\n")}
----------------------------------
`
  try {
    appendFileSync(LOG_FILE_PATH, logEntry)
    console.log(`Order ${orderData.orderId} logged for manual processing to ${LOG_FILE_PATH}`)
  } catch (error) {
    console.error(`Failed to write order ${orderData.orderId} to log file:`, error)
  }
}

export function generatePlainTextCustomerEmail(orderData: OrderData, cartItems: CartItem[]): string {
  const itemsList = cartItems
    .map(
      (item) =>
        `- ${item.name} (Qty: ${item.quantity}, Price: €${item.price.toFixed(2)}${
          item.selectedSize ? `, Size: ${item.selectedSize}` : ""
        }${item.selectedColor ? `, Color: ${item.selectedColor}` : ""})`,
    )
    .join("\n")

  return `
Subject: Order Confirmation - ${orderData.orderId} | Aachen Studio

Dear ${orderData.customerName},

Thank you for your order! We have received your order and proof of payment.
We will process your order within 24 hours and keep you updated on the progress.

Order Details:
Order ID: ${orderData.orderId}
Date: ${orderData.orderDate}
Total Amount: €${Number.parseFloat(orderData.totalAmount).toFixed(2)}

Items Ordered:
${itemsList}

Proof of Payment: ${orderData.proofOfPaymentUrl}
PDF Receipt: ${orderData.pdfReceiptUrl}

Questions about your order?
Email: funding@ppiaachen.de
Instagram: @aachen.studio

Thank you for supporting Indonesian culture through Aachen Studio!
PPI Aachen - Connecting Indonesian heritage with modern style
`
}

export async function fallbackSendOrderConfirmationEmail(
  customerEmail: string,
  customerName: string,
  orderId: string,
  cartItems: CartItem[],
  totalAmount: string,
  pdfReceiptUrl: string,
) {
  console.warn(`FALLBACK: Attempting to send customer email to ${customerEmail} for order ${orderId}`)
  console.log("--- CUSTOMER EMAIL CONTENT (Plain Text) ---")
  console.log(
    generatePlainTextCustomerEmail(
      {
        orderId,
        customerName,
        customerEmail,
        customerPhone: "", // Not available in this fallback context
        deliveryAddress: "", // Not available in this fallback context
        cartItems: JSON.stringify(cartItems),
        totalAmount,
        proofOfPaymentUrl: "", // Not available in this fallback context
        pdfReceiptUrl,
        orderDate: new Date().toISOString(),
      },
      cartItems,
    ),
  )
  console.log("--- END CUSTOMER EMAIL CONTENT ---")
  console.warn("Please manually send the above email content to the customer.")
}

export async function fallbackSendBusinessNotificationEmail(
  orderId: string,
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  deliveryAddress: string,
  cartItems: CartItem[],
  totalAmount: string,
  proofOfPaymentUrl: string,
  pdfReceiptUrl: string,
) {
  console.warn(`FALLBACK: Attempting to send business notification for order ${orderId}`)
  const itemsList = cartItems
    .map(
      (item) =>
        `- ${item.name} (Qty: ${item.quantity}, Price: €${item.price.toFixed(2)}${
          item.selectedSize ? `, Size: ${item.selectedSize}` : ""
        }${item.selectedColor ? `, Color: ${item.selectedColor}` : ""})`,
    )
    .join("\n")

  const businessEmailContent = `
Subject: 🚨 NEW ORDER: ${orderId} - €${Number.parseFloat(totalAmount).toFixed(2)} | Action Required

--- ACTION REQUIRED ---
Please review the proof of payment and process this order within 24 hours.

Customer Information:
Name: ${customerName}
Email: ${customerEmail}
Phone: ${customerPhone}
Delivery Address: ${deliveryAddress}

Order Details:
Order ID: ${orderId}
Date: ${new Date().toISOString()}
Total Amount: €${Number.parseFloat(totalAmount).toFixed(2)}

Items Ordered:
${itemsList}

Payment Information:
Proof of Payment URL: ${proofOfPaymentUrl}
PDF Receipt URL: ${pdfReceiptUrl}

Quick Actions:
Email Customer: mailto:${customerEmail}?subject=Order Update - ${orderId}
Call Customer: tel:${customerPhone}
View Payment: ${proofOfPaymentUrl}
View Receipt: ${pdfReceiptUrl}
`
  console.log("--- BUSINESS NOTIFICATION CONTENT (Plain Text) ---")
  console.log(businessEmailContent)
  console.log("--- END BUSINESS NOTIFICATION CONTENT ---")
  console.warn("Please manually process this order and send notifications.")
}
