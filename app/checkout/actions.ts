"use server"

import { Resend } from "resend"
import { uploadProofOfPaymentToDrive } from "@/lib/google-drive-upload"
import { getProductsFromSheet, updateProductStockInSheet } from "@/lib/google-sheets-api"
import { getGoogleSheetsAuth } from "@/lib/google-auth-utils"

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

// getGoogleSheetsAuth and pemToDer functions are now in lib/google-auth-utils.ts

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
                 <strong>${orderData.address}<br>
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

    // --- Server-side Stock Validation ---
    const currentProducts = await getProductsFromSheet()
    const stockErrors: string[] = []
    const productsToUpdateStock: { id: number; newStock: number }[] = []

    for (const cartItem of cartItems) {
      const productInSheet = currentProducts.find((p) => p.id === cartItem.id)

      if (!productInSheet) {
        stockErrors.push(`Product "${cartItem.name}" (ID: ${cartItem.id}) not found in stock database.`)
        continue
      }

      if (productInSheet.stock < cartItem.quantity) {
        stockErrors.push(
          `Insufficient stock for "${cartItem.name}". Requested: ${cartItem.quantity}, Available: ${productInSheet.stock}.`,
        )
      } else {
        productsToUpdateStock.push({
          id: productInSheet.id,
          newStock: productInSheet.stock - cartItem.quantity,
        })
      }
    }

    if (stockErrors.length > 0) {
      return {
        success: false,
        error: "Stock validation failed: " + stockErrors.join("; "),
      }
    }
    // --- End Server-side Stock Validation ---

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

    await Promise.all([
      addOrderToGoogleSheet(orderData),
      addOrderItemsToGoogleSheet(orderItemsData),
      // --- Deduct stock after successful order and item logging ---
      ...productsToUpdateStock.map((p) => updateProductStockInSheet(p.id, p.newStock)),
    ])

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
