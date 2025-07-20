// Setup script for variant-based stock management
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

function generateVariantId(productId, size, color) {
  const sizePart = size || 'null'
  const colorPart = color || 'null'
  
  // Encode spaces and special characters for URL-safe variant IDs
  const encodedSize = encodeURIComponent(sizePart)
  const encodedColor = encodeURIComponent(colorPart)
  
  return `${productId}-${encodedSize}-${encodedColor}`
}

function generateProductVariants(product) {
  const variants = []
  
  // If no sizes or colors, create a single variant
  if ((!product.sizes || product.sizes.length === 0) && (!product.colors || product.colors.length === 0)) {
    variants.push({
      productId: product.id,
      size: null,
      color: null,
      stock: product.stock || 0,
      variantId: generateVariantId(product.id)
    })
    return variants
  }
  
  // If only sizes, create variants for each size
  if (product.sizes && product.sizes.length > 0 && (!product.colors || product.colors.length === 0)) {
    const stockPerSize = Math.floor((product.stock || 0) / product.sizes.length)
    const remainder = (product.stock || 0) % product.sizes.length
    
    for (let i = 0; i < product.sizes.length; i++) {
      const size = product.sizes[i]
      const stock = stockPerSize + (i < remainder ? 1 : 0)
      variants.push({
        productId: product.id,
        size,
        color: null,
        stock,
        variantId: generateVariantId(product.id, size)
      })
    }
    return variants
  }
  
  // If only colors, create variants for each color
  if (product.colors && product.colors.length > 0 && (!product.sizes || product.sizes.length === 0)) {
    const stockPerColor = Math.floor((product.stock || 0) / product.colors.length)
    const remainder = (product.stock || 0) % product.colors.length
    
    for (let i = 0; i < product.colors.length; i++) {
      const color = product.colors[i]
      const stock = stockPerColor + (i < remainder ? 1 : 0)
      variants.push({
        productId: product.id,
        size: null,
        color,
        stock,
        variantId: generateVariantId(product.id, null, color)
      })
    }
    return variants
  }
  
  // If both sizes and colors, create variants for each combination
  if (product.sizes && product.sizes.length > 0 && product.colors && product.colors.length > 0) {
    const totalVariants = product.sizes.length * product.colors.length
    const stockPerVariant = Math.floor((product.stock || 0) / totalVariants)
    const remainder = (product.stock || 0) % totalVariants
    
    let variantIndex = 0
    for (const size of product.sizes) {
      for (const color of product.colors) {
        const stock = stockPerVariant + (variantIndex < remainder ? 1 : 0)
        variants.push({
          productId: product.id,
          size,
          color,
          stock,
          variantId: generateVariantId(product.id, size, color)
        })
        variantIndex++
      }
    }
    return variants
  }
  
  return variants
}

async function setupVariantStock() {
  console.log("🚀 Setting up Variant-Based Stock Management")
  console.log("=============================================")
  console.log("")
  
  try {
    const jwtClient = await getGoogleSheetsAuth()
    console.log("✅ Authentication successful")
    
    const sheets = google.sheets({ version: "v4", auth: jwtClient })
    
    // Check if Product_Variants sheet already exists
    try {
      const existingSheet = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: "Product_Variants!A1"
      })
      
      console.log("⚠️  Product_Variants sheet already exists!")
      console.log("This script will overwrite existing data.")
      console.log("")
      
      const readline = require('readline')
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })
      
      const answer = await new Promise(resolve => {
        rl.question('Do you want to continue? (y/N): ', resolve)
      })
      rl.close()
      
      if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        console.log("Setup cancelled.")
        return
      }
    } catch (error) {
      // Sheet doesn't exist, which is fine
    }
    
    // Get existing products
    console.log("📊 Fetching existing products...")
    const productsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Products"
    })
    
    const productRows = productsResponse.data.values || []
    
    if (productRows.length < 2) {
      console.log("❌ No products found. Please add products to the Products sheet first.")
      return
    }
    
    const productHeaders = productRows[0]
    const products = productRows.slice(1).map(row => {
      const product = {}
      productHeaders.forEach((header, index) => {
        const value = row[index]
        if (header === "id" || header === "price" || header === "stock") {
          product[header] = Number(value)
        } else if (header === "sizes" || header === "colors") {
          product[header] = value ? value.split(",").map(s => s.trim()) : []
        } else {
          product[header] = value
        }
      })
      return product
    })
    
    console.log(`📦 Found ${products.length} products`)
    console.log("")
    
    // Generate variants for each product
    console.log("🔄 Generating variants...")
    const allVariants = []
    
    for (const product of products) {
      const variants = generateProductVariants(product)
      allVariants.push(...variants)
      
      console.log(`  ${product.name}: ${variants.length} variants`)
      variants.forEach(variant => {
        const variantDesc = `${variant.size || 'No size'}${variant.color ? `, ${variant.color}` : ''} (${variant.stock} stock)`
        console.log(`    - ${variantDesc}`)
      })
    }
    
    console.log("")
    console.log(`📋 Total variants to create: ${allVariants.length}`)
    console.log("")
    
    // Create Product_Variants sheet
    console.log("📝 Creating Product_Variants sheet...")
    
    // Prepare variant data
    const variantHeaders = ["product_id", "size", "color", "stock", "variant_id"]
    const variantRows = [variantHeaders]
    
    allVariants.forEach(variant => {
      variantRows.push([
        variant.productId,
        variant.size || "null",
        variant.color || "null",
        variant.stock,
        variant.variantId
      ])
    })
    
    // Clear existing sheet if it exists, or create new one
    try {
      await sheets.spreadsheets.values.clear({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: "Product_Variants"
      })
    } catch (error) {
      // Sheet doesn't exist, create it
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: "Product_Variants"
              }
            }
          }]
        }
      })
    }
    
    // Write variant data
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Product_Variants!A1",
      valueInputOption: "RAW",
      requestBody: {
        values: variantRows
      }
    })
    
    console.log("✅ Product_Variants sheet created successfully!")
    console.log("")
    
    // Update Products sheet to remove individual stock (optional)
    console.log("🔄 Updating Products sheet...")
    const stockColumnIndex = productHeaders.findIndex(h => h.toLowerCase() === "stock")
    
    if (stockColumnIndex !== -1) {
      // Calculate total stock for each product
      const productTotalStock = {}
      allVariants.forEach(variant => {
        if (!productTotalStock[variant.productId]) {
          productTotalStock[variant.productId] = 0
        }
        productTotalStock[variant.productId] += variant.stock
      })
      
      // Update stock column with totals
      const stockUpdates = []
      for (let i = 1; i < productRows.length; i++) {
        const productId = Number(productRows[i][productHeaders.findIndex(h => h === "id")])
        const totalStock = productTotalStock[productId] || 0
        const range = `Products!${String.fromCharCode(65 + stockColumnIndex)}${i + 1}`
        
        stockUpdates.push({
          range,
          values: [[totalStock]]
        })
      }
      
      if (stockUpdates.length > 0) {
        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: process.env.GOOGLE_SHEET_ID,
          requestBody: {
            valueInputOption: "RAW",
            data: stockUpdates
          }
        })
        
        console.log("✅ Products sheet updated with total stock values")
      }
    }
    
    console.log("")
    console.log("🎉 Variant-based stock management setup complete!")
    console.log("")
    console.log("📊 Summary:")
    console.log(`- Created ${allVariants.length} variants across ${products.length} products`)
    console.log("- Product_Variants sheet is ready for use")
    console.log("- Products sheet updated with total stock values")
    console.log("")
    console.log("🔧 Next steps:")
    console.log("1. Review the Product_Variants sheet and adjust stock levels as needed")
    console.log("2. Test the system with a sample order")
    console.log("3. Monitor stock updates during checkout")
    console.log("")
    console.log("💡 Tips:")
    console.log("- Each variant now has its own stock level")
    console.log("- Stock validation happens per variant (size/color combination)")
    console.log("- The system automatically falls back to legacy mode if variants aren't available")
    
  } catch (error) {
    console.error("❌ Setup failed:", error.message)
    console.error("Full error:", error)
  }
}

// Run the setup
setupVariantStock()
