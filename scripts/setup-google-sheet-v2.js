// Updated Google Sheet Setup Instructions - Clean Format

console.log("Google Sheet Setup Instructions (Clean Format):")
console.log("==============================================")
console.log("")
console.log("Create TWO sheets in your Google Spreadsheet:")
console.log("")

console.log("SHEET 1: 'Orders' - Main order information")
console.log("------------------------------------------")
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
  "Total Items",
  "Total Amount (€)",
  "Notes",
  "Proof of Payment URL",
  "Status",
]

orderHeaders.forEach((header, index) => {
  console.log(`Column ${String.fromCharCode(65 + index)}: ${header}`)
})

console.log("")
console.log("SHEET 2: 'Order_Items' - Individual items per order")
console.log("--------------------------------------------------")
const itemHeaders = ["Order ID", "Item ID", "Product Name", "Price (€)", "Quantity", "Subtotal (€)", "Description"]

itemHeaders.forEach((header, index) => {
  console.log(`Column ${String.fromCharCode(65 + index)}: ${header}`)
})

console.log("")
console.log("Benefits of this structure:")
console.log("- Easy to read and analyze")
console.log("- Can create pivot tables and charts")
console.log("- Each item is on its own row")
console.log("- Better for inventory tracking")
console.log("- Cleaner customer data view")
console.log("")
console.log("Environment Variables needed:")
console.log("GOOGLE_SHEET_ID=your_sheet_id_here")
console.log("GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email")
console.log("GOOGLE_PRIVATE_KEY=your_private_key_here")
