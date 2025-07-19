// Test script for stock update functionality
const { updateStockInGoogleSheet } = require('./update-google-sheet')

async function testStockUpdate() {
  console.log("🧪 Testing Stock Update Function")
  console.log("=================================")
  
  // Test data - replace with actual product IDs from your sheet
  const testOrderItems = [
    {
      itemId: 1, // Replace with actual product ID from your Products sheet
      productName: "Test Product",
      price: 25.99,
      quantity: 1,
      subtotal: 25.99,
      description: "Test product for stock update",
      selectedSize: "",
      selectedColor: ""
    }
  ]
  
  console.log("Test order items:", testOrderItems)
  console.log("")
  
  try {
    await updateStockInGoogleSheet(testOrderItems)
    console.log("✅ Stock update test completed")
  } catch (error) {
    console.error("❌ Stock update test failed:", error)
  }
}

// Run the test
testStockUpdate()
