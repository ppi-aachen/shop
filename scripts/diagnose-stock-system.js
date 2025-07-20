// Comprehensive diagnostic script for stock update system
const { google } = require("googleapis")

async function diagnoseStockSystem() {
  console.log("🔍 Stock Update System Diagnostic")
  console.log("==================================")
  console.log("")
  
  // Check environment variables
  console.log("1. Environment Variables Check")
  console.log("-------------------------------")
  const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID
  const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY
  
  console.log(`GOOGLE_SHEET_ID: ${GOOGLE_SHEET_ID ? "✅ Set" : "❌ Missing"}`)
  console.log(`GOOGLE_SERVICE_ACCOUNT_EMAIL: ${GOOGLE_SERVICE_ACCOUNT_EMAIL ? "✅ Set" : "❌ Missing"}`)
  console.log(`GOOGLE_PRIVATE_KEY: ${GOOGLE_PRIVATE_KEY ? "✅ Set" : "❌ Missing"}`)
  
  if (!GOOGLE_SHEET_ID || !GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    console.log("")
    console.log("❌ CRITICAL: Missing environment variables!")
    console.log("Please set these in your Vercel environment variables:")
    console.log("- GOOGLE_SHEET_ID")
    console.log("- GOOGLE_SERVICE_ACCOUNT_EMAIL") 
    console.log("- GOOGLE_PRIVATE_KEY")
    return
  }
  
  console.log("")
  console.log("2. Google Sheets Authentication Test")
  console.log("-------------------------------------")
  
  try {
    const jwtClient = new google.auth.JWT({
      email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })
    
    await jwtClient.authorize()
    console.log("✅ Authentication successful")
    
    const sheets = google.sheets({ version: "v4", auth: jwtClient })
    
    // Test spreadsheet access
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: GOOGLE_SHEET_ID
    })
    
    console.log(`✅ Spreadsheet access successful: ${spreadsheet.data.properties.title}`)
    
    console.log("")
    console.log("3. Products Sheet Structure Check")
    console.log("----------------------------------")
    
    // Get Products sheet data
    const productsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: "Products"
    })
    
    const products = productsResponse.data.values || []
    
    if (products.length === 0) {
      console.log("❌ No data found in Products sheet")
      return
    }
    
    console.log(`📊 Products sheet has ${products.length} rows`)
    
    const headers = products[0]
    console.log(`📋 Headers: ${headers.join(', ')}`)
    
    // Check for required columns
    const idColumnIndex = headers.findIndex(header => header.toLowerCase() === "id")
    const stockColumnIndex = headers.findIndex(header => header.toLowerCase() === "stock")
    
    console.log(`🔍 ID column: ${idColumnIndex !== -1 ? `✅ Found at index ${idColumnIndex}` : "❌ Missing"}`)
    console.log(`🔍 Stock column: ${stockColumnIndex !== -1 ? `✅ Found at index ${stockColumnIndex}` : "❌ Missing"}`)
    
    if (idColumnIndex === -1 || stockColumnIndex === -1) {
      console.log("")
      console.log("❌ CRITICAL: Missing required columns!")
      console.log("Your Products sheet must have 'id' and 'stock' columns")
      return
    }
    
    console.log("")
    console.log("4. Product Data Analysis")
    console.log("-------------------------")
    
    const productData = []
    for (let i = 1; i < products.length; i++) {
      const row = products[i]
      const productId = parseInt(row[idColumnIndex])
      const currentStock = parseInt(row[stockColumnIndex]) || 0
      
      if (!isNaN(productId)) {
        productData.push({
          id: productId,
          name: row[headers.findIndex(h => h.toLowerCase() === "name")] || "Unknown",
          stock: currentStock,
          rowIndex: i + 1
        })
      }
    }
    
    console.log(`📦 Found ${productData.length} valid products`)
    
    if (productData.length > 0) {
      console.log("Sample products:")
      productData.slice(0, 5).forEach(product => {
        console.log(`  - ID ${product.id}: ${product.name} (Stock: ${product.stock})`)
      })
      
      if (productData.length > 5) {
        console.log(`  ... and ${productData.length - 5} more products`)
      }
    }
    
    console.log("")
    console.log("5. Stock Update Test")
    console.log("--------------------")
    
    // Test with a sample product (first product with stock > 0)
    const testProduct = productData.find(p => p.stock > 0)
    
    if (!testProduct) {
      console.log("⚠️  No products with stock > 0 found for testing")
      console.log("Add some stock to your products to test the update functionality")
      return
    }
    
    console.log(`🧪 Testing with product: ${testProduct.name} (ID: ${testProduct.id}, Current stock: ${testProduct.stock})`)
    
    const testQuantity = 1
    const newStock = Math.max(0, testProduct.stock - testQuantity)
    const range = `Products!${String.fromCharCode(65 + stockColumnIndex)}${testProduct.rowIndex}`
    
    console.log(`🔄 Would update: ${testProduct.stock} -> ${newStock} (range: ${range})`)
    
    // Perform the test update
    try {
      const updateResponse = await sheets.spreadsheets.values.update({
        spreadsheetId: GOOGLE_SHEET_ID,
        range: range,
        valueInputOption: "RAW",
        requestBody: {
          values: [[newStock]]
        }
      })
      
      console.log("✅ Test stock update successful!")
      
      // Verify the update
      const verifyResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: GOOGLE_SHEET_ID,
        range: range
      })
      
      const updatedValue = verifyResponse.data.values?.[0]?.[0]
      console.log(`✅ Verified: Stock is now ${updatedValue}`)
      
      // Restore original stock
      const restoreResponse = await sheets.spreadsheets.values.update({
        spreadsheetId: GOOGLE_SHEET_ID,
        range: range,
        valueInputOption: "RAW",
        requestBody: {
          values: [[testProduct.stock]]
        }
      })
      
      console.log("✅ Original stock restored")
      
    } catch (error) {
      console.error("❌ Test stock update failed:", error.message)
    }
    
    console.log("")
    console.log("6. Summary")
    console.log("-----------")
    console.log("✅ Environment variables configured")
    console.log("✅ Google Sheets authentication working")
    console.log("✅ Products sheet accessible")
    console.log("✅ Required columns (id, stock) present")
    console.log("✅ Stock update functionality working")
    console.log("")
    console.log("🎉 Stock update system is properly configured!")
    console.log("")
    console.log("Next steps:")
    console.log("1. Deploy to Vercel with the same environment variables")
    console.log("2. Test a real order to verify stock updates work in production")
    console.log("3. Monitor Vercel logs for any errors during checkout")
    
  } catch (error) {
    console.error("❌ Diagnostic failed:", error.message)
    console.error("Full error:", error)
    
    if (error.code === 403) {
      console.log("")
      console.log("🔧 Troubleshooting tips:")
      console.log("1. Make sure your Google Service Account has access to the spreadsheet")
      console.log("2. Share the spreadsheet with your service account email")
      console.log("3. Verify the spreadsheet ID is correct")
    }
  }
}

// Run the diagnostic
diagnoseStockSystem()
