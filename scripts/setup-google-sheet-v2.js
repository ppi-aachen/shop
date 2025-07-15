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
  Google Sheet Setup Guide (v2)
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

    console.log(`\nSetup complete for Google Sheet "${doc.title}".`)
    console.log("You can now proceed with testing your application's order submission.")
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
