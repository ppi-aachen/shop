// Debug script to check variant stock setup
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

async function debugVariantStock() {
  console.log("🔍 Debugging Variant Stock Setup")
  console.log("=================================")
  console.log("")
  
  try {
    const jwtClient = await getGoogleSheetsAuth()
    console.log("✅ Authentication successful")
    
    const sheets = google.sheets({ version: "v4", auth: jwtClient })
    
    // Check Products sheet
    console.log("📊 Checking Products sheet...")
    try {
      const productsResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: "Products"
      })
      
      const productRows = productsResponse.data.values || []
      console.log(`Found ${productRows.length} rows in Products sheet`)
      
      if (productRows.length > 0) {
        const headers = productRows[0]
        console.log("Products sheet headers:", headers)
        
        // Check if stock column exists
        const stockColumnIndex = headers.findIndex(h => h.toLowerCase() === "stock")
        if (stockColumnIndex === -1) {
          console.log("❌ Stock column NOT found in Products sheet")
        } else {
          console.log(`✅ Stock column found at index ${stockColumnIndex}`)
        }
        
        // Show first few products
        console.log("")
        console.log("📋 First 3 products:")
        for (let i = 1; i < Math.min(4, productRows.length); i++) {
          const row = productRows[i]
          const product = {}
          headers.forEach((header, index) => {
            product[header] = row[index]
          })
          console.log(`  ${i}. ${product.name || 'Unknown'} (ID: ${product.id})`)
        }
      }
    } catch (error) {
      console.log("❌ Error reading Products sheet:", error.message)
    }
    
    console.log("")
    
    // Check Product_Variants sheet
    console.log("📊 Checking Product_Variants sheet...")
    try {
      const variantsResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: "Product_Variants"
      })
      
      const variantRows = variantsResponse.data.values || []
      console.log(`Found ${variantRows.length} rows in Product_Variants sheet`)
      
      if (variantRows.length > 0) {
        const headers = variantRows[0]
        console.log("Product_Variants sheet headers:", headers)
        
        // Check required columns
        const requiredColumns = ["product_id", "size", "color", "stock", "variant_id"]
        const missingColumns = requiredColumns.filter(col => !headers.includes(col))
        
        if (missingColumns.length > 0) {
          console.log("❌ Missing required columns:", missingColumns)
        } else {
          console.log("✅ All required columns found")
        }
        
        // Show first few variants
        console.log("")
        console.log("📋 First 5 variants:")
        for (let i = 1; i < Math.min(6, variantRows.length); i++) {
          const row = variantRows[i]
          const variant = {}
          headers.forEach((header, index) => {
            variant[header] = row[index]
          })
          console.log(`  ${i}. Product ${variant.product_id}, Size: "${variant.size || 'null'}", Color: "${variant.color || 'null'}", Stock: ${variant.stock}`)
        }
        
        // Check stock distribution
        console.log("")
        console.log("📊 Stock Distribution:")
        const stockByProduct = {}
        for (let i = 1; i < variantRows.length; i++) {
          const row = variantRows[i]
          const productId = row[headers.indexOf("product_id")]
          const stock = parseInt(row[headers.indexOf("stock")]) || 0
          
          if (!stockByProduct[productId]) {
            stockByProduct[productId] = 0
          }
          stockByProduct[productId] += stock
        }
        
        Object.keys(stockByProduct).forEach(productId => {
          console.log(`  Product ${productId}: ${stockByProduct[productId]} total stock`)
        })
      }
    } catch (error) {
      console.log("❌ Error reading Product_Variants sheet:", error.message)
    }
    
    console.log("")
    
    // Test the getProductsFromGoogleSheet function
    console.log("🧪 Testing getProductsFromGoogleSheet function...")
    try {
      // Import the function (this is a simplified test)
      const accessToken = await getGoogleSheetsAuth()
      
      // Fetch products with variants
      const productsResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${process.env.GOOGLE_SHEET_ID}/values/Products?valueRenderOption=FORMATTED_VALUE`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )

      if (productsResponse.ok) {
        const productsData = await productsResponse.json()
        const productRows = productsData.values || []
        
        if (productRows.length > 1) {
          const productHeaders = productRows[0]
          const products = productRows.slice(1).map((row) => {
            const product = {}
            productHeaders.forEach((header, index) => {
              const value = row[index]
              if (header === "id" || header === "price") {
                product[header] = Number(value)
              } else if (header === "sizes" || header === "colors") {
                product[header] = value ? value.split(",").map((s) => s.trim()) : []
              } else {
                product[header] = value
              }
            })
            return product
          })
          
          console.log(`✅ Successfully parsed ${products.length} products`)
          
          // Fetch variants
          const variantsResponse = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${process.env.GOOGLE_SHEET_ID}/values/Product_Variants?valueRenderOption=FORMATTED_VALUE`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            },
          )

          if (variantsResponse.ok) {
            const variantsJson = await variantsResponse.json()
            const variantRows = variantsJson.values || []
            
            if (variantRows.length > 1) {
              const variantHeaders = variantRows[0]
              const variantsData = variantRows.slice(1).map((row) => {
                const variant = {}
                variantHeaders.forEach((header, index) => {
                  const value = row[index]
                  if (header === "product_id" || header === "stock") {
                    variant[header === "product_id" ? "productId" : "stock"] = Number(value)
                  } else if (header === "size" || header === "color") {
                    variant[header] = value === "null" || value === "" ? undefined : value
                  } else {
                    variant[header] = value
                  }
                })
                return variant
              })
              
              console.log(`✅ Successfully parsed ${variantsData.length} variants`)
              
              // Add variants to products
              products.forEach(product => {
                const productVariants = variantsData.filter(v => v.productId === product.id)
                if (productVariants.length > 0) {
                  product.variants = productVariants
                  product.stock = productVariants.reduce((total, variant) => total + variant.stock, 0)
                }
              })
              
              console.log("")
              console.log("📋 Final Product Data:")
              products.forEach(product => {
                console.log(`  ${product.name} (ID: ${product.id}):`)
                console.log(`    Total Stock: ${product.stock}`)
                if (product.variants) {
                  console.log(`    Variants: ${product.variants.length}`)
                  product.variants.forEach(variant => {
                    console.log(`      - ${variant.size || 'No size'}${variant.color ? `, ${variant.color}` : ''}: ${variant.stock} stock`)
                  })
                } else {
                  console.log(`    No variants found`)
                }
                console.log("")
              })
            } else {
              console.log("❌ No variant data found")
            }
          } else {
            console.log("❌ Failed to fetch variants")
          }
        }
      }
    } catch (error) {
      console.log("❌ Error testing getProductsFromGoogleSheet:", error.message)
    }
    
  } catch (error) {
    console.error("❌ Debug failed:", error.message)
  }
}

// Run the debug
debugVariantStock()
