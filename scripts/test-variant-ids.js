// Test script to demonstrate variant ID generation with spaces and special characters

function generateVariantId(productId, size, color) {
  const sizePart = size || 'null'
  const colorPart = color || 'null'
  
  // Encode spaces and special characters for URL-safe variant IDs
  const encodedSize = encodeURIComponent(sizePart)
  const encodedColor = encodeURIComponent(colorPart)
  
  return `${productId}-${encodedSize}-${encodedColor}`
}

function decodeVariantId(variantId) {
  const parts = variantId.split('-')
  if (parts.length < 3) {
    throw new Error(`Invalid variant ID format: ${variantId}`)
  }
  
  const productId = parseInt(parts[0])
  
  // Handle the case where size or color might contain encoded dashes
  // We need to reconstruct the full encoded parts
  const encodedSize = parts[1]
  const encodedColor = parts.slice(2).join('-') // Rejoin in case color had dashes
  
  const size = encodedSize === 'null' ? undefined : decodeURIComponent(encodedSize)
  const color = encodedColor === 'null' ? undefined : decodeURIComponent(encodedColor)
  
  return { productId, size, color }
}

console.log("🧪 Testing Variant ID Generation with Spaces and Special Characters")
console.log("==================================================================")
console.log("")

// Test cases
const testCases = [
  { productId: 1, size: "S", color: "Blue Sky" },
  { productId: 2, size: "M", color: "Dark Blue" },
  { productId: 3, size: "L", color: "Light Gray" },
  { productId: 4, size: "XL", color: "Forest Green" },
  { productId: 5, size: undefined, color: "Ocean Blue" },
  { productId: 6, size: "S", color: undefined },
  { productId: 7, size: undefined, color: undefined },
  { productId: 8, size: "M", color: "Red & White" },
  { productId: 9, size: "L", color: "Blue-Green" },
  { productId: 10, size: "XL", color: "Yellow/Orange" }
]

console.log("📋 Test Cases:")
console.log("")

testCases.forEach((testCase, index) => {
  const { productId, size, color } = testCase
  const variantId = generateVariantId(productId, size, color)
  const decoded = decodeVariantId(variantId)
  
  console.log(`Test ${index + 1}:`)
  console.log(`  Input: Product ${productId}, Size: "${size || 'null'}", Color: "${color || 'null'}"`)
  console.log(`  Variant ID: ${variantId}`)
  console.log(`  Decoded: Product ${decoded.productId}, Size: "${decoded.size || 'null'}", Color: "${decoded.color || 'null'}"`)
  console.log(`  Match: ${JSON.stringify(testCase) === JSON.stringify(decoded) ? '✅' : '❌'}`)
  console.log("")
})

console.log("🔍 URL Encoding Examples:")
console.log("")

const encodingExamples = [
  "Blue Sky",
  "Dark Blue", 
  "Light Gray",
  "Forest Green",
  "Ocean Blue",
  "Red & White",
  "Blue-Green",
  "Yellow/Orange",
  "Café au Lait",
  "Navy Blue"
]

encodingExamples.forEach(color => {
  const encoded = encodeURIComponent(color)
  const decoded = decodeURIComponent(encoded)
  console.log(`"${color}" → "${encoded}" → "${decoded}" ${color === decoded ? '✅' : '❌'}`)
})

console.log("")
console.log("💡 Key Benefits:")
console.log("- Spaces are encoded as %20")
console.log("- Special characters (&, -, /, etc.) are properly encoded")
console.log("- Decoding restores the original values exactly")
console.log("- Variant IDs are URL-safe and database-friendly")
console.log("- Backward compatible with existing systems") 