// Test script to verify the fixed email system
console.log("🧪 Testing Fixed Email System")
console.log("=============================")
console.log("")

// Set the API key for testing
process.env.RESEND_API_KEY = "re_f7QZi8mN_KB4CfWt5VzK7QufgvWmMfVaW"

console.log("🔍 Configuration:")
console.log(`- API Key: ${process.env.RESEND_API_KEY ? 'Set' : 'Not set'}`)
console.log(`- From Email: onboarding@resend.dev`)
console.log(`- To Email: funding@ppiaachen.de`)
console.log("")

// Test Resend connection with fixed domain
async function testFixedEmail() {
  try {
    const { Resend } = require('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    console.log("🔗 Testing Fixed Email Configuration...")
    
    // Test with the fixed domain
    const testEmail = {
      from: "Aachen Studio <onboarding@resend.dev>",
      to: ["funding@ppiaachen.de"],
      subject: "🧪 Fixed Email Test - Aachen Studio",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Email System Fixed!</h2>
          <p>This is a test email to verify the email system is now working correctly.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Status:</strong> Using verified domain</p>
          <p><strong>From:</strong> onboarding@resend.dev</p>
        </div>
      `
    }
    
    console.log("📤 Sending test email...")
    const { data, error } = await resend.emails.send(testEmail)
    
    if (error) {
      console.log("❌ Email test failed:")
      console.log(`   Error: ${error.message}`)
      console.log(`   Status Code: ${error.statusCode || 'Unknown'}`)
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
    return false
  }
}

// Run the test
testFixedEmail().then(success => {
  console.log("")
  if (success) {
    console.log("🎉 Email system is now working!")
    console.log("")
    console.log("📝 Next steps:")
    console.log("1. Create a .env.local file in your shop directory")
    console.log("2. Add: RESEND_API_KEY=re_f7QZi8mN_KB4CfWt5VzK7QufgvWmMfVaW")
    console.log("3. Restart your development server")
    console.log("4. Test the checkout process - emails should now work!")
    console.log("")
    console.log("💡 Note: Emails will now come from onboarding@resend.dev")
    console.log("   To use ppiaachen.de, verify the domain in Resend dashboard")
  } else {
    console.log("🔧 Email test still failed. Please check:")
    console.log("1. API key validity")
    console.log("2. Resend account status")
    console.log("3. Network connectivity")
  }
  
  console.log("")
  console.log("🏁 Test completed!")
}) 