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
}

interface OrderItem {
  productName: string
  price: number
  quantity: number
  subtotal: number
  selectedSize?: string
  selectedColor?: string
}

export function generateOrderPDF(orderData: OrderData, orderItems: OrderItem[]): string {
  const itemsRows = orderItems
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.productName}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
          ${item.selectedSize ? `Size: ${item.selectedSize}` : ""}
          ${item.selectedColor ? `${item.selectedSize ? ", " : ""}Color: ${item.selectedColor}` : ""}
          ${!item.selectedSize && !item.selectedColor ? "-" : ""}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">€${item.price.toFixed(2)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">€${item.subtotal.toFixed(2)}</td>
      </tr>
    `,
    )
    .join("")

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Order Receipt - ${orderData.orderId}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
            color: white;
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            margin-bottom: 30px;
          }
          .header h1 {
            margin: 0;
            font-size: 32px;
            font-weight: bold;
          }
          .header p {
            margin: 5px 0 0 0;
            opacity: 0.9;
            font-size: 18px;
          }
          .section {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
          }
          .section h3 {
            margin-top: 0;
            color: #1e293b;
            font-size: 18px;
            border-bottom: 2px solid #16a34a;
            padding-bottom: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          .info-table td {
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .info-table td:first-child {
            font-weight: 600;
            width: 150px;
          }
          .items-table {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
          }
          .items-table th {
            background: #f9fafb;
            padding: 15px 12px;
            text-align: left;
            font-weight: 600;
            border-bottom: 1px solid #e5e7eb;
          }
          .items-table th:nth-child(3),
          .items-table th:nth-child(4),
          .items-table th:nth-child(5) {
            text-align: center;
          }
          .items-table th:nth-child(4),
          .items-table th:nth-child(5) {
            text-align: right;
          }
          .total-section {
            background: #f0fdf4;
            border: 2px solid #bbf7d0;
            border-radius: 8px;
            padding: 20px;
            margin-top: 20px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
            font-size: 16px;
          }
          .total-final {
            border-top: 2px solid #16a34a;
            padding-top: 15px;
            margin-top: 10px;
            font-size: 20px;
            font-weight: bold;
            color: #16a34a;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
          }
          @media print {
            body { margin: 0; padding: 15px; }
            .header { break-inside: avoid; }
            .section { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        
        <!-- Header -->
        <div class="header">
          <h1>Aachen Studio</h1>
          <p>by PPI Aachen</p>
          <div style="margin-top: 20px; font-size: 24px; font-weight: bold;">
            ORDER RECEIPT
          </div>
        </div>
        
        <!-- Order Information -->
        <div class="section">
          <h3>📋 Order Information</h3>
          <table class="info-table">
            <tr>
              <td>Order ID:</td>
              <td><strong>${orderData.orderId}</strong></td>
            </tr>
            <tr>
              <td>Order Type:</td>
              <td><strong>${orderData.orderId.startsWith("PU") ? "🏪 Pickup Order" : orderData.orderId.startsWith("DL") ? "🚚 Delivery Order" : "Standard Order"}</strong></td>
            </tr>
            <tr>
              <td>Date & Time:</td>
              <td>${orderData.date} at ${orderData.time}</td>
            </tr>
            <tr>
              <td>Delivery Method:</td>
              <td>
                <strong>${orderData.deliveryMethod === "pickup" ? "🏪 Pickup in Aachen" : "🚚 Delivery"}</strong>
              </td>
            </tr>
            <tr>
              <td>Status:</td>
              <td><span style="background: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 4px; font-weight: 600;">Pending Review</span></td>
            </tr>
          </table>
        </div>
        
        <!-- Customer Information -->
        <div class="section">
          <h3>👤 Customer Information</h3>
          <table class="info-table">
            <tr>
              <td>Name:</td>
              <td><strong>${orderData.customerName}</strong></td>
            </tr>
            <tr>
              <td>Email:</td>
              <td>${orderData.email}</td>
            </tr>
            <tr>
              <td>Phone:</td>
              <td>${orderData.phone}</td>
            </tr>
          </table>
        </div>
        
        ${
          orderData.deliveryMethod === "delivery"
            ? `
          <!-- Delivery Address -->
          <div class="section">
            <h3>📍 Delivery Address</h3>
            <div style="font-size: 16px; line-height: 1.8;">
              <strong>${orderData.address}</strong><br>
              ${orderData.city}, ${orderData.state} ${orderData.zipCode}<br>
              <strong>${orderData.country}</strong>
            </div>
          </div>
        `
            : `
          <!-- Pickup Information -->
          <div class="section">
            <h3>🏪 Pickup Information</h3>
            <p style="margin: 0; color: #166534; font-weight: 600;">
              We will contact you within 24 hours to arrange the pickup location and time in Aachen.
            </p>
          </div>
        `
        }
        
        <!-- Order Items -->
        <div class="section">
          <h3>📦 Order Items</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Options</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>
        </div>
        
        <!-- Order Total -->
        <div class="total-section">
          <div class="total-row">
            <span>Subtotal (${orderData.totalItems} items):</span>
            <span>€${orderData.subtotal.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>${orderData.deliveryMethod === "pickup" ? "Pickup" : "Delivery"}:</span>
            <span>€${orderData.shippingCost.toFixed(2)}</span>
          </div>
          <div class="total-row total-final">
            <span>TOTAL AMOUNT:</span>
            <span>€${orderData.totalAmount.toFixed(2)}</span>
          </div>
        </div>
        
        ${
          orderData.notes
            ? `
          <!-- Customer Notes -->
          <div class="section">
            <h3>📝 Additional Notes</h3>
            <p style="margin: 0; font-style: italic; color: #4b5563;">
              "${orderData.notes}"
            </p>
          </div>
        `
            : ""
        }
        
        <!-- Payment Information -->
        <div class="section">
          <h3>💰 Payment Information</h3>
          <p style="margin: 0 0 15px 0;">
            <strong>Payment Method:</strong> Bank Transfer / PayPal
          </p>
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 15px;">
            <p style="margin: 0 0 10px 0; font-weight: 600; color: #1e40af;">Payment Details:</p>
            <p style="margin: 0; color: #1e40af;">
              <strong>PayPal:</strong> Friends & Family<br>
              <strong>Account:</strong> treasury@ppiaachen.de<br>
              <strong>Name:</strong> PPI Aachen<br>
              <strong>Amount:</strong> €${orderData.totalAmount.toFixed(2)}
            </p>
          </div>
        </div>
        
        <!-- Next Steps -->
        <div class="section">
          <h3>📋 What Happens Next?</h3>
          <ol style="margin: 0; padding-left: 20px; color: #4b5563;">
            <li>We verify your proof of payment</li>
            <li>Your order enters production/preparation</li>
            <li>We ${orderData.deliveryMethod === "pickup" ? "contact you for pickup arrangement" : "ship your order with tracking"}</li>
            <li>You receive your authentic Indonesian-inspired items!</li>
          </ol>
        </div>
        
        <!-- Contact Information -->
        <div class="section">
          <h3>📞 Contact Information</h3>
          <p style="margin: 0;">
            <strong>Questions about your order?</strong><br>
            Email: <a href="mailto:funding@ppiaachen.de" style="color: #16a34a;">funding@ppiaachen.de</a><br>
            Instagram: <a href="https://instagram.com/aachen.studio" style="color: #16a34a;">@aachen.studio</a>
          </p>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <p style="margin: 0;">
            Thank you for supporting Indonesian culture through Aachen Studio!<br>
            <strong>PPI Aachen</strong> - Connecting Indonesian heritage with modern style
          </p>
          <p style="margin: 10px 0 0 0; font-size: 12px;">
            This receipt was generated on ${new Date().toLocaleDateString("en-GB")} at ${new Date().toLocaleTimeString("en-GB")}
          </p>
        </div>
        
      </body>
    </html>
  `

  return htmlContent
}

export function downloadPDF(htmlContent: string, filename: string) {
  // Create a new window for printing
  const printWindow = window.open("", "_blank")
  if (printWindow) {
    printWindow.document.write(htmlContent)
    printWindow.document.close()

    // Wait for content to load, then trigger print dialog
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
        // Note: The window will close automatically after printing in most browsers
      }, 500)
    }
  }
}
