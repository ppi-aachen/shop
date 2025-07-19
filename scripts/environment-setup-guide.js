// This script provides a comprehensive guide for setting up environment variables
// required for the Aachen Studio shop application.

console.log("📚 Aachen Studio Shop - Environment Setup Guide")
console.log("=".repeat(60))
console.log("")

console.log("This guide will help you configure the necessary environment variables for your shop application.")
console.log("These variables are crucial for connecting to Google Sheets, Google Drive, and Resend for emails.")
console.log("")

console.log("--- 1. Google Sheets Setup (for Products and Orders) ---")
console.log("-------------------------------------------------------")
console.log("a) Create a new Google Sheet:")
console.log("   - Go to Google Sheets (sheets.new)")
console.log("   - Create two sheets/tabs named 'Products' and 'Orders'.")
console.log("   - For 'Products' sheet, set up headers in the first row:")
console.log(
  "     ID, Name, Price, Image, Images (JSON), Description, Detailed Description, Features (JSON), Specifications (JSON), Materials (JSON), Care Instructions (JSON), Sizes (JSON), Colors (JSON), Stock",
)
console.log("   - For 'Orders' sheet, set up headers in the first row:")
console.log(
  "     Order ID, Date, Time, Customer Name, Email, Phone, Address, City, State, Zip Code, Country, Delivery Method, Total Items, Subtotal, Shipping Cost, Total Amount, Notes, Proof of Payment URL, Status",
)
console.log("b) Share your Google Sheet:")
console.log("   - Click 'Share' in the top right corner.")
console.log("   - Change 'General access' to 'Anyone with the link'.")
console.log("   - Set permission to 'Editor'.")
console.log("c) Get your Google Sheet ID:")
console.log("   - The ID is in the URL: https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit")
console.log("   - Copy the part after '/d/' and before '/edit'.")
console.log("d) Set the environment variable:")
console.log("   GOOGLE_SHEET_ID=your_sheet_id_here")
console.log("")

console.log("--- 2. Google Service Account Setup (for API Access) ---")
console.log("------------------------------------------------------")
console.log("This account will allow your application to securely interact with Google Sheets and Drive.")
console.log("a) Create a Google Cloud Project:")
console.log("   - Go to Google Cloud Console (console.cloud.google.com).")
console.log("   - Create a new project or select an existing one.")
console.log("b) Enable APIs:")
console.log("   - In the Google Cloud Console, navigate to 'APIs & Services' > 'Enabled APIs & Services'.")
console.log("   - Enable 'Google Sheets API' and 'Google Drive API'.")
console.log("c) Create a Service Account:")
console.log("   - Go to 'IAM & Admin' > 'Service Accounts'.")
console.log("   - Click '+ CREATE SERVICE ACCOUNT'.")
console.log("   - Give it a name (e.g., 'aachen-studio-shop-service').")
console.log(
  "   - Grant it the 'Editor' role (or more granular roles like 'Google Sheets Editor' and 'Google Drive Editor').",
)
console.log("   - In step 2, click 'CREATE KEY' and select 'JSON'. This will download a JSON file.")
console.log("d) Extract credentials from the JSON file:")
console.log("   - Open the downloaded JSON file.")
console.log("   - Copy the 'client_email' value. This is your GOOGLE_SERVICE_ACCOUNT_EMAIL.")
console.log("   - Copy the 'private_key' value. This is your GOOGLE_PRIVATE_KEY.")
console.log(
  "     NOTE: The private key includes '\\n' characters. You must keep these as literal '\\n' in your environment variable.",
)
console.log("e) Set the environment variables:")
console.log("   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project-id.iam.gserviceaccount.com")
console.log(\"   GOOGLE_PRIVATE_KEY=\"-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_\
