const fs = require("fs")
const path = require("path")

const requiredEnvVars = [
  "GOOGLE_SHEET_ID",
  "GOOGLE_SERVICE_ACCOUNT_EMAIL",
  "GOOGLE_PRIVATE_KEY",
  "RESEND_API_KEY",
  "GOOGLE_DRIVE_FOLDER_ID",
]

function checkEnvVariables() {
  let allSet = true
  const missing = []

  console.log("Checking environment variables...")

  requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      console.error(`❌ Missing environment variable: ${envVar}`)
      missing.push(envVar)
      allSet = false
    } else {
      console.log(`✅ ${envVar} is set.`)
    }
  })

  if (allSet) {
    console.log("\nAll required environment variables are set.")
  } else {
    console.error("\nPlease set the missing environment variables in your .env.local file or Vercel project settings.")
    process.exit(1) // Exit with an error code
  }
}

function checkEnvFile() {
  const envLocalPath = path.join(process.cwd(), ".env.local")
  if (!fs.existsSync(envLocalPath)) {
    console.warn(
      "\n⚠️ .env.local file not found. Ensure your environment variables are set directly in Vercel or your deployment environment.",
    )
  } else {
    console.log("\n.env.local file found.")
  }
}

function main() {
  checkEnvFile()
  checkEnvVariables()
}

main()
