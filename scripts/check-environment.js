// This script checks for the presence of required environment variables.
// It's intended to be run locally or as part of a CI/CD pipeline
// to ensure the application has all necessary configurations.

console.log("🚀 Checking Environment Variables...")
console.log("=".repeat(40))

const requiredEnvVars = [
  "GOOGLE_SHEET_ID",
  "GOOGLE_SERVICE_ACCOUNT_EMAIL",
  "GOOGLE_PRIVATE_KEY",
  "RESEND_API_KEY",
  "GOOGLE_DRIVE_FOLDER_ID",
]

let allConfigured = true
const missingVars = []

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    missingVars.push(envVar)
    allConfigured = false
  } else {
    console.log(`✅ ${envVar} is configured.`)
  }
}

console.log("=".repeat(40))

if (allConfigured) {
  console.log("🎉 All required environment variables are configured!")
  console.log("You are ready to deploy or run your application.")
  process.exit(0) // Exit successfully
} else {
  console.error("❌ Missing required environment variables:")
  missingVars.forEach((envVar) => {
    console.error(`   - ${envVar}`)
  })
  console.error(
    "\nPlease configure these variables in your .env.local file (for local development) or your deployment environment (e.g., Vercel).",
  )
  console.error("Refer to the setup guides in the 'scripts' folder for more details.")
  process.exit(1) // Exit with an error code
}
