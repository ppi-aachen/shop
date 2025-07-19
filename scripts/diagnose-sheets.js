// Diagnostic script for Google Sheets setup
const { google } = require("googleapis")

async function diagnoseGoogleSheets() {
  console.log("🔍 Google Sheets Diagnostic")
  console.log("============================")
  
  const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY
  const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID

  console.log("Environment Variables:")
  console.log(`- GOOGLE_SHEET_ID: ${GOOGLE_SHEET_ID ? "✅ Set" : "❌ Missing"}`)
  console.log(`- GOOGLE_SERVICE_ACCOUNT_EMAIL: ${GOOGLE_SERVICE_ACCOUNT_EMAIL ? "✅ Set" : "❌ Missing"}`)
  console.log(`- GOOGLE_PRIVATE_KEY: ${GOOGLE_PRIVATE_KEY ? "✅ Set" : "❌ Missing"}`)
  console.log("")

  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY || !GOOGLE_SHEET_ID) {
    console.log("❌ Missing environment variables. Please check your Vercel configuration.")
    return
  }

  try {
    // Authenticate
    const jwtClient = new google.auth.JWT({
      email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: GOOGLE_PRIVATE_KEY,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    await jwtClient.authorize()
    console.log("✅ Authentication successful")
    
    const sheets = google.sheets({ version: "v4", auth: jwtClient })
    
    // Get spreadsheet metadata
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: GOOGLE_SHEET_ID
    })
    
    console.log(`📊 Spreadsheet: ${spreadsheet.data.properties.title}`)
    console.log("📋 Available sheets:")
    
    spreadsheet.data.sheets.forEach(sheet => {
      console.log(`  - ${sheet.properties.title}`)
    })
    
    console.log("")
    
    // Check Products sheet
    try {
      const productsResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: GOOGLE_SHEET_ID,
        range: "Products!A1:N1" // Get headers
      })
      
      if (productsResponse.data.values && productsResponse.data.values.length > 0) {
        const headers = productsResponse.data.values[0]
        console.log("✅ Products sheet found")
        console.log("📝 Headers:", headers.join(", "))
        
        const idIndex = headers.indexOf("id")
        const stockIndex = headers.indexOf("stock")
        
        console.log(`- ID column: ${idIndex >= 0 ? `✅ Column ${String.fromCharCode(65 + idIndex)}` : "❌ Missing"}`)
        console.log(`- Stock column: ${stockIndex >= 0 ? `✅ Column ${String.fromCharCode(65 + stockIndex)}` : "❌ Missing"}`)
        
        if (idIndex >= 0 && stockIndex >= 0) {
          // Get some sample data
          const dataResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: GOOGLE_SHEET_ID,
            range: "Products!A2:N10" // Get first 9 rows of data
          })
          
          if (dataResponse.data.values && dataResponse.data.values.length > 0) {
            console.log("📦 Sample products:")
            dataResponse.data.values.forEach((row, index) => {
              const id = row[idIndex] || "N/A"
              const stock = row[stockIndex] || "N/A"
              console.log(`  Row ${index + 2}: ID=${id}, Stock=${stock}`)
            })
          } else {
            console.log("⚠️  No product data found in Products sheet")
          }
        }
      } else {
        console.log("❌ Products sheet is empty or doesn't exist")
      }
    } catch (error) {
      console.log("❌ Products sheet not found or inaccessible")
      console.log("   Error:", error.message)
    }
    
    console.log("")
    console.log("🔧 Recommendations:")
    console.log("1. Make sure you have a 'Products' sheet with headers: id, name, price, stock, etc.")
    console.log("2. Add some products to the Products sheet with stock values")
    console.log("3. Test the stock update with the test script: node scripts/test-stock-update.js")
    
  } catch (error) {
    console.error("❌ Diagnostic failed:", error.message)
  }
}

diagnoseGoogleSheets() 