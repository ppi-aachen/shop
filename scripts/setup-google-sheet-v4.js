const { GoogleSpreadsheet } = require("google-spreadsheet")
const { JWT } = require("google-auth-library")
const readline = require("readline")

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

async function setupGoogleSheet() {
  console.log(`
========================================
  Google Sheet Setup Guide (v4)
========================================
This script will help you set up your Google Sheet for the Aachen Studio webshop.
It will attempt to create the necessary worksheets if they don't exist.

Before running this script, ensure you have:
1. Created a Google Sheet.
2. Enabled "Google Sheets API" in your Google Cloud Project.
3. Created a Service Account and downloaded its JSON key file.
4. Shared your Google Sheet with the Service Account email (as editor).

You need to have the following environment variables set in your .env.local file:
- GOOGLE_SHEET_ID
- GOOGLE_SERVICE_ACCOUNT_EMAIL
- GOOGLE_PRIVATE_KEY (the entire private key string, including newlines)
`)

  const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID
  const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n") // Handle escaped newlines

  if (!GOOGLE_SHEET_ID || !GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    console.error("❌ Error: Missing one or more required environment variables.")
    console.error(
      "Please ensure GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, and GOOGLE_PRIVATE_KEY are set in your .env.local file.",
    )
    rl.close()
    return
  }

  const serviceAccountAuth = new JWT({
    email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: GOOGLE_PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  })

  const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID, serviceAccountAuth)

  try {
    console.log(`\nAttempting to load Google Sheet with ID: ${GOOGLE_SHEET_ID}`)
    await doc.loadInfo() // loads document properties and worksheets
    console.log(`✅ Successfully loaded sheet: "${doc.title}"`)

    // Define required worksheets and their headers
    const worksheets = [
      {
        title: "Orders",
        headers: [
          "OrderId",
          "Date",
          "Time",
          "CustomerName",
          "Email",
          "Phone",
          "Address",
          "City",
          "State",
          "ZipCode",
          "Country",
          "DeliveryMethod",
          "TotalItems",
          "Subtotal",
          "ShippingCost",
          "TotalAmount",
          "Notes",
          "ProofOfPaymentUrl",
          "Status",
        ],
      },
      {
        title: "Order_Items",
        headers: [
          "OrderId",
          "ItemId",
          "ProductName",
          "Price",
          "Quantity",
          "Subtotal",
          "Description",
          "SelectedSize",
          "SelectedColor",
        ],
      },
      {
        title: "Products",
        headers: [
          "id",
          "name",
          "price",
          "image",
          "images",
          "description",
          "detailedDescription",
          "features",
          "specifications",
          "materials",
          "careInstructions",
          "sizes",
          "colors",
          "stock",
        ],
      },
    ]

    for (const wsConfig of worksheets) {
      let sheet = doc.sheetsByTitle[wsConfig.title]
      if (sheet) {
        console.log(`✅ Worksheet "${wsConfig.title}" already exists.`)
        // Check if headers match
        await sheet.loadHeaderRow()
        const currentHeaders = sheet.headerValues
        const missingHeaders = wsConfig.headers.filter((header) => !currentHeaders.includes(header))

        if (missingHeaders.length > 0) {
          console.warn(`⚠️ Worksheet "${wsConfig.title}" is missing the following headers: ${missingHeaders.join(", ")}`)
          console.warn(`Please manually add these headers to the first row of the "${wsConfig.title}" worksheet.`)
        } else if (currentHeaders.length !== wsConfig.headers.length) {
          console.warn(
            `⚠️ Worksheet "${wsConfig.title}" has extra or reordered headers. Expected: ${wsConfig.headers.join(", ")}. Current: ${currentHeaders.join(", ")}`,
          )
          console.warn(`Please ensure the first row of "${wsConfig.title}" exactly matches the expected headers.`)
        } else {
          console.log(`✅ Headers for "${wsConfig.title}" are correctly set.`)
        }
      } else {
        console.log(`Creating worksheet "${wsConfig.title}"...`)
        sheet = await doc.addSheet({ title: wsConfig.title, headerValues: wsConfig.headers })
        console.log(`🎉 Successfully created worksheet "${wsConfig.title}" with headers.`)
      }
    }

    // Add sample products if the "Products" sheet is empty
    const productsSheet = doc.sheetsByTitle["Products"]
    if (productsSheet) {
      await productsSheet.loadCells() // Load all cells to check if it's empty
      const rowCount = productsSheet.rowCount
      if (rowCount <= 1) {
        // Only header row exists or no rows at all
        console.log("Adding sample products to 'Products' worksheet...")
        const sampleProducts = [
          {
            id: 1,
            name: "Batik Shirt 'Parang'",
            price: 25.0,
            image: "/placeholder.png?height=400&width=400",
            images:
              "https://images.unsplash.com/photo-1622445275461-275ad4047002?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D,https://images.unsplash.com/photo-1622445275461-275ad4047002?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            description: "A classic Indonesian batik shirt with the traditional Parang pattern.",
            detailedDescription:
              "Hand-stamped batik on high-quality cotton, perfect for formal and casual occasions. The Parang motif symbolizes continuity and power.",
            features: "Traditional hand-stamped batik, Breathable cotton fabric, Unisex design",
            specifications: "Weight: 200g, Material: 100% Cotton",
            materials: "Cotton",
            careInstructions: "Hand wash cold, do not bleach, iron on low heat",
            sizes: "S,M,L,XL",
            colors: "Blue,Brown",
            stock: 10,
          },
          {
            id: 2,
            name: "Wayang Kulit Puppet",
            price: 45.0,
            image: "/placeholder.png?height=400&width=400",
            images:
              "https://images.unsplash.com/photo-1587082235790-91182761249f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D,https://images.unsplash.com/photo-1587082235790-91182761249f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            description: "Handcrafted leather shadow puppet, a traditional Indonesian art form.",
            detailedDescription:
              "Intricately carved and painted leather puppet, used in traditional Javanese and Balinese shadow puppet plays. Each piece is unique.",
            features: "Hand-carved, Hand-painted, Authentic cultural artifact",
            specifications: "Height: 50cm, Material: Buffalo Hide, Wood",
            materials: "Buffalo Hide, Wood",
            careInstructions: "Keep dry, avoid direct sunlight",
            sizes: "",
            colors: "",
            stock: 5,
          },
          {
            id: 3,
            name: "Gamelan Miniature Set",
            price: 80.0,
            image: "/placeholder.png?height=400&width=400",
            images:
              "https://images.unsplash.com/photo-1607604276583-cd562415377d?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D,https://images.unsplash.com/photo-1607604276583-cd562415377d?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            description: "A decorative miniature set of traditional Indonesian Gamelan instruments.",
            detailedDescription:
              "Perfect for display, this set includes miniature versions of various Gamelan instruments, showcasing the rich musical heritage of Indonesia.",
            features: "Detailed miniatures, Cultural display item, Hand-painted accents",
            specifications: "Dimensions: 30x20x15cm, Material: Wood, Metal",
            materials: "Wood, Metal",
            careInstructions: "Dust with dry cloth",
            sizes: "",
            colors: "",
            stock: 3,
          },
          {
            id: 4,
            name: "Indonesian Coffee Beans (250g)",
            price: 15.0,
            image: "/placeholder.png?height=400&width=400",
            images:
              "https://images.unsplash.com/photo-1511920170033-0d8a62409f22?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D,https://images.unsplash.com/photo-1511920170033-0d8a62409f22?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            description: "Premium single-origin Indonesian coffee beans, rich and aromatic.",
            detailedDescription:
              "Sourced from the finest plantations in Sumatra, this medium roast coffee offers notes of dark chocolate and earthy spices. Perfect for your morning brew.",
            features: "Single-origin, Medium roast, Rich aroma",
            specifications: "Weight: 250g, Roast: Medium",
            materials: "Coffee Beans",
            careInstructions: "Store in airtight container in cool, dark place",
            sizes: "",
            colors: "",
            stock: 20,
          },
          {
            id: 5,
            name: "Tenun Ikat Scarf",
            price: 30.0,
            image: "/placeholder.png?height=400&width=400",
            images:
              "https://images.unsplash.com/photo-1589939071000-5121791171b9?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D,https://images.unsplash.com/photo-1589939071000-5121791171b9?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            description: "Beautiful hand-woven Tenun Ikat scarf, vibrant and unique.",
            detailedDescription:
              "Made with traditional ikat weaving techniques, this scarf features intricate patterns and rich colors, perfect as an accessory or decorative piece.",
            features: "Hand-woven, Traditional patterns, Soft fabric",
            specifications: "Dimensions: 180x50cm, Material: Cotton blend",
            materials: "Cotton blend",
            careInstructions: "Hand wash cold, line dry",
            sizes: "One Size",
            colors: "Red,Green,Blue",
            stock: 8,
          },
        ]

        await productsSheet.addRows(
          sampleProducts.map((p) => ({
            ...p,
            images: p.images ? p.images.join(",") : "", // Join array to string
            features: p.features ? p.features.join(",") : "",
            specifications: p.specifications ? JSON.stringify(p.specifications) : "", // Stringify object
            materials: p.materials ? p.materials.join(",") : "",
            careInstructions: p.careInstructions ? p.careInstructions.join(",") : "",
            sizes: p.sizes ? p.sizes.join(",") : "",
            colors: p.colors ? p.colors.join(",") : "",
          })),
        )
        console.log("🎉 Successfully added sample products to 'Products' worksheet.")
      } else {
        console.log("✅ 'Products' worksheet already contains data. Skipping sample product insertion.")
      }
    }
  } catch (e) {
    console.error("❌ An error occurred during Google Sheet setup:")
    if (e.response && e.response.status === 403) {
      console.error("Permission denied. Please ensure:")
      console.error(
        `- The service account email "${GOOGLE_SERVICE_ACCOUNT_EMAIL}" has 'Editor' access to the Google Sheet.`,
      )
      console.error("- The Google Sheets API is enabled in your Google Cloud Project.")
    } else if (e.response && e.response.status === 404) {
      console.error("Sheet not found. Please ensure:")
      console.error(`- The GOOGLE_SHEET_ID "${GOOGLE_SHEET_ID}" is correct.`)
      console.error("- The Google Sheet exists and is not deleted.")
    } else {
      console.error(e)
    }
    console.error("\nFor more detailed instructions, refer to the 'scripts/environment-setup-guide.js' file.")
  } finally {
    rl.close()
  }
}

setupGoogleSheet()
