const { google } = require("googleapis")
const { JWT } = require("google-auth-library")

async function updateStockInGoogleSheet(orderItems) {
  const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY
  const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID

  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY || !GOOGLE_SHEET_ID) {
    console.error(
      "Please set GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, and GOOGLE_SHEET_ID in your environment variables.",
    )
    return
  }

  const jwtClient = new google.auth.JWT({
    email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: GOOGLE_PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  })

  try {
    await jwtClient.authorize()
    console.log("Successfully authorized JWT client for updating stock.")

    const sheets = google.sheets({ version: "v4", auth: jwtClient })
    const sheetTitle = "Products"

    for (const item of orderItems) {
      // Get the current stock value
      const getResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: GOOGLE_SHEET_ID,
        range: `${sheetTitle}!H${item.itemId + 1}`, // Assuming item IDs start at 1 and the stock is in column H
      })

      const currentStock = Number.parseInt(getResponse.data.values[0][0], 10)

      if (isNaN(currentStock)) {
        console.warn(`Invalid stock value found for item ID ${item.itemId}. Skipping update.`)
        continue
      }

      const newStock = currentStock - item.quantity

      if (newStock < 0) {
        console.warn(`Stock is insufficient for item ID ${item.itemId}. Skipping update.`)
        continue
      }

      // Update the stock value
      await sheets.spreadsheets.values.update({
        spreadsheetId: GOOGLE_SHEET_ID,
        range: `${sheetTitle}!H${item.itemId + 1}`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[newStock.toString()]],
        },
      })

      console.log(`Updated stock for item ID ${item.itemId} to ${newStock}`)
    }

    console.log("Stock update complete.")
  } catch (error) {
    console.error("Error updating stock in Google Sheet:", error)
  }
}

module.exports = { updateStockInGoogleSheet }
