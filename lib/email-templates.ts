import type { Resend } from "resend"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  description?: string
  selectedSize?: string
  selectedColor?: string
}

export async function sendOrderConfirmationEmail(
  resend: Resend,
  customerEmail: string,
  customerName: string,
  orderId: string,
  cartItems: CartItem[],
  totalAmount: string,
  pdfReceiptUrl: string,
) {
  const itemsTable = cartItems
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          ${item.selectedSize ? `Size: ${item.selectedSize}` : ""}
          ${item.selectedColor ? `${item.selectedSize ? ", " : ""}Color: ${item.selectedColor}` : ""}
          ${!item.selectedSize && !item.selectedColor ? "-" : ""}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">€${item.price.toFixed(2)}</td>
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
        <title>Order Confirmation - ${orderId}</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Aachen Studio</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">by PPI Aachen</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          
          <h2 style="color: #16a34a; margin-top: 0; font-size: 24px;">Order Confirmation</h2>
          
          <p style="font-size: 16px; margin-bottom: 25px;">Dear ${customerName},</p>
          
          <p style="font-size: 16px; margin-bottom: 25px;">
            Thank you for your order! We have received your order and proof of payment. 
            We will process your order within 24 hours and keep you updated on the progress.
          </p>
          
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #1e293b; font-size: 18px;">Order Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: 600;">Order ID:</td>
                <td style="padding: 8px 0;">${orderId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600;">Date:</td>
                <td style="padding: 8px 0;">${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</td>
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
              <tr style="border-top: 2px solid #16a34a;">
                <td style="padding: 15px 0 5px 0; font-size: 20px; font-weight: bold; color: #16a34a;">Total:</td>
                <td style="padding: 15px 0 5px 0; text-align: right; font-size: 20px; font-weight: bold; color: #16a34a;">€${Number.parseFloat(totalAmount).toFixed(2)}</td>
              </tr>
            </table>
          </div>
          
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
    to: [customerEmail],
    subject: `Order Confirmation - ${orderId} | Aachen Studio`,
    html: emailHtml,
    attachments: [
      {
        filename: `receipt-${orderId}.pdf`,
        path: pdfReceiptUrl, // Resend can fetch from URL
      },
    ],
  })

  if (error) {
    console.error("Error sending customer email:", error)
    throw new Error(error.message)
  }

  console.log("Customer confirmation email sent successfully:", data)
}

export async function sendBusinessNotificationEmail(
  resend: Resend,
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
  const itemsTable = cartItems
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          ${item.selectedSize ? `Size: ${item.selectedSize}` : ""}
          ${item.selectedColor ? `${item.selectedSize ? ", " : ""}Color: ${item.selectedColor}` : ""}
          ${!item.selectedSize && !item.selectedColor ? "-" : ""}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">€${item.price.toFixed(2)}</td>
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
        <title>New Order - ${orderId}</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px;">
        
        <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 25px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold;">🚨 NEW ORDER RECEIVED</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 18px;">${orderId}</p>
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
                <td style="padding: 8px 0;">${customerName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600;">Email:</td>
                <td style="padding: 8px 0;"><a href="mailto:${customerEmail}" style="color: #16a34a;">${customerEmail}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600;">Phone:</td>
                <td style="padding: 8px 0;"><a href="tel:${customerPhone}" style="color: #16a34a;">${customerPhone}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600;">Delivery Address:</td>
                <td style="padding: 8px 0;">${deliveryAddress}</td>
              </tr>
            </table>
          </div>
          
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
              <tr style="border-top: 2px solid #dc2626;">
                <td style="padding: 15px 0 5px 0; font-size: 20px; font-weight: bold; color: #dc2626;">TOTAL AMOUNT:</td>
                <td style="padding: 15px 0 5px 0; text-align: right; font-size: 20px; font-weight: bold; color: #dc2626;">€${Number.parseFloat(totalAmount).toFixed(2)}</td>
              </tr>
            </table>
            
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #fecaca;">
              <p style="margin: 0; font-weight: 600; color: #dc2626;">
                📎 <a href="${proofOfPaymentUrl}" style="color: #dc2626; text-decoration: underline;" target="_blank">
                  VIEW PROOF OF PAYMENT
                </a>
              </p>
              <p style="margin: 10px 0 0 0; font-weight: 600; color: #dc2626;">
                📄 <a href="${pdfReceiptUrl}" style="color: #dc2626; text-decoration: underline;" target="_blank">
                  VIEW PDF RECEIPT
                </a>
              </p>
            </div>
          </div>
          
          <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px;">
            <h4 style="margin-top: 0; color: #0369a1; font-size: 16px;">🚀 Quick Actions</h4>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <a href="mailto:${customerEmail}?subject=Order Update - ${orderId}" 
                 style="background: #16a34a; color: white; padding: 10px 15px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">
                📧 Email Customer
              </a>
              <a href="tel:${customerPhone}" 
                 style="background: #0ea5e9; color: white; padding: 10px 15px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">
                📞 Call Customer
              </a>
              <a href="${proofOfPaymentUrl}" target="_blank"
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
    to: ["fundraising@ppiaachen.de"], // Replace with your business email
    subject: `🚨 NEW ORDER: ${orderId} - €${Number.parseFloat(totalAmount).toFixed(2)} | Action Required`,
    html: emailHtml,
    attachments: [
      {
        filename: `receipt-${orderId}.pdf`,
        path: pdfReceiptUrl, // Resend can fetch from URL
      },
      {
        filename: `proof-of-payment-${orderId}.jpg`, // Assuming image, adjust if PDF
        path: proofOfPaymentUrl, // Resend can fetch from URL
      },
    ],
  })

  if (error) {
    console.error("Error sending business notification:", error)
    throw new Error(error.message)
  }

  console.log("Business notification email sent successfully:", data)
}
