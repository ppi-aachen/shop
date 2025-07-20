// Simple test to check variant loading
console.log("🧪 Testing Variant Loading")
console.log("==========================")
console.log("")

// Simulate the getProductsFromGoogleSheet logic
function simulateProductLoading() {
  console.log("📊 Simulating product loading...")
  
  // Mock product data (without stock column)
  const productHeaders = ["id", "name", "price", "image", "description", "sizes", "colors"]
  const productRows = [
    productHeaders,
    ["1", "Test T-Shirt", "25.99", "image.jpg", "Test description", "S,M,L", "Red,Blue"],
    ["2", "Test Phone Case", "15.99", "image2.jpg", "Test description 2", "", "Red,Green,Blue"]
  ]
  
  // Mock variant data
  const variantHeaders = ["product_id", "size", "color", "stock", "variant_id"]
  const variantRows = [
    variantHeaders,
    ["1", "S", "Red", "5", "1-S-Red"],
    ["1", "S", "Blue", "3", "1-S-Blue"],
    ["1", "M", "Red", "7", "1-M-Red"],
    ["1", "M", "Blue", "2", "1-M-Blue"],
    ["1", "L", "Red", "0", "1-L-Red"],
    ["1", "L", "Blue", "4", "1-L-Blue"],
    ["2", "null", "Red", "10", "2-null-Red"],
    ["2", "null", "Green", "8", "2-null-Green"],
    ["2", "null", "Blue", "12", "2-null-Blue"]
  ]
  
  console.log("✅ Mock data created")
  console.log("")
  
  // Process variants
  console.log("🔄 Processing variants...")
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
  
  console.log(`✅ Processed ${variantsData.length} variants`)
  console.log("")
  
  // Process products
  console.log("🔄 Processing products...")
  const products = productRows.slice(1).map((row) => {
    const product = {}
    productHeaders.forEach((header, index) => {
      const value = row[index]
      if (header === "id" || header === "price") {
        product[header] = Number(value)
      } else if (header === "stock") {
        product[header] = Number(value) || 0
      } else if (header === "sizes" || header === "colors") {
        product[header] = value ? value.split(",").map((s) => s.trim()) : []
      } else {
        product[header] = value
      }
    })
    
    // Add variants for this product
    const productVariants = variantsData.filter(v => v.productId === product.id)
    if (productVariants.length > 0) {
      product.variants = productVariants
      product.stock = productVariants.reduce((total, variant) => total + variant.stock, 0)
      console.log(`✅ Product ${product.id} (${product.name}): ${productVariants.length} variants, ${product.stock} total stock`)
    } else {
      product.stock = 0
      console.log(`❌ Product ${product.id} (${product.name}): No variants found, stock = 0`)
    }
    
    return product
  })
  
  console.log("")
  console.log("📋 Final Product Summary:")
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
  
  return products
}

// Run the test
const products = simulateProductLoading()

console.log("🎯 Test Results:")
console.log("================")
products.forEach(product => {
  if (product.stock > 0) {
    console.log(`✅ ${product.name}: ${product.stock} stock available`)
  } else {
    console.log(`❌ ${product.name}: No stock available`)
  }
})

console.log("")
console.log("💡 If you're seeing 0 stock, check:")
console.log("1. Product_Variants sheet exists and has data")
console.log("2. product_id column matches product IDs in Products sheet")
console.log("3. stock column has numeric values")
console.log("4. All required columns are present: product_id, size, color, stock, variant_id")
