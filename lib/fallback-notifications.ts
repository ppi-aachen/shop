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

export function logOrderForManualProcessing(orderData: OrderData, orderItems: OrderItemData[]) {
  console.log("=".repeat(60))
  console.log("📧 EMAIL SERVICE UNAVAILABLE - MANUAL PROCESSING REQUIRED")
  console.log("=".repeat(60))
  console.log("")
  console.log("🚨 NEW ORDER RECEIVED:")
  console.log(`Order ID: ${orderData.orderId}`)
  console.log(`Date: ${orderData.date} ${orderData.time}`)
  console.log(`Total: €${orderData.totalAmount.toFixed(2)}`)
  console.log("")
  console.log("👤 CUSTOMER INFORMATION:")
  console.log(`Name: ${orderData.customerName}`)
  console.log(`Email: ${orderData.email}`)
  console.log(`Phone: ${orderData.phone}`)
  console.log(`Delivery: ${orderData.deliveryMethod}`)

  if (orderData.deliveryMethod === "delivery") {
    console.log("")
    console.log("📍 DELIVERY ADDRESS:")
    console.log(`${orderData.address}`)
    console.log(`${orderData.city}, ${orderData.state} ${orderData.zipCode}`)
    console.log(`${orderData.country}`)
  }

  console.log("")
  console.log("📦 ORDER ITEMS:")
  orderItems.forEach((item, index) => {
    console.log(`${index + 1}. ${item.productName}`)
    console.log(`   Price: €${item.price.toFixed(2)} x ${item.quantity} = €${item.subtotal.toFixed(2)}`)
    if (item.selectedSize) console.log(`   Size: ${item.selectedSize}`)
    if (item.selectedColor) console.log(`   Color: ${item.selectedColor}`)
  })

  console.log("")
  console.log("💰 PAYMENT:")
  console.log(`Subtotal: €${orderData.subtotal.toFixed(2)}`)
  console.log(`Shipping: €${orderData.shippingCost.toFixed(2)}`)
  console.log(`Total: €${orderData.totalAmount.toFixed(2)}`)
  console.log(`Proof: ${orderData.proofOfPaymentUrl}`)

  if (orderData.notes) {
    console.log("")
    console.log("📝 CUSTOMER NOTES:")
    console.log(`"${orderData.notes}"`)
  }

  console.log("")
  console.log("⚡ ACTION REQUIRED:")
  console.log("1. Manually send confirmation email to customer")
  console.log("2. Review proof of payment")
  console.log("3. Process order within 24 hours")
  console.log("4. Contact customer for pickup/delivery arrangement")
  console.log("")
  console.log("=".repeat(60))
}

export function generatePlainTextCustomerEmail(orderData: OrderData, orderItems: OrderItemData[]): string {
  const itemsList = orderItems
    .map(
      (item, index) =>
        `${index + 1}. ${item.productName}${item.selectedSize ? ` (Size: ${item.selectedSize})` : ""}${item.selectedColor ? ` (Color: ${item.selectedColor})` : ""}\n   €${item.price.toFixed(2)} x ${item.quantity} = €${item.subtotal.toFixed(2)}`,
    )
    .join("\n")

  return `
Subject: Order Confirmation - ${orderData.orderId} | Aachen Studio

Dear ${orderData.customerName},

Thank you for your order! We have received your order and proof of payment. We will process your order within 24 hours and keep you updated on the progress.

ORDER DETAILS:
Order ID: ${orderData.orderId}
Date: ${orderData.date} at ${orderData.time}
Delivery Method: ${orderData.deliveryMethod === "pickup" ? "Pickup in Aachen" : "Delivery"}

ITEMS ORDERED:
${itemsList}

TOTAL:
Subtotal: €${orderData.subtotal.toFixed(2)}
${orderData.deliveryMethod === "pickup" ? "Pickup" : "Delivery"}: €${orderData.shippingCost.toFixed(2)}
Total: €${orderData.totalAmount.toFixed(2)}

${
  orderData.deliveryMethod === "pickup"
    ? "PICKUP INFORMATION:\nWe will contact you within 24 hours to arrange the pickup location and time in Aachen. Please keep your phone available for our call."
    : `DELIVERY INFORMATION:\nYour order will be shipped to:\n${orderData.address}\n${orderData.city}, ${orderData.state} ${orderData.zipCode}\n${orderData.country}\n\nYou will receive tracking information once your order has been shipped.`
}

WHAT HAPPENS NEXT:
1. We verify your proof of payment
2. Your order enters production/preparation
3. We ${orderData.deliveryMethod === "pickup" ? "contact you for pickup" : "ship your order"}
4. You receive your authentic Indonesian-inspired items!

Questions about your order?
Email: funding@ppiaachen.de

Thank you for supporting Indonesian culture through Aachen Studio!
PPI Aachen - Connecting Indonesian heritage with modern style
  `.trim()
}
