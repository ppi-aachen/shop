const readline = require("readline")
const { google } = require("googleapis")

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve))

async function setupGoogleSheetProducts() {
  console.log("\n--- Google Sheet Products Setup Guide ---")
  console.log("This script will help you set up your 'Products' sheet in Google Sheets.")
  console.log("You will need your Google Sheet ID and ensure your service account has 'Editor' access to the sheet.")
  console.log("The sheet name for products should be 'Products'.")

  const sheetId = process.env.GOOGLE_SHEET_ID || (await askQuestion("Enter your Google Sheet ID: "))
  const serviceAccountEmail =
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || (await askQuestion("Enter your Google Service Account Email: "))
  const privateKey =
    process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n") ||
    (await askQuestion(
      "Enter your Google Service Account Private Key (ensure it includes newlines, e.g., replace \\n with actual newlines): ",
    ))

  if (!sheetId || !serviceAccountEmail || !privateKey) {
    console.error("All Google Sheet environment variables must be provided.")
    rl.close()
    return
  }

  try {
    const jwtClient = new google.auth.JWT(
      serviceAccountEmail,
      null,
      privateKey,
      ["https://www.googleapis.com/auth/spreadsheets"],
      null,
    )

    await jwtClient.authorize()
    const sheets = google.sheets({ version: "v4", auth: jwtClient })

    console.log("\nAttempting to create/update 'Products' sheet...")

    // Define the desired headers
    const productHeaders = [
      "ID",
      "Name",
      "Price",
      "Image",
      "Images (JSON)",
      "Description",
      "Detailed Description",
      "Features (JSON)",
      "Specifications (JSON)",
      "Materials (JSON)",
      "Care Instructions (JSON)",
      "Sizes (JSON)",
      "Colors (JSON)",
      "Stock",
    ]

    // Check if 'Products' sheet exists
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
      fields: "sheets.properties",
    })
    const existingSheets = spreadsheet.data.sheets || []
    const productsSheet = existingSheets.find((s) => s.properties.title === "Products")

    if (!productsSheet) {
      // Create 'Products' sheet if it doesn't exist
      console.log("Creating 'Products' sheet...")
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: "Products",
                },
              },
            },
          ],
        },
      })
      console.log("'Products' sheet created.")
    } else {
      console.log("'Products' sheet already exists.")
    }

    // Update headers in 'Products' sheet
    console.log("Updating headers in 'Products' sheet...")
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: "Products!A1", // Target the first row
      valueInputOption: "RAW",
      requestBody: {
        values: [productHeaders],
      },
    })
    console.log("Headers updated successfully in 'Products' sheet.")

    console.log("\n--- Sample Product Data (Copy and paste into your 'Products' sheet starting from row 2) ---")
    console.log(
      "ID\tName\tPrice\tImage\tImages (JSON)\tDescription\tDetailed Description\tFeatures (JSON)\tSpecifications (JSON)\tMaterials (JSON)\tCare Instructions (JSON)\tSizes (JSON)\tColors (JSON)\tStock",
    )
    console.log(
      `1\tJarik Batik\t11.0\thttps://drive.google.com/file/d/1fW0-P7dU5mimR0V5rq6K30uAMDquyoMH/view?usp=sharing\t["https://drive.google.com/file/d/1fW0-P7dU5mimR0V5rq6K30uAMDquyoMH/view?usp=sharing", "https://drive.google.com/file/d/10Qr4IuPWWuyu9k0O7btMlrz7ezyTNib9/view?usp=sharing"]\tStylish canvas totebag\tOur premium Wayang totebag celebrates Indonesia's rich cultural heritage.\t["100% cotton canvas", "Reinforced handles"]\t{"Dimensions": "38x42x10cm", "Weight": "200g"}\t["Cotton"]\t["Hand wash cold"]\t["S", "M", "L"]\t["Red", "Blue"]\t10`,
    )
    console.log(
      `2\tBatik Outer\t14.0\thttps://drive.google.com/file/d/1la8WgRt1RruPnMZ2qZEbisXrTIGJ2Cpo/view?usp=drive_link\t["https://drive.google.com/file/d/1la8WgRt1RruPnMZ2qZEbisXrTIGJ2Cpo/view?usp=drive_link", "https://drive.google.com/file/d/1soJYVejgJqEuqCmu4RC4gSU-SbEPaAF6/view?usp=drive_link"]\tComfortable oversized t-shirt\tCelebrate Indonesian culinary heritage with this unique oversized t-shirt.\t["Premium cotton blend", "Oversized fit"]\t{"Fit": "Oversized", "Fabric Weight": "180 GSM"}\t["Cotton", "Polyester"]\t["Machine wash cold"]\t[]\t["Green", "Yellow"]\t5`,
    )
    console.log(
      `3\tAksara Oversized T-Shirt\t12.0\thttps://drive.google.com/file/d/1FzJrKLbrORg7pE1BYpVR_beHJR0bGhmy/view?usp=sharing\t["/placeholder.svg?height=400&width=400&text=Aksara+Front", "/placeholder.svg?height=400&width=400&text=Aksara+Back"]\tModern oversized t-shirt with beautiful Indonesian script (Aksara) design\tShowcase the beauty of Indonesian traditional script with this contemporary t-shirt.\t["Premium cotton blend fabric", "Authentic Aksara script design"]\t{"Fit": "Oversized", "Fabric Weight": "180 GSM"}\t["60% Cotton", "40% Polyester"]\t["Machine wash cold", "Tumble dry low"]\t["S", "M", "L", "XL", "XXL"]\t["Black", "Navy", "Forest Green"]\t15`,
    )
    console.log(
      `4\tSoto Lamongan Oversized T-Shirt\t12.0\thttps://hebbkx1anhila5yf.public.blob.vercel-storage.com/FB_IMG_1733780798687.jpg-hUgnf5lT5spgMrseBNfTouGlj9FdXu.jpeg\t["https://hebbkx1anhila5yf.public.blob.vercel-storage.com/FB_IMG_1733780798687.jpg-hUgnf5lT5spgMrseBNfTouGlj9FdXu.jpeg", "/placeholder.svg?height=400&width=400&text=Soto+Front+Design"]\tTrendy oversized t-shirt celebrating the famous Soto Lamongan dish\tPay homage to one of Indonesia's most beloved comfort foods with this stylish t-shirt.\t["Premium cotton blend fabric", "Vibrant Soto Lamongan illustration"]\t{"Fit": "Oversized", "Fabric Weight": "180 GSM"}\t["60% Cotton", "40% Polyester"]\t["Machine wash cold", "Tumble dry low"]\t["S", "M", "L", "XL", "XXL"]\t["Black", "Navy"]\t20`,
    )

    console.log("\nSetup complete. Please ensure the sample data is copied into your 'Products' sheet.")
  } catch (error) {
    console.error("Error during Google Sheet setup:", error.message)
    console.error("Please ensure:")
    console.error(
      "1. Your GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, and GOOGLE_PRIVATE_KEY are correctly set in your Vercel project environment variables.",
    )
    console.error("2. The Google Service Account has 'Editor' access to your Google Sheet.")
    console.error("3. The Google Sheets API is enabled for your Google Cloud project.")
  } finally {
    rl.close()
  }
}

setupGoogleSheetProducts()
