// Environment Variables Checker

console.log("🔍 CHECKING ENVIRONMENT VARIABLES")
console.log("=".repeat(40))
console.log("")

// Check Google Sheets configuration
console.log("📊 GOOGLE SHEETS CONFIGURATION:")
console.log("GOOGLE_SHEET_ID:", process.env.GOOGLE_SHEET_ID ? "✅ Set" : "❌ Missing")
console.log("GOOGLE_SERVICE_ACCOUNT_EMAIL:", process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? "✅ Set" : "❌ Missing")
console.log("GOOGLE_PRIVATE_KEY:", process.env.GOOGLE_PRIVATE_KEY ? "✅ Set" : "❌ Missing")
console.log("")

// Check Email configuration
console.log("📧 EMAIL CONFIGURATION:")
console.log("RESEND_API_KEY:", process.env.RESEND_API_KEY ? "✅ Set" : "❌ Missing")
console.log("")

// Provide setup instructions
if (!process.env.GOOGLE_SHEET_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
  console.log("❌ GOOGLE SHEETS NOT CONFIGURED")
  console.log("=".repeat(30))
  console.log("")
  console.log("To fix this, you need to:")
  console.log("1. Create a Google Sheet")
  console.log("2. Set up Google Service Account")
  console.log("3. Add environment variables")
  console.log("")
  console.log("Run the setup scripts for detailed instructions:")
  console.log("- scripts/setup-google-sheet-v4.js")
  console.log("")
} else {
  console.log("✅ GOOGLE SHEETS CONFIGURED")
  console.log("")
}

if (!process.env.RESEND_API_KEY) {
  console.log("⚠️  EMAIL NOT CONFIGURED (Optional)")
  console.log("=".repeat(30))
  console.log("Orders will still work, but no emails will be sent.")
  console.log("Run scripts/setup-resend.js for email setup.")
  console.log("")
} else {
  console.log("✅ EMAIL CONFIGURED")
  console.log("")
}

console.log("🚀 QUICK SETUP GUIDE:")
console.log("=".repeat(20))
console.log("1. Go to https://console.cloud.google.com")
console.log("2. Create new project or select existing")
console.log("3. Enable Google Sheets API")
console.log("4. Create Service Account")
console.log("5. Download JSON key file")
console.log("6. Extract values for environment variables")
console.log("7. Create Google Sheet with proper structure")
console.log("")
console.log("For detailed steps, run: scripts/setup-google-sheet-v4.js")
