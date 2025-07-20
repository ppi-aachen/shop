// Simple script to check email environment variables
console.log("🔍 Email Environment Check")
console.log("==========================")
console.log("")

// Check if we're in a Node.js environment
console.log("Node.js Environment Check:")
console.log(`- Node version: ${process.version}`)
console.log(`- Platform: ${process.platform}`)
console.log(`- Environment: ${process.env.NODE_ENV || 'development'}`)
console.log("")

// Check Resend API key
console.log("Resend API Key Check:")
console.log(`- RESEND_API_KEY set: ${process.env.RESEND_API_KEY ? 'YES' : 'NO'}`)

if (process.env.RESEND_API_KEY) {
  console.log(`- API Key starts with 're_': ${process.env.RESEND_API_KEY.startsWith('re_') ? 'YES' : 'NO'}`)
  console.log(`- API Key length: ${process.env.RESEND_API_KEY.length} characters`)
  console.log(`- API Key preview: ${process.env.RESEND_API_KEY.substring(0, 10)}...`)
} else {
  console.log("❌ RESEND_API_KEY is not set!")
  console.log("")
  console.log("💡 To fix this:")
  console.log("1. Create a .env.local file in your shop directory")
  console.log("2. Add: RESEND_API_KEY=re_your_actual_api_key_here")
  console.log("3. Restart your development server")
  console.log("")
  console.log("Or if deployed on Vercel:")
  console.log("1. Go to your Vercel project settings")
  console.log("2. Add RESEND_API_KEY to Environment Variables")
  console.log("3. Redeploy your project")
}

console.log("")
console.log("📧 Email Configuration:")
console.log("- From: orders@ppiaachen.de")
console.log("- Business: funding@ppiaachen.de")
console.log("")

// Check other environment variables
console.log("Other Environment Variables:")
console.log(`- GOOGLE_SHEET_ID: ${process.env.GOOGLE_SHEET_ID ? 'Set' : 'Not set'}`)
console.log(`- GOOGLE_SERVICE_ACCOUNT_EMAIL: ${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? 'Set' : 'Not set'}`)
console.log(`- GOOGLE_PRIVATE_KEY: ${process.env.GOOGLE_PRIVATE_KEY ? 'Set' : 'Not set'}`)

console.log("")
console.log("�� Check completed!") 