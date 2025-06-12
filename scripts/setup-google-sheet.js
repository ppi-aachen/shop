// Updated Google Sheet Setup Instructions for Cart System

const headers = [
  "Order ID",
  "Timestamp",
  "Customer Name",
  "Email",
  "Phone",
  "Address",
  "City",
  "State",
  "ZIP Code",
  "Country",
  "Total Amount",
  "Item Count",
  "Items (JSON)",
  "Notes",
  "Proof of Payment URL",
]

console.log("Google Sheet Setup Instructions (Updated for Cart System):")
console.log("========================================================")
console.log("")
console.log("1. Create a new Google Sheet")
console.log('2. Rename the first sheet to "Orders"')
console.log("3. Add the following headers to row 1:")
console.log("")
headers.forEach((header, index) => {
  console.log(`Column ${String.fromCharCode(65 + index)}: ${header}`)
})
console.log("")
console.log("Key Changes from Previous Version:")
console.log("- Items are now stored as JSON in a single column")
console.log("- Total Amount and Item Count are separate fields")
console.log("- Single order can contain multiple products")
console.log("")
console.log("4. Set up Google Service Account (same as before):")
console.log("   - Go to Google Cloud Console")
console.log("   - Create a new project or select existing")
console.log("   - Enable Google Sheets API")
console.log("   - Create Service Account credentials")
console.log("   - Download the JSON key file")
console.log("")
console.log("5. Environment Variables needed:")
console.log("   GOOGLE_SHEET_ID=your_sheet_id_here")
console.log("   GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email")
console.log("   GOOGLE_PRIVATE_KEY=your_private_key_here")
console.log("")
console.log("6. Share your Google Sheet with the service account email")
console.log("   (give Editor permissions)")
console.log("")
console.log("Sample Items JSON format:")
console.log('[{"id":1,"name":"Wireless Headphones","price":99.99,"quantity":2}]')
