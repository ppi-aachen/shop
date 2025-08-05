const { Resend } = require("resend")

console.log("🧪 Testing Resend Email Service")
console.log("=".repeat(40))
console.log("")

// Check if API key exists
if (!process.env.RESEND_API_KEY) {
  console.log("❌ RESEND_API_KEY not found in environment variables")
  console.log("")
  console.log("To fix this:")
  console.log("1. Go to https://resend.com")
  console.log("2. Sign up and create an API key")
  console.log("3. Add RESEND_API_KEY to your environment variables")
  console.log("4. For Vercel: Add it in the Vercel dashboard under Settings > Environment Variables")
  process.exit(1)
}

// Check API key format
if (!process.env.RESEND_API_KEY.startsWith("re_")) {
  console.log("❌ Invalid API key format")
  console.log("API key should start with 're_'")
  console.log("Current key:", process.env.RESEND_API_KEY.substring(0, 10) + "...")
  process.exit(1)
}

console.log("✅ API key found and format looks correct")
console.log("API key starts with:", process.env.RESEND_API_KEY.substring(0, 10) + "...")
console.log("")

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY)

async function testEmail() {
  try {
    console.log("📧 Sending test email...")
    
    const { data, error } = await resend.emails.send({
      from: "Aachen Studio <orders@ppiaachen.de>",
      to: ["test@example.com"], // This will fail but we can see the error
      subject: "Test Email - Aachen Studio",
      html: "<p>This is a test email to verify Resend configuration.</p>",
    })

    if (error) {
      console.log("❌ Email sending failed:")
      console.log("Error:", error.message)
      console.log("")
      
      if (error.message.includes("domain")) {
        console.log("💡 This might be a domain verification issue.")
        console.log("Check if ppiaachen.de is verified in your Resend dashboard")
        console.log("")
      }
      
      if (error.message.includes("API key")) {
        console.log("💡 This might be an API key issue.")
        console.log("Check if your API key is valid and has proper permissions")
        console.log("")
      }
      
      return false
    }

    console.log("✅ Test email sent successfully!")
    console.log("Email ID:", data?.id)
    return true
    
  } catch (error) {
    console.log("❌ Unexpected error:")
    console.log(error.message)
    return false
  }
}

// Run the test
testEmail().then((success) => {
  console.log("")
  if (success) {
    console.log("🎉 Resend is working correctly!")
  } else {
    console.log("🔧 Please check the error messages above and fix the issues.")
  }
  console.log("")
  console.log("For more help, run: node scripts/resend-troubleshooting.js")
})
