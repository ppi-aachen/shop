// Complete Google Sheet Setup Instructions - All Required Sheets

console.log("Complete Google Sheet Setup Instructions:")
console.log("========================================")
console.log("")

console.log("IMPORTANT: Create THREE separate sheets in your Google Spreadsheet")
console.log("Each sheet serves a different purpose - they must be separate tabs!")
console.log("")

console.log("SHEET 1: Create a sheet named 'Products'")
console.log("----------------------------------------")
console.log("This sheet contains your product catalog with stock information.")
console.log("Add these headers in ROW 1 (A1 to M1):")

const productHeaders = [
  "id",
  "name", 
  "price",
  "image",
  "images",
  "description",
  "detailedDescription",
  "features",
  "specifications",
  "materials",
  "careInstructions",
  "sizes",
  "colors",
  "stock"
]

productHeaders.forEach((header, index) => {
  console.log(`${String.fromCharCode(65 + index)}1: ${header}`)
})

console.log("")
console.log("SHEET 2: Create a sheet named 'Orders'")
console.log("--------------------------------------")
console.log("This sheet stores main order information.")
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
console.log("SHEET 3: Create a sheet named 'Order_Items'")
console.log("-------------------------------------------")
console.log("This sheet stores individual items in each order.")
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
console.log("CRITICAL SETUP STEPS:")
console.log("1. Right-click on 'Sheet1' tab → Rename to 'Products'")
console.log("2. Click '+' to add new sheet → Name it 'Orders'")
console.log("3. Click '+' to add another sheet → Name it 'Order_Items'")
console.log("4. Make sure all three sheets have the headers in ROW 1")
console.log("5. Add your products to the Products sheet (starting from ROW 2)")
console.log("6. Leave ROW 2 and below empty in Orders and Order_Items sheets")
console.log("")

console.log("PRODUCTS SHEET DATA FORMAT:")
console.log("- id: Unique number for each product (required)")
console.log("- name: Product name (required)")
console.log("- price: Product price in euros (required)")
console.log("- stock: Available quantity (required for stock management)")
console.log("- sizes: Comma-separated list (e.g., 'S,M,L,XL')")
console.log("- colors: Comma-separated list (e.g., 'Red,Blue,Green')")
console.log("- images: Comma-separated URLs (e.g., 'url1,url2,url3')")
console.log("- features: Comma-separated features")
console.log("- specifications: JSON format (e.g., '{\"weight\":\"100g\",\"dimensions\":\"10x5cm\"}')")
console.log("")

console.log("EXAMPLE PRODUCT ROW:")
console.log("1, T-Shirt, 25.99, /placeholder.jpg, /img1.jpg,/img2.jpg, Comfortable cotton t-shirt, Detailed description here, Comfortable,Lightweight, {\"material\":\"cotton\"}, Machine wash, S,M,L,XL, Red,Blue, 50")
console.log("")

console.log("TROUBLESHOOTING:")
console.log("- If stock doesn't update: Check that Products sheet has 'id' and 'stock' columns")
console.log("- If products don't load: Verify Products sheet exists and has correct headers")
console.log("- If orders don't save: Check Orders and Order_Items sheet names and headers")
console.log("- If getting errors: Make sure service account has Editor permissions")
console.log("")

console.log("Environment Variables needed:")
console.log("GOOGLE_SHEET_ID=your_sheet_id_here")
console.log("GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email")
console.log("GOOGLE_PRIVATE_KEY=your_private_key_here")
console.log("RESEND_API_KEY=re_your_resend_key_here")
console.log("")

console.log("✅ Setup complete! Add products to the Products sheet and test with a sample order.")
console.log("")
console.log("STOCK MANAGEMENT:")
console.log("- Stock levels are automatically updated when orders are placed")
console.log("- The system prevents orders if stock is insufficient")
console.log("- Stock updates happen in real-time during checkout") 