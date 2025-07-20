// Test script to diagnose email system issues
console.log("🧪 Testing Email System")
console.log("=======================")
console.log("")

// Check environment variables
console.log("🔍 Environment Variables Check:")
console.log("===============================")
console.log(`RESEND_API_KEY: ${process.env.RESEND_API_KEY ? '✅ Set' : '❌ Not set'}`)
if (process.env.RESEND_API_KEY) {
  console.log(`API Key starts with 're_': ${process.env.RESEND_API_KEY.startsWith('re_') ? '✅ Yes' : '❌ No'}`)
  console.log(`API Key length: ${process.env.RESEND_API_KEY.length} characters`)
}

console.log("")
console.log("📧 Email Configuration Check:")
console.log("=============================")
console.log("From email: orders@ppiaachen.de")
console.log("Business email: funding@ppiaachen.de")
console.log("")

// Test Resend API connection
async function testResendConnection() {
  console.log("🔗 Testing Resend API Connection:")
  console.log("=================================")
  
  try {
    const { Resend } = require('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    // Test with a simple email
    const testEmailData = {
      from: "Aachen Studio <orders@ppiaachen.de>",
      to: ["funding@ppiaachen.de"],
      subject: "🧪 Email System Test",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Email System Test</h2>
          <p>This is a test email to verify the email system is working correctly.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
        </div>
      `
    }
    
    console.log("Sending test email...")
    const { data, error } = await resend.emails.send(testEmailData)
    
    if (error) {
      console.log("❌ Email test failed:")
      console.log(`   Error: ${error.message}`)
      console.log(`   Code: ${error.statusCode || 'Unknown'}`)
      return false
    } else {
      console.log("✅ Email test successful!")
      console.log(`   Email ID: ${data.id}`)
      console.log(`   Status: ${data.status || 'sent'}`)
      return true
    }
    
  } catch (error) {
    console.log("❌ Email test failed with exception:")
    console.log(`   Error: ${error.message}`)
    console.log(`   Type: ${error.constructor.name}`)
    return false
  }
}

// Test email template generation
function testEmailTemplateGeneration() {
  console.log("📝 Testing Email Template Generation:")
  console.log("=====================================")
  
  const testOrderData = {
    orderId: "TEST-12345",
    date: "01/01/2024",
    time: "12:00",
    customerName: "Test Customer",
    email: "test@example.com",
    phone: "+1234567890",
    address: "123 Test St",
    city: "Test City",
    state: "Test State",
    zipCode: "12345",
    country: "Test Country",
    deliveryMethod: "pickup",
    totalItems: 2,
    subtotal: 50.00,
    shippingCost: 0.00,
    totalAmount: 50.00,
    notes: "Test order",
    proofOfPaymentUrl: "https://example.com/proof",
    status: "Pending Review"
  }
  
  const testOrderItems = [
    {
      orderId: "TEST-12345",
      itemId: 1,
      productName: "Test Product 1",
      price: 25.00,
      quantity: 1,
      subtotal: 25.00,
      description: "Test product description",
      selectedSize: "",
      selectedColor: "Test Color"
    },
    {
      orderId: "TEST-12345",
      itemId: 2,
      productName: "Test Product 2",
      price: 25.00,
      quantity: 1,
      subtotal: 25.00,
      description: "Test product description",
      selectedSize: "",
      selectedColor: "Test Color 2"
    }
  ]
  
  try {
    // Test customer email template
    const customerItemsTable = testOrderItems
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
    
    console.log("✅ Customer email template generated successfully")
    console.log(`   Items table length: ${customerItemsTable.length} characters`)
    
    // Test business email template
    const businessItemsTable = testOrderItems
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
    
    console.log("✅ Business email template generated successfully")
    console.log(`   Items table length: ${businessItemsTable.length} characters`)
    
    return true
    
  } catch (error) {
    console.log("❌ Email template generation failed:")
    console.log(`   Error: ${error.message}`)
    return false
  }
}

// Main test function
async function runEmailTests() {
  console.log("🚀 Starting Email System Tests...")
  console.log("")
  
  // Test 1: Environment variables
  const envCheck = process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.startsWith('re_')
  console.log(`Environment Check: ${envCheck ? '✅ PASS' : '❌ FAIL'}`)
  
  if (!envCheck) {
    console.log("")
    console.log("💡 Troubleshooting Tips:")
    console.log("1. Check if RESEND_API_KEY is set in your environment")
    console.log("2. Verify the API key starts with 're_'")
    console.log("3. Make sure the API key is valid and active")
    console.log("4. Check Vercel environment variables if deployed")
    return
  }
  
  // Test 2: Template generation
  const templateCheck = testEmailTemplateGeneration()
  console.log(`Template Generation: ${templateCheck ? '✅ PASS' : '❌ FAIL'}`)
  
  // Test 3: API connection
  const apiCheck = await testResendConnection()
  console.log(`API Connection: ${apiCheck ? '✅ PASS' : '❌ FAIL'}`)
  
  console.log("")
  console.log("📊 Test Summary:")
  console.log("================")
  console.log(`Environment Variables: ${envCheck ? '✅' : '❌'}`)
  console.log(`Template Generation: ${templateCheck ? '✅' : '❌'}`)
  console.log(`API Connection: ${apiCheck ? '✅' : '❌'}`)
  
  if (envCheck && templateCheck && apiCheck) {
    console.log("")
    console.log("🎉 All email tests passed! The email system should be working correctly.")
  } else {
    console.log("")
    console.log("🔧 Issues detected. Check the error messages above for troubleshooting.")
  }
}

// Run the tests
runEmailTests().catch(error => {
  console.error("❌ Test runner failed:", error)
}) 