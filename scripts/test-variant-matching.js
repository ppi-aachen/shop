// Test script to verify variant matching logic
console.log("🧪 Testing Variant Matching Logic")
console.log("==================================")
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

console.log("📊 Processed Variants:")
variantsData.forEach(variant => {
  console.log(`  Product ${variant.productId}: ${variant.color} (size: ${variant.size || 'undefined'}) - ${variant.stock} stock`)
})
console.log("")

// Test the variant matching logic (same as product modal)
function findVariantStock(variants, selectedSize, selectedColor, requiresSize, requiresColor) {
  return variants.find((v) => {
    // Handle both cases: when size/color are selected and when they're not
    const sizeMatch = requiresSize ? v.size === selectedSize : (v.size === undefined || v.size === null || v.size === "")
    const colorMatch = requiresColor ? v.color === selectedColor : (v.color === undefined || v.color === null || v.color === "")
    return sizeMatch && colorMatch
  })?.stock || 0
}

console.log("🎯 Testing Color Selection (No Size Required):")
console.log("==============================================")

// Test Product 1 (no size, only colors)
const product1Variants = variantsData.filter(v => v.productId === 1)
const product1Colors = ["Ambonia", "Atjeh", "Bandoeng", "Borneo", "Djogjakarta"]

product1Colors.forEach(color => {
  const stock = findVariantStock(product1Variants, "", color, false, true)
  console.log(`  ${color}: ${stock} stock`)
})

console.log("")
console.log("🎯 Testing Color Selection (Size Required but Not Selected):")
console.log("==========================================================")

// Test what happens when size is required but not selected
product1Colors.forEach(color => {
  const stock = findVariantStock(product1Variants, "", color, true, true)
  console.log(`  ${color}: ${stock} stock`)
})

console.log("")
console.log("🎯 Testing Product 2 Colors:")
console.log("============================")

// Test Product 2 (no size, only colors)
const product2Variants = variantsData.filter(v => v.productId === 2)
const product2Colors = ["Kembang Legi", "Luruh Praja", "Parang Ayu", "Rahayu", "Sekar Tirta"]

product2Colors.forEach(color => {
  const stock = findVariantStock(product2Variants, "", color, false, true)
  console.log(`  ${color}: ${stock} stock`)
})

console.log("")
console.log("✅ Expected Results:")
console.log("===================")
console.log("✅ All colors should show their correct stock levels")
console.log("✅ No colors should show 0 stock (unless actually 0)")
console.log("✅ Colors should not be greyed out")
console.log("")

console.log("🔍 Debug Info:")
console.log("==============")
console.log("Product 1 variants:")
product1Variants.forEach(v => {
  console.log(`  - size: "${v.size}" (${typeof v.size}), color: "${v.color}" (${typeof v.color}), stock: ${v.stock}`)
})

console.log("")
console.log("Product 2 variants:")
product2Variants.forEach(v => {
  console.log(`  - size: "${v.size}" (${typeof v.size}), color: "${v.color}" (${typeof v.color}), stock: ${v.stock}`)
})
