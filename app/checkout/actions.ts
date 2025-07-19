"use server"

import { Resend } from "resend"
import { uploadFileToGoogleDrive } from "@/lib/google-drive-upload"
import { getProductsFromSheet, updateProductStockInSheet, appendOrderToSheet } from "@/lib/google-sheets-api"
import { generatePdfReceipt } from "@/lib/pdf-generator"
import { sendOrderConfirmationEmail, sendBusinessNotificationEmail } from "@/lib/email-templates"
import { fallbackSendOrderConfirmationEmail, fallbackSendBusinessNotificationEmail } from "@/lib/fallback-notifications"

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY)

// Google Sheets configuration
export const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID
export const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
export const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n") || "" // Ensure it's a string

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
  stock: number // Ensure stock is part of CartItem interface
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
  stock: number
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

export async function submitOrder(formData: FormData) {
  const customerName = formData.get("customerName") as string
  const customerEmail = formData.get("customerEmail") as string
  const customerPhone = formData.get("customerPhone") as string
  const deliveryAddress = formData.get("deliveryAddress") as string
  const proofOfPayment = formData.get("proofOfPayment") as File
  const cartItemsString = formData.get("cartItems") as string
  const orderId = formData.get("orderId") as string
  const totalAmount = formData.get("totalAmount") as string

  if (
    !customerName ||
    !customerEmail ||
    !customerPhone ||
    !deliveryAddress ||
    !proofOfPayment ||
    !cartItemsString ||
    !orderId ||
    !totalAmount
  ) {
    return { success: false, message: "Missing required form data." }
  }

  let cartItems: any[]
  try {
    cartItems = JSON.parse(cartItemsString)
  } catch (error) {
    console.error("Failed to parse cart items:", error)
    return { success: false, message: "Invalid cart data." }
  }

  if (proofOfPayment.size === 0) {
    return { success: false, message: "Proof of payment file is empty." }
  }

  try {
    // Upload proof of payment to Google Drive
    const driveFileUrl = await uploadFileToGoogleDrive(proofOfPayment, orderId)

    // Generate PDF receipt
    const pdfBuffer = await generatePdfReceipt({
      orderId,
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      cartItems,
      totalAmount,
      proofOfPaymentUrl: driveFileUrl,
    })

    // Upload PDF receipt to Google Drive
    const pdfFileName = `receipt-${orderId}.pdf`
    const pdfFile = new File([pdfBuffer], pdfFileName, { type: "application/pdf" })
    const pdfDriveUrl = await uploadFileToGoogleDrive(pdfFile, orderId)

    // Prepare data for Google Sheet
    const orderData = {
      orderId,
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      cartItems: JSON.stringify(cartItems),
      totalAmount,
      proofOfPaymentUrl: driveFileUrl,
      pdfReceiptUrl: pdfDriveUrl,
      orderDate: new Date().toISOString(),
    }

    // Append order to Google Sheet
    await appendOrderToSheet(orderData)

    // Update stock in Google Sheet
    const products = await getProductsFromSheet()
    for (const item of cartItems) {
      const product = products.find((p) => p.ID === item.id)
      if (product) {
        const newStock = (Number.parseInt(product.Stock) || 0) - item.quantity
        await updateProductStockInSheet(item.id, newStock)
      }
    }

    // Send customer confirmation email
    try {
      await sendOrderConfirmationEmail(
        resend,
        customerEmail,
        customerName,
        orderId,
        cartItems,
        totalAmount,
        pdfDriveUrl,
      )
    } catch (emailError) {
      console.error("Failed to send customer email via Resend, falling back:", emailError)
      await fallbackSendOrderConfirmationEmail(
        customerEmail,
        customerName,
        orderId,
        cartItems,
        totalAmount,
        pdfDriveUrl,
      )
    }

    // Send business notification email
    try {
      await sendBusinessNotificationEmail(
        resend,
        orderId,
        customerName,
        customerEmail,
        customerPhone,
        deliveryAddress,
        cartItems,
        totalAmount,
        driveFileUrl,
        pdfDriveUrl,
      )
    } catch (emailError) {
      console.error("Failed to send business email via Resend, falling back:", emailError)
      await fallbackSendBusinessNotificationEmail(
        orderId,
        customerName,
        customerEmail,
        customerPhone,
        deliveryAddress,
        cartItems,
        totalAmount,
        driveFileUrl,
        pdfDriveUrl,
      )
    }

    return { success: true, message: "Order submitted successfully!", orderId }
  } catch (error: any) {
    console.error("Order submission failed:", error)
    return { success: false, message: error.message || "Failed to submit order." }
  }
}
