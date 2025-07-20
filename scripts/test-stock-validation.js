// Test script to verify stock validation logic
console.log("🧪 Testing Stock Validation Logic")
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

// Test the stock validation logic (same as checkout actions)
function validateVariantStock(cartItems, variantsData) {
  const errors = []

  for (const cartItem of cartItems) {
    // Find the specific variant for this cart item
    const variant = variantsData.find(v => {
      // Handle both cases: when size/color are selected and when they're not
      const sizeMatch = cartItem.selectedSize 
        ? v.size === cartItem.selectedSize 
        : (v.size === undefined || v.size === null || v.size === "")
      const colorMatch = cartItem.selectedColor 
        ? v.color === cartItem.selectedColor 
        : (v.color === undefined || v.color === null || v.color === "")
      return v.productId === cartItem.id && sizeMatch && colorMatch
    })

    if (!variant) {
      errors.push(`${cartItem.name} (${cartItem.selectedSize || 'No size'}${cartItem.selectedColor ? `, ${cartItem.selectedColor}` : ''}): Variant not found`)
      continue
    }

    if (variant.stock <= 0) {
      errors.push(`${cartItem.name} (${cartItem.selectedSize || 'No size'}${cartItem.selectedColor ? `, ${cartItem.selectedColor}` : ''}): Out of stock`)
      continue
    }

    if (cartItem.quantity > variant.stock) {
      errors.push(`${cartItem.name} (${cartItem.selectedSize || 'No size'}${cartItem.selectedColor ? `, ${cartItem.selectedColor}` : ''}): Only ${variant.stock} available, but ${cartItem.quantity} requested`)
      continue
    }
  }

  return { valid: errors.length === 0, errors }
}

// Test cases
console.log("🎯 Test Case 1: Valid Order (Product 1, Ambonia, 1 quantity)")
console.log("==========================================================")
const testCart1 = [
  {
    id: 1,
    name: "Product 1",
    selectedSize: undefined,
    selectedColor: "Ambonia",
    quantity: 1
  }
]

const result1 = validateVariantStock(testCart1, variantsData)
console.log(`Valid: ${result1.valid}`)
if (result1.errors.length > 0) {
  console.log("Errors:")
  result1.errors.forEach(error => console.log(`  - ${error}`))
}
console.log("")

console.log("🎯 Test Case 2: Valid Order (Product 2, Kembang Legi, 5 quantity)")
console.log("=================================================================")
const testCart2 = [
  {
    id: 2,
    name: "Product 2",
    selectedSize: undefined,
    selectedColor: "Kembang Legi",
    quantity: 5
  }
]

const result2 = validateVariantStock(testCart2, variantsData)
console.log(`Valid: ${result2.valid}`)
if (result2.errors.length > 0) {
  console.log("Errors:")
  result2.errors.forEach(error => console.log(`  - ${error}`))
}
console.log("")

console.log("🎯 Test Case 3: Invalid Order (Product 1, Ambonia, 2 quantity - only 1 available)")
console.log("=================================================================================")
const testCart3 = [
  {
    id: 1,
    name: "Product 1",
    selectedSize: undefined,
    selectedColor: "Ambonia",
    quantity: 2
  }
]

const result3 = validateVariantStock(testCart3, variantsData)
console.log(`Valid: ${result3.valid}`)
if (result3.errors.length > 0) {
  console.log("Errors:")
  result3.errors.forEach(error => console.log(`  - ${error}`))
}
console.log("")

console.log("🎯 Test Case 4: Invalid Order (Product 2, Non-existent Color)")
console.log("=================================================================")
const testCart4 = [
  {
    id: 2,
    name: "Product 2",
    selectedSize: undefined,
    selectedColor: "Non-existent Color",
    quantity: 1
  }
]

const result4 = validateVariantStock(testCart4, variantsData)
console.log(`Valid: ${result4.valid}`)
if (result4.errors.length > 0) {
  console.log("Errors:")
  result4.errors.forEach(error => console.log(`  - ${error}`))
}
console.log("")

console.log("🎯 Test Case 5: Multiple Items Order")
console.log("====================================")
const testCart5 = [
  {
    id: 1,
    name: "Product 1",
    selectedSize: undefined,
    selectedColor: "Ambonia",
    quantity: 1
  },
  {
    id: 2,
    name: "Product 2",
    selectedSize: undefined,
    selectedColor: "Rahayu",
    quantity: 3
  }
]

const result5 = validateVariantStock(testCart5, variantsData)
console.log(`Valid: ${result5.valid}`)
if (result5.errors.length > 0) {
  console.log("Errors:")
  result5.errors.forEach(error => console.log(`  - ${error}`))
}
console.log("")

console.log("✅ Expected Results:")
console.log("===================")
console.log("✅ Test Case 1: Should be VALID (1 Ambonia available, requesting 1)")
console.log("✅ Test Case 2: Should be VALID (12 Kembang Legi available, requesting 5)")
console.log("✅ Test Case 3: Should be INVALID (1 Ambonia available, requesting 2)")
console.log("✅ Test Case 4: Should be INVALID (variant not found)")
console.log("✅ Test Case 5: Should be VALID (both items have sufficient stock)")
console.log("")

console.log("🔍 Debug Info:")
console.log("==============")
console.log("Cart items with undefined size/color should match variants with undefined size/color")
console.log("The validation logic should handle the undefined vs empty string mismatch correctly")
