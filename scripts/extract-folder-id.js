// Google Drive Folder ID Extraction Tool

console.log("🔍 GOOGLE DRIVE FOLDER ID EXTRACTION TOOL")
console.log("=".repeat(40))
console.log("")

console.log("This script helps you extract the folder ID from a Google Drive folder URL.")
console.log("")

// Example URLs
const examples = [
  "https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0jAaBbCcDdEeFfG",
  "https://drive.google.com/drive/u/0/folders/1a2b3c4d5e6f7g8h9i0jAaBbCcDdEeFfG",
  "https://drive.google.com/drive/my-drive/folders/1a2b3c4d5e6f7g8h9i0jAaBbCcDdEeFfG",
  "https://drive.google.com/file/d/1a2b3c4d5e6f7g8h9i0jAaBbCcDdEeFfG/view?usp=sharing",
]

console.log("📋 EXAMPLE GOOGLE DRIVE URLS:")
examples.forEach((url, index) => {
  console.log(`${index + 1}. ${url}`)

  // Extract folder ID
  let folderId = ""

  if (url.includes("/folders/")) {
    folderId = url.split("/folders/")[1].split("/")[0].split("?")[0]
  } else if (url.includes("/file/d/")) {
    folderId = url.split("/file/d/")[1].split("/")[0].split("?")[0]
  }

  console.log(`   FOLDER ID: ${folderId}`)
  console.log("")
})

console.log("🔧 HOW TO EXTRACT YOUR FOLDER ID:")
console.log("=".repeat(30))
console.log("1. Create a folder in Google Drive for proof of payments")
console.log("2. Right-click the folder and select 'Get link'")
console.log("3. Copy the URL from the dialog")
console.log("4. Look for the part after '/folders/' and before any '?' or '/'")
console.log("")

console.log("📝 EXAMPLE:")
console.log("URL: https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0jAaBbCcDdEeFfG?usp=sharing")
console.log("FOLDER ID: 1a2b3c4d5e6f7g8h9i0jAaBbCcDdEeFfG")
console.log("")

console.log("⚙️ SETUP INSTRUCTIONS:")
console.log("=".repeat(20))
console.log("1. Add this environment variable to your project:")
console.log("   GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here")
console.log("")
console.log("2. Make sure your service account has access to this folder:")
console.log("   a) Right-click your folder in Google Drive")
console.log("   b) Click 'Share'")
console.log("   c) Add your service account email with 'Editor' access")
console.log("   d) Format: your-service-account@your-project.iam.gserviceaccount.com")
console.log("")

console.log("✅ VERIFICATION:")
console.log("=".repeat(15))
console.log("1. Add the GOOGLE_DRIVE_FOLDER_ID environment variable")
console.log("2. Share the folder with your service account")
console.log("3. Place a test order with proof of payment")
console.log("4. Check if the file appears in your specified folder")
console.log("")

console.log("🔐 SECURITY NOTE:")
console.log("=".repeat(15))
console.log("• Files will be uploaded to your specified folder")
console.log("• Files will be made viewable via link (for email notifications)")
console.log("• Only people with the link can access files")
console.log("• Links are only shared with you and the customer")
console.log("")

console.log("🚀 READY TO GO!")
console.log("Add GOOGLE_DRIVE_FOLDER_ID to your environment variables and you're all set!")

const readline = require("readline")

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

rl.question("Please paste the Google Drive folder URL: ", (url) => {
  const regex = /\/folders\/([a-zA-Z0-9_-]+)/
  const match = url.match(regex)

  if (match && match[1]) {
    console.log(`\nExtracted Folder ID: ${match[1]}`)
    console.log(
      "\nMake sure this folder is within a Google Shared Drive and your service account has 'Content manager' or 'Editor' access to it.",
    )
    console.log("Set this ID as GOOGLE_DRIVE_FOLDER_ID in your .env.local file or Vercel environment variables.")
  } else {
    console.log("\nCould not extract a folder ID from the provided URL.")
    console.log(
      "Please ensure the URL is a valid Google Drive folder link (e.g., https://drive.google.com/drive/folders/YOUR_FOLDER_ID_HERE).",
    )
  }

  rl.close()
})
