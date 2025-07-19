import { google } from "googleapis"
import { getGoogleAuthClient, GOOGLE_SHEET_ID } from "./google-auth-utils"

if (!GOOGLE_SHEET_ID) {
  console.warn("GOOGLE_SHEET_ID environment variable is not set. Google Sheets functionality will be limited.")
}

interface Product {
  ID: string
  Name: string
  Price: string
  Image: string
  "Images (JSON)": string
  Description: string
  "Detailed Description": string
  "Features (JSON)": string
  "Specifications (JSON)": string
  "Materials (JSON)": string
  "Care Instructions (JSON)": string
  "Sizes (JSON)": string
  "Colors (JSON)": string
  Stock: string
}

interface OrderData {
  orderId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  deliveryAddress: string
  cartItems: string // JSON string of cart items
  totalAmount: string
  proofOfPaymentUrl: string
  pdfReceiptUrl: string
  orderDate: string
}

export async function getProductsFromSheet(): Promise<Product[]> {
  if (!GOOGLE_SHEET_ID) {
    console.error("GOOGLE_SHEET_ID is not set. Cannot fetch products.")
    return []
  }

  try {
    const auth = getGoogleAuthClient()
    const sheets = google.sheets({ version: "v4", auth })

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: "Products!A:N", // Assuming products are in columns A to N
    })

    const rows = response.data.values
    if (!rows || rows.length === 0) {
      return []
    }

    const headers = rows[0]
    const products: Product[] = rows.slice(1).map((row) => {
      const product: Partial<Product> = {}
      headers.forEach((header, index) => {
        // Type assertion to map header string to a key of Product
        product[header as keyof Product] = row[index]
      })
      return product as Product
    })

    return products
  } catch (error) {
    console.error("Error fetching products from Google Sheet:", error)
    throw new Error("Failed to fetch products from Google Sheet.")
  }
}

export async function appendOrderToSheet(orderData: OrderData) {
  if (!GOOGLE_SHEET_ID) {
    console.error("GOOGLE_SHEET_ID is not set. Cannot append order.")
    return
  }

  try {
    const auth = getGoogleAuthClient()
    const sheets = google.sheets({ version: "v4", auth })

    const values = [
      orderData.orderId,
      orderData.customerName,
      orderData.customerEmail,
      orderData.customerPhone,
      orderData.deliveryAddress,
      orderData.cartItems,
      orderData.totalAmount,
      orderData.proofOfPaymentUrl,
      orderData.pdfReceiptUrl,
      orderData.orderDate,
    ]

    await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: "Orders!A:J", // Assuming orders are in columns A to J
      valueInputOption: "RAW",
      requestBody: {
        values: [values],
      },
    })
    console.log("Order appended to Google Sheet successfully.")
  } catch (error) {
    console.error("Error appending order to Google Sheet:", error)
    throw new Error("Failed to append order to Google Sheet.")
  }
}

export async function updateProductStockInSheet(productId: string, newStock: number) {
  if (!GOOGLE_SHEET_ID) {
    console.error("GOOGLE_SHEET_ID is not set. Cannot update product stock.")
    return
  }

  try {
    const auth = getGoogleAuthClient()
    const sheets = google.sheets({ version: "v4", auth })

    // First, find the row index of the product
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID,
      range:\
