const fs = require("fs")
const path = require("path")

function checkEnvironmentVariables() {
  const envPath = path.resolve(process.cwd(), ".env.local")
  let envContent = ""

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8")
  } else {
    console.warn("⚠️ .env.local file not found. Please create one and add your environment variables.")
    return false
  }

  const requiredVars = [
    "GOOGLE_SHEET_ID",
    "GOOGLE_SERVICE_ACCOUNT_EMAIL",
    "GOOGLE_PRIVATE_KEY",
    "RESEND_API_KEY",
    "GOOGLE_DRIVE_FOLDER_ID",
  ]

  let allConfigured = true
  console.log("--- Checking Environment Variables ---")

  requiredVars.forEach((envVar) => {
    const regex = new RegExp(`^${envVar}=(.+)$`, "m")
    const match = envContent.match(regex)
    const value = process.env[envVar] || (match ? match[1] : undefined)

    if (value && value.trim() !== "") {
      console.log(`✅ ${envVar} is configured.`)
    } else {
      console.error(`❌ ${envVar} is MISSING or EMPTY.`)
      allConfigured = false
    }
  })

  if (allConfigured) {
    console.log("\n🎉 All required environment variables are configured!")
  } else {
    console.error("\nFix the missing environment variables to ensure full functionality.")
    console.error("Refer to the setup guides in the 'scripts' folder for assistance.")
  }
  console.log("------------------------------------")
  return allConfigured
}

checkEnvironmentVariables()
