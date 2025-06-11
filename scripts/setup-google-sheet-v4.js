// Updated Google Sheet Setup Instructions - Fixed Formatting

console.log("Google Sheet Setup Instructions (Fixed Formatting):")
console.log("==================================================")
console.log("")

console.log("IMPORTANT: Create TWO separate sheets in your Google Spreadsheet")
console.log("Do NOT add data to the same sheet - they must be separate tabs!")
console.log("")

console.log("SHEET 1: Create a sheet named 'Orders'")
console.log("--------------------------------------")
console.log("Add these headers in ROW 1 (A1 to S1):")

const orderHeaders = [
  "Order ID",
  "Date",
  "Time",
  "Customer Name",
  "Email",
  "Phone",
  "Address",
  "City",
  "State/Province",
  "ZIP Code",
  "Country",
  "Delivery Method",
  "Total Items",
  "Subtotal (€)",
  "Shipping Cost (€)",
  "Total Amount (€)",
  "Notes",
  "Proof of Payment URL",
  "Status",
]

orderHeaders.forEach((header, index) => {
  console.log(`${String.fromCharCode(65 + index)}1: ${header}`)
})

console.log("")
console.log("SHEET 2: Create a sheet named 'Order_Items'")
console.log("-------------------------------------------")
console.log("Add these headers in ROW 1 (A1 to I1):")

const itemHeaders = [
  "Order ID",
  "Item ID",
  "Product Name",
  "Price (€)",
  "Quantity",
  "Subtotal (€)",
  "Description",
  "Selected Size",
  "Selected Color",
]

itemHeaders.forEach((header, index) => {
  console.log(`${String.fromCharCode(65 + index)}1: ${header}`)
})

console.log("")
console.log("CRITICAL STEPS:")
console.log("1. Right-click on 'Sheet1' tab at bottom → Rename to 'Orders'")
console.log("2. Click '+' to add new sheet → Name it 'Order_Items'")
console.log("3. Make sure both sheets have the headers in ROW 1")
console.log("4. Leave ROW 2 and below empty - data will be added automatically")
console.log("")

console.log("TROUBLESHOOTING:")
console.log("- If data goes to wrong location: Check sheet names exactly match 'Orders' and 'Order_Items'")
console.log("- If data appears in wrong columns: Verify headers are in correct order")
console.log("- If getting errors: Make sure service account has Editor permissions")
console.log("")

console.log("Environment Variables needed:")
console.log("GOOGLE_SHEET_ID=your_sheet_id_here")
console.log("GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email")
console.log("GOOGLE_PRIVATE_KEY=your_private_key_here")
console.log("RESEND_API_KEY=re_your_resend_key_here")
console.log("")

console.log("✅ Setup complete! Test with a sample order to verify everything works.")
