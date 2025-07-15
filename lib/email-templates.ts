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

export function generateCustomerConfirmationEmailHtml(
  orderData: OrderData,
  orderItems: OrderItemData[],
): string {
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

  return `
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
              <strong>Instagram:</strong> <a href="https://instagram.com/aachen.studio" style="color: #16a34a; text-decoration: none;">
