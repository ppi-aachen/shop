import { GoogleSpreadsheet } from "google-spreadsheet"
import { JWT } from "google-auth-library"

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY

const setupGoogleSheet = async () => {
  try {
    // Authenticate with Google Sheets API
    const serviceAccountAuth = new JWT({
      email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: GOOGLE_PRIVATE_KEY,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth)
    await doc.loadInfo() // loads document properties and worksheets

    // Function to add a sheet if it doesn't exist
    const addSheetIfNotExist = async (title, headers) => {
      let sheet = doc.sheetsByTitle[title]
      if (!sheet) {
        sheet = await doc.addSheet({ title, headerValues: headers })
        console.log(`Sheet "${title}" created.`)
      } else {
        console.log(`Sheet "${title}" already exists.`)
      }
      return sheet
    }

    // Set up the "Products" sheet
    const productsSheetHeaders = [
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
    ]
    await addSheetIfNotExist("Products", productsSheetHeaders)

    // Set up the "Orders" sheet
    const ordersSheetHeaders = [
      "orderId",
      "date",
      "time",
      "customerName",
      "email",
      "phone",
      "address",
      "city",
      "state",
      "zipCode",
      "country",
      "deliveryMethod",
      "totalItems",
      "subtotal",
      "shippingCost",
      "totalAmount",
      "notes",
      "proofOfPaymentUrl",
      "status",
    ]
    await addSheetIfNotExist("Orders", ordersSheetHeaders)

    // Set up the "Order_Items" sheet
    const orderItemsSheetHeaders = [
      "orderId",
      "itemId",
      "productName",
      "price",
      "quantity",
      "subtotal",
      "description",
      "selectedSize",
      "selectedColor",
    ]
    await addSheetIfNotExist("Order_Items", orderItemsSheetHeaders)

    console.log("Google Sheet setup complete.")
  } catch (error) {
    console.error("Error setting up Google Sheet:", error)
  }
}

setupGoogleSheet()
