// Test script to verify the user's Product_Variants data
console.log("🧪 Testing Your Product_Variants Data")
console.log("=====================================")
console.log("")

// Your actual data
const variantHeaders = ["product_id", "size", "color", "stock", "variant_id"]
const variantRows = [
  variantHeaders,
  ["1", "null", "Ambonia", "1", "1-null-Ambonia"],
  ["1", "null", "Atjeh", "2", "1-null-Atjeh"],
  ["1", "null", "Bandoeng", "2", "1-null-Bandoeng"],
  ["1", "null", "Borneo", "3", "1-null-Borneo"],
  ["1", "null", "Djogjakarta", "4", "1-null-Djogjakarta"],
  ["2", "null", "Kembang Legi", "12", "2-null-Kembang%20Legi"],
  ["2", "null", "Luruh Praja", "12", "2-null-Luruh%20Praja"],
  ["2", "null", "Parang Ayu", "12", "2-null-Parang%20Ayu"],
  ["2", "null", "Rahayu", "12", "2-null-Rahayu"],
  ["2", "null", "Sekar Tirta", "12", "2-null-Sekar%20Tirta"]
]

console.log("📊 Processing your variant data...")

// Process variants (same logic as the real system)
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

console.log(`✅ Successfully processed ${variantsData.length} variants`)
console.log("")

// Group by product
const products = {}
variantsData.forEach(variant => {
  if (!products[variant.productId]) {
    products[variant.productId] = {
      variants: [],
      totalStock: 0
    }
  }
  products[variant.productId].variants.push(variant)
  products[variant.productId].totalStock += variant.stock
})

console.log("📋 Product Summary:")
Object.keys(products).forEach(productId => {
  const product = products[productId]
  console.log(`  Product ${productId}:`)
  console.log(`    Total Stock: ${product.totalStock}`)
  console.log(`    Variants: ${product.variants.length}`)
  product.variants.forEach(variant => {
    console.log(`      - ${variant.color}: ${variant.stock} stock`)
  })
  console.log("")
})

console.log("🎯 Expected Results:")
console.log("===================")
console.log("✅ Product 1 should show: 12 total stock")
console.log("✅ Product 2 should show: 60 total stock")
console.log("✅ Each color should show its individual stock")
console.log("✅ Out-of-stock colors (0 stock) should be disabled")
console.log("")

console.log("🔍 Data Validation:")
console.log("==================")

// Check for potential issues
let issues = []

// Check if all stock values are numeric
variantsData.forEach(variant => {
  if (isNaN(variant.stock)) {
    issues.push(`Stock value for ${variant.color} is not numeric: ${variant.stock}`)
  }
})

// Check if all product IDs are numeric
variantsData.forEach(variant => {
  if (isNaN(variant.productId)) {
    issues.push(`Product ID is not numeric: ${variant.productId}`)
  }
})

// Check for empty stock values
variantsData.forEach(variant => {
  if (variant.stock === 0) {
    console.log(`⚠️  ${variant.color} has 0 stock (will be out of stock)`)
  }
})

if (issues.length === 0) {
  console.log("✅ All data validation checks passed!")
} else {
  console.log("❌ Issues found:")
  issues.forEach(issue => console.log(`  - ${issue}`))
}

console.log("")
console.log("💡 If stock is still showing 0 in your app:")
console.log("1. Make sure you've deployed the updated code to Vercel")
console.log("2. Check that your Products sheet has products with IDs 1 and 2")
console.log("3. Clear your browser cache and refresh")
console.log("4. Check Vercel logs for any error messages") 