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
      // Assuming 'id' is in column A and 'stock' is in column H
      // We need to find the row index based on the product ID
      const productsResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: GOOGLE_SHEET_ID,
        range: `${sheetTitle}!A:H`, // Fetch columns A to H to find the product ID and stock
      })

      const productRows = productsResponse.data.values
      if (!productRows || productRows.length < 2) {
        console.warn("No product data found in Google Sheet.")
        continue
      }

      const headerRow = productRows[0]
      const idColumnIndex = headerRow.indexOf("id")
      const stockColumnIndex = headerRow.indexOf("stock")

      if (idColumnIndex === -1 || stockColumnIndex === -1) {
        console.error("Missing 'id' or 'stock' column in Products sheet header.")
        continue
      }

      let rowIndex = -1
      for (let i = 1; i < productRows.length; i++) {
        if (Number(productRows[i][idColumnIndex]) === item.itemId) {
          rowIndex = i + 1 // Google Sheets rows are 1-indexed
          break
        }
      }

      if (rowIndex === -1) {
        console.warn(`Product with ID ${item.itemId} not found in Google Sheet. Skipping stock update.`)
        continue
      }

      const currentStock = Number.parseInt(productRows[rowIndex - 1][stockColumnIndex], 10)

      if (isNaN(currentStock)) {
        console.warn(`Invalid stock value found for item ID ${item.itemId}. Skipping update.`)
        continue
      }

      const newStock = currentStock - item.quantity

      if (newStock < 0) {
        console.warn(`Stock is insufficient for item ID ${item.itemId}. Skipping update.`)
        continue
      }

      // Update the stock value in the correct cell
      const stockCell = String.fromCharCode(65 + stockColumnIndex) + rowIndex // Convert column index to letter (e.g., 0 -> A, 1 -> B)
      await sheets.spreadsheets.values.update({
        spreadsheetId: GOOGLE_SHEET_ID,
        range: `${sheetTitle}!${stockCell}`,
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
