// Test script for stock update functionality using the same approach as updateProductStock
const { google } = require("googleapis")

async function getGoogleSheetsAuth() {
  const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n")
  const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID

  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY || !GOOGLE_SHEET_ID) {
    throw new Error("Google Sheets credentials not configured")
  }

  const jwtClient = new google.auth.JWT({
    email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: GOOGLE_PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  })

  await jwtClient.authorize()
  return jwtClient
}

async function testStockUpdate() {
  console.log("🧪 Testing Stock Update Function (V2)")
  console.log("=====================================")
  
  // Test data - replace with actual product IDs from your sheet
  const testCartItems = [
    {
      id: 1, // Replace with actual product ID from your Products sheet
      name: "Test Product",
      price: 25.99,
      quantity: 1,
      description: "Test product for stock update"
    }
  ]
  
  console.log("Test cart items:", testCartItems)
  console.log("")
  
  try {
    const jwtClient = await getGoogleSheetsAuth()
    console.log("✅ Authentication successful")
    
    const sheets = google.sheets({ version: "v4", auth: jwtClient })
    
    // Get current Products sheet data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Products"
    })
    
    const products = response.data.values || []
    
    if (products.length === 0) {
      console.warn("No products found in Products sheet")
      return
    }
    
    console.log(`📊 Found ${products.length} rows in Products sheet`)
    
    // Find the stock and ID column indices
    const headers = products[0]
    const stockColumnIndex = headers.findIndex(header => 
      header.toLowerCase() === "stock"
    )
    const idColumnIndex = headers.findIndex(header => 
      header.toLowerCase() === "id"
    )
    
    console.log(`📋 Headers: ${headers.join(', ')}`)
    console.log(`🔍 Stock column index: ${stockColumnIndex}`)
    console.log(`🔍 ID column index: ${idColumnIndex}`)
    
    if (stockColumnIndex === -1 || idColumnIndex === -1) {
      console.error("❌ Missing required columns (stock or id)")
      return
    }
    
    // Create a map of product ID to current stock
    const productStockMap = new Map()
    
    for (let i = 1; i < products.length; i++) {
      const row = products[i]
      const productId = parseInt(row[idColumnIndex])
      const currentStock = parseInt(row[stockColumnIndex]) || 0
      
      if (!isNaN(productId)) {
        productStockMap.set(productId, { rowIndex: i + 1, currentStock })
        console.log(`📦 Product ${productId}: ${currentStock} in stock`)
      }
    }
    
    // Test stock update for each cart item
    const stockUpdates = []
    
    for (const cartItem of testCartItems) {
      const productStock = productStockMap.get(cartItem.id)
      
      if (productStock) {
        const newStock = Math.max(0, productStock.currentStock - cartItem.quantity)
        const range = `Products!${String.fromCharCode(65 + stockColumnIndex)}${productStock.rowIndex}`
        
        stockUpdates.push({
          range,
          values: [[newStock]]
        })
        
        console.log(`🔄 Would update stock for product ${cartItem.id} (${cartItem.name}): ${productStock.currentStock} -> ${newStock}`)
      } else {
        console.warn(`⚠️  Product with ID ${cartItem.id} not found in Products sheet`)
      }
    }
    
    if (stockUpdates.length > 0) {
      console.log("")
      console.log("🚀 Testing batch update...")
      
      const batchUpdateResponse = await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        requestBody: {
          valueInputOption: "RAW",
          data: stockUpdates
        }
      })
      
      console.log("✅ Stock update test completed successfully!")
      console.log(`📊 Updated ${stockUpdates.length} products`)
    } else {
      console.log("⚠️  No stock updates to perform")
    }
    
  } catch (error) {
    console.error("❌ Stock update test failed:", error.message)
    console.error("Full error:", error)
  }
}

// Run the test
testStockUpdate() 