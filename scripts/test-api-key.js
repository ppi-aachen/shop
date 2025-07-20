// Test script to verify the Resend API key
console.log("🧪 Testing Resend API Key")
console.log("=========================")
console.log("")

// Set the API key for testing
process.env.RESEND_API_KEY = "re_f7QZi8mN_KB4CfWt5VzK7QufgvWmMfVaW"

console.log("🔍 API Key Check:")
console.log(`- API Key: ${process.env.RESEND_API_KEY ? 'Set' : 'Not set'}`)
console.log(`- Starts with 're_': ${process.env.RESEND_API_KEY.startsWith('re_') ? '✅ Yes' : '❌ No'}`)
console.log(`- Length: ${process.env.RESEND_API_KEY.length} characters`)
console.log("")

// Test Resend connection
async function testResendAPI() {
  try {
    const { Resend } = require('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    console.log("🔗 Testing API Connection...")
    
    // Test with a simple email
    const testEmail = {
      from: "Aachen Studio <orders@ppiaachen.de>",
      to: ["funding@ppiaachen.de"],
      subject: "🧪 API Key Test - Aachen Studio",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Resend API Key Test</h2>
          <p>This is a test email to verify your Resend API key is working correctly.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Test:</strong> Email system verification</p>
        </div>
      `
    }
    
    console.log("📤 Sending test email...")
    const { data, error } = await resend.emails.send(testEmail)
    
    if (error) {
      console.log("❌ API Key test failed:")
      console.log(`   Error: ${error.message}`)
      console.log(`   Status Code: ${error.statusCode || 'Unknown'}`)
      
      if (error.statusCode === 401) {
        console.log("   💡 This usually means the API key is invalid or expired")
      } else if (error.statusCode === 403) {
        console.log("   💡 This usually means the domain is not verified")
      }
      
      return false
    } else {
      console.log("✅ API Key test successful!")
      console.log(`   Email ID: ${data.id}`)
      console.log(`   Status: ${data.status || 'sent'}`)
      return true
    }
    
  } catch (error) {
    console.log("❌ API test failed with exception:")
    console.log(`   Error: ${error.message}`)
    return false
  }
}

// Run the test
testResendAPI().then(success => {
  console.log("")
  if (success) {
    console.log("🎉 Your Resend API key is working correctly!")
    console.log("")
    console.log("📝 Next steps:")
    console.log("1. Create a .env.local file in your shop directory")
    console.log("2. Add: RESEND_API_KEY=re_f7QZi8mN_KB4CfWt5VzK7QufgvWmMfVaW")
    console.log("3. Restart your development server")
    console.log("4. Test the checkout process")
  } else {
    console.log("🔧 API key test failed. Please check:")
    console.log("1. API key validity")
    console.log("2. Domain verification in Resend dashboard")
    console.log("3. Account status")
  }
  
  console.log("")
  console.log("🏁 Test completed!")
}) 