// Simple email system test
console.log("🧪 Simple Email System Test")
console.log("============================")
console.log("")

// Check environment variables
console.log("🔍 Environment Variables:")
console.log("=========================")
console.log(`RESEND_API_KEY: ${process.env.RESEND_API_KEY ? 'Set' : 'Not set'}`)
if (process.env.RESEND_API_KEY) {
  console.log(`API Key starts with 're_': ${process.env.RESEND_API_KEY.startsWith('re_') ? 'Yes' : 'No'}`)
  console.log(`API Key length: ${process.env.RESEND_API_KEY.length}`)
}

console.log("")
console.log("📧 Email Configuration:")
console.log("=======================")
console.log("From: orders@ppiaachen.de")
console.log("To: funding@ppiaachen.de")
console.log("")

// Test Resend import
console.log("📦 Testing Resend Import:")
console.log("==========================")
try {
  const { Resend } = require('resend')
  console.log("✅ Resend package imported successfully")
  
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    console.log("✅ Resend client created successfully")
    
    // Test a simple email send
    console.log("")
    console.log("📤 Testing Email Send:")
    console.log("======================")
    
    const testEmail = {
      from: "Aachen Studio <orders@ppiaachen.de>",
      to: ["funding@ppiaachen.de"],
      subject: "🧪 Email Test",
      html: "<p>This is a test email to verify the email system is working.</p>"
    }
    
    console.log("Sending test email...")
    const result = await resend.emails.send(testEmail)
    
    if (result.error) {
      console.log("❌ Email send failed:")
      console.log(`   Error: ${result.error.message}`)
      console.log(`   Status: ${result.error.statusCode || 'Unknown'}`)
    } else {
      console.log("✅ Email sent successfully!")
      console.log(`   Email ID: ${result.data.id}`)
    }
    
  } else {
    console.log("❌ RESEND_API_KEY not set - cannot test email sending")
  }
  
} catch (error) {
  console.log("❌ Error importing Resend:")
  console.log(`   ${error.message}`)
}

console.log("")
console.log("🏁 Test completed!") 