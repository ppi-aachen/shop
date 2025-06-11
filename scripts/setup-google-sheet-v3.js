// Updated Google Sheet Setup Instructions - Complete Format with All Features

console.log("Google Sheet Setup Instructions (Complete Format):")
console.log("==================================================")
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
  console.log(`Column ${String.fromCharCode(65 + index)}: ${header}`)
})

console.log("")
console.log("SHEET 2: 'Order_Items' - Individual items per order")
console.log("--------------------------------------------------")
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
  console.log(`Column ${String.fromCharCode(65 + index)}: ${header}`)
})

console.log("")
console.log("New Features Added:")
console.log("- Delivery method tracking (Pickup/Delivery)")
console.log("- Shipping cost calculation")
console.log("- Product size and color options")
console.log("- Separate subtotal and total amounts")
console.log("- Email notifications (customer + business)")
console.log("")
console.log("Delivery Pricing Structure:")
console.log("- 1-3 items: €6.19")
console.log("- 4-7 items: €7.69")
console.log("- 8+ items: €10.49")
console.log("- Pickup: €0.00")
console.log("")
console.log("Email Notifications:")
console.log("- Customer confirmation email sent automatically")
console.log("- Business notification sent to funding@ppiaachen.de")
console.log("")
console.log("Environment Variables needed:")
console.log("GOOGLE_SHEET_ID=your_sheet_id_here")
console.log("GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email")
console.log("GOOGLE_PRIVATE_KEY=your_private_key_here")
