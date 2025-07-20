console.log("🔍 Email Service Diagnostic Tool")
console.log("=".repeat(50))
console.log("")

// Check environment variables
console.log("📋 ENVIRONMENT CHECK:")
console.log("-".repeat(20))

const hasResendKey = !!process.env.RESEND_API_KEY
const resendKeyFormat = process.env.RESEND_API_KEY?.startsWith("re_")
const hasGoogleSheets = !!(process.env.GOOGLE_SHEET_ID && process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY)

console.log(`RESEND_API_KEY exists: ${hasResendKey ? "✅" : "❌"}`)
console.log(`RESEND_API_KEY format: ${resendKeyFormat ? "✅" : "❌"}`)
console.log(`Google Sheets configured: ${hasGoogleSheets ? "✅" : "❌"}`)

if (process.env.RESEND_API_KEY) {
  console.log(`API Key preview: ${process.env.RESEND_API_KEY.substring(0, 10)}...`)
}

console.log("")

// Check deployment environment
console.log("🌐 DEPLOYMENT ENVIRONMENT:")
console.log("-".repeat(25))

const isVercel = !!process.env.VERCEL
const isProduction = process.env.NODE_ENV === "production"
const isDevelopment = process.env.NODE_ENV === "development"

console.log(`Running on Vercel: ${isVercel ? "✅" : "❌"}`)
console.log(`Environment: ${process.env.NODE_ENV || "unknown"}`)
console.log(`Production mode: ${isProduction ? "✅" : "❌"}`)
console.log(`Development mode: ${isDevelopment ? "✅" : "❌"}`)

console.log("")

// Common issues and solutions
console.log("🔧 COMMON ISSUES & SOLUTIONS:")
console.log("-".repeat(30))

if (!hasResendKey) {
  console.log("❌ ISSUE: No RESEND_API_KEY found")
  console.log("   SOLUTION:")
  console.log("   1. Go to https://resend.com")
  console.log("   2. Create account and API key")
  console.log("   3. Add to Vercel environment variables")
  console.log("   4. Redeploy your application")
  console.log("")
}

if (hasResendKey && !resendKeyFormat) {
  console.log("❌ ISSUE: Invalid API key format")
  console.log("   SOLUTION:")
  console.log("   1. API key must start with 're_'")
  console.log("   2. Get a new key from Resend dashboard")
  console.log("   3. Update environment variable")
  console.log("   4. Redeploy application")
  console.log("")
}

if (hasResendKey && resendKeyFormat) {
  console.log("✅ API key looks good")
  console.log("   If emails still don't work, check:")
  console.log("   1. Domain verification in Resend dashboard")
  console.log("   2. API key permissions")
  console.log("   3. Vercel function timeout limits")
  console.log("   4. Network connectivity from Vercel")
  console.log("")
}

// Vercel-specific checks
if (isVercel) {
  console.log("🚀 VERCEL-SPECIFIC CHECKS:")
  console.log("-".repeat(25))
  
  console.log("1. Check Vercel Function Logs:")
  console.log("   - Go to Vercel dashboard")
  console.log("   - Click on your project")
  console.log("   - Go to Functions tab")
  console.log("   - Look for checkout/actions.ts errors")
  console.log("")
  
  console.log("2. Check Environment Variables:")
  console.log("   - Go to Vercel dashboard")
  console.log("   - Settings > Environment Variables")
  console.log("   - Verify RESEND_API_KEY is set")
  console.log("   - Make sure it's deployed to Production")
  console.log("")
  
  console.log("3. Check Function Timeout:")
  console.log("   - Vercel functions have 10s timeout")
  console.log("   - Email sending might be slow")
  console.log("   - Consider using edge functions")
  console.log("")
}

// Testing recommendations
console.log("🧪 TESTING RECOMMENDATIONS:")
console.log("-".repeat(25))

console.log("1. Test locally first:")
console.log("   - Copy environment variables locally")
console.log("   - Run: node scripts/test-resend.js")
console.log("")

console.log("2. Check Vercel logs:")
console.log("   - Deploy with console.log statements")
console.log("   - Check function execution logs")
console.log("   - Look for email-related errors")
console.log("")

console.log("3. Test with fallback:")
console.log("   - The system has fallback mechanisms")
console.log("   - Orders are still saved to Google Sheets")
console.log("   - Manual email templates are generated")
console.log("")

// Next steps
console.log("📝 NEXT STEPS:")
console.log("-".repeat(15))

if (!hasResendKey) {
  console.log("1. Set up Resend account and API key")
  console.log("2. Add environment variable to Vercel")
  console.log("3. Redeploy application")
} else if (!resendKeyFormat) {
  console.log("1. Get valid API key from Resend")
  console.log("2. Update environment variable")
  console.log("3. Redeploy application")
} else {
  console.log("1. Check Vercel function logs for errors")
  console.log("2. Verify domain in Resend dashboard")
  console.log("3. Test with a small order")
  console.log("4. Check if fallback system is working")
}

console.log("")
console.log("💡 TIP: The shop works without emails!")
console.log("   Orders are saved to Google Sheets regardless of email status.")
console.log("   You can manually send emails using the logged templates.")
