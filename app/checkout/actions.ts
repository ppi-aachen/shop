"use server"

import { Resend } from "resend"
import { generatePdfReceipt } from "@/lib/pdf-generator"
import { uploadFileToGoogleDrive } from "@/lib/google-drive-upload"
import { getProductsFromSheet, updateProductStockInSheet } from "@/lib/google-sheets-api"
import { formatCurrency } from "@/lib/utils"
import type { OrderItem } from "@/lib/types"

const resend = new Resend(process.env.RESEND_API_KEY)

interface CheckoutFormState {
  success: boolean
  message: string
  orderId?: string
}

export async function processCheckout(prevState: CheckoutFormState, formData: FormData): Promise<CheckoutFormState> {
  try {
    const customerName = formData.get("customerName") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const address = formData.get("address") as string
    const city = formData.get("city") as string
    const state = formData.get("state") as string
    const zipCode = formData.get("zipCode") as string
    const country = formData.get("country") as string
    const deliveryMethod = formData.get("deliveryMethod") as string
    const notes = formData.get("notes") as string
    const cartItemsJson = formData.get("cartItems") as string
    const proofOfPayment = formData.get("proofOfPayment") as File

    if (!proofOfPayment || proofOfPayment.size === 0) {
      return { success: false, message: "Proof of payment is required." }
    }

    const cartItems: OrderItem[] = JSON.parse(cartItemsJson)

    if (!cartItems || cartItems.length === 0) {
      return { success: false, message: "Cart is empty." }
    }

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const shippingCost = deliveryMethod === "delivery" ? 5.0 : 0.0 // Example: flat shipping fee
    const totalAmount = subtotal + shippingCost
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

    // Generate a unique order ID
    const orderIdPrefix = deliveryMethod === "pickup" ? "PU" : "DL"
    const orderId = `${orderIdPrefix}-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`

    const orderData = {
      orderId,
      date: new Date().toLocaleDateString("en-GB"),
      time: new Date().toLocaleTimeString("en-GB"),
      customerName,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      country,
      deliveryMethod,
      totalItems,
      subtotal,
      shippingCost,
      totalAmount,
      notes,
    }

    // 1. Upload proof of payment to Google Drive
    const proofOfPaymentBuffer = Buffer.from(await proofOfPayment.arrayBuffer())
    const proofOfPaymentFileName = `${orderId}_proof_of_payment_${proofOfPayment.name}`
    const proofOfPaymentMimeType = proofOfPayment.type || "application/octet-stream"

    const driveFileLink = await uploadFileToGoogleDrive(
      proofOfPaymentBuffer,
      proofOfPaymentFileName,
      proofOfPaymentMimeType,
    )

    if (!driveFileLink) {
      return { success: false, message: "Failed to upload proof of payment." }
    }

    // 2. Update Google Sheet (reduce stock and add order details)
    const products = await getProductsFromSheet()
    const updatedProducts = products.map((product) => {
      const cartItem = cartItems.find((item) => item.id === product.id)
      if (cartItem) {
        return {
          ...product,
          stock: Math.max(0, product.stock - cartItem.quantity), // Ensure stock doesn't go below 0
        }
      }
      return product
    })

    await updateProductStockInSheet(updatedProducts)

    // Prepare order details for Google Sheet
    const orderDetailsRow = [
      orderId,
      new Date().toISOString(),
      customerName,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      country,
      deliveryMethod,
      totalItems.toString(),
      subtotal.toFixed(2),
      shippingCost.toFixed(2),
      totalAmount.toFixed(2),
      notes,
      driveFileLink, // Link to proof of payment
      "Pending Review", // Initial status
      cartItems
        .map((item) => `${item.name} (x${item.quantity})`)
        .join("; "), // Simple list of items
    ]

    // Assuming you have a function to append a row to the sheet
    // This is a placeholder, you'll need to implement appendOrderToSheet in google-sheets-api.ts
    await updateProductStockInSheet(updatedProducts, orderDetailsRow) // Re-using updateProductStockInSheet for simplicity, but ideally a separate appendOrderToSheet

    // 3. Generate PDF receipt
    const pdfHtml = generatePdfReceipt(orderData, cartItems)

    // 4. Send confirmation email to customer
    await resend.emails.send({
      from: "Aachen Studio <noreply@ppiaachen.de>", // Replace with your verified domain
      to: [email],
      subject: `Order Confirmation #${orderId} - Aachen Studio`,
      html: `
        <p>Dear ${customerName},</p>
        <p>Thank you for your order from Aachen Studio! Your order ID is <strong>${orderId}</strong>.</p>
        <p>We have received your proof of payment and your order is now pending review. We will notify you once it has been processed.</p>
        <p><strong>Order Summary:</strong></p>
        <ul>
          ${cartItems
            .map((item) => `<li>${item.name} (x${item.quantity}) - ${formatCurrency(item.price * item.quantity)}</li>`)
            .join("")}
        </ul>
        <p><strong>Total Amount:</strong> ${formatCurrency(totalAmount)}</p>
        <p>You can view your full receipt <a href="${process.env.NEXT_PUBLIC_VERCEL_URL}/success?orderId=${orderId}">here</a>.</p>
        <p>If you have any questions, please contact us at funding@ppiaachen.de.</p>
        <p>Best regards,<br/>Aachen Studio by PPI Aachen</p>
      `,
    })

    // 5. Send notification email to admin (optional)
    await resend.emails.send({
      from: "Aachen Studio <noreply@ppiaachen.de>",
      to: ["funding@ppiaachen.de"], // Your admin email
      subject: `New Order #${orderId} - Aachen Studio`,
      html: `
        <p>A new order has been placed:</p>
        <ul>
          <li><strong>Order ID:</strong> ${orderId}</li>
          <li><strong>Customer Name:</strong> ${customerName}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Phone:</strong> ${phone}</li>
          <li><strong>Delivery Method:</strong> ${deliveryMethod}</li>
          <li><strong>Total Amount:</strong> ${formatCurrency(totalAmount)}</li>
          <li><strong>Proof of Payment:</strong> <a href="${driveFileLink}">View Proof</a></li>
        </ul>
        <p><strong>Items:</strong></p>
        <ul>
          ${cartItems
            .map((item) => `<li>${item.name} (x${item.quantity}) - ${formatCurrency(item.price * item.quantity)}</li>`)
            .join("")}
        </ul>
        <p>Please review the order and proof of payment.</p>
      `,
    })

    return { success: true, message: "Order placed successfully!", orderId }
  } catch (error) {
    console.error("Checkout error:", error)
    return { success: false, message: `Failed to place order: ${error.message}` }
  }
}
