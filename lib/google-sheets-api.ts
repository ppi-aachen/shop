import { google } from "googleapis"
import { getGoogleAuthClient } from "./google-auth-utils"
import type { Product } from "./types"

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID
const PRODUCTS_SHEET_NAME = "Products"
const ORDERS_SHEET_NAME = "Orders"

interface ProductRow {
  id: string
  name: string
  description: string
  price: number
  stock: number
  image: string
  images: string // JSON string of image URLs
  specifications: string // JSON string of specifications
}

export async function getProductsFromSheet(): Promise<Product[]> {
  try {
    const auth = getGoogleAuthClient()
    const sheets = google.sheets({ version: "v4", auth })

    if (!SPREADSHEET_ID) {
      throw new Error("GOOGLE_SHEET_ID environment variable is not set.")
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${PRODUCTS_SHEET_NAME}!A:H`, // Assuming columns A-H for product data
    })

    const rows = response.data.values
    if (!rows || rows.length === 0) {
      return []
    }

    const headers = rows[0]
    const products: Product[] = rows.slice(1).map((row) => {
      const productData: Partial<ProductRow> = {}
      headers.forEach((header, index) => {
        productData[header.toLowerCase() as keyof ProductRow] = row[index]
      })

      let parsedSpecifications: { sizes?: string[]; colors?: string[] } = {}
      try {
        if (productData.specifications) {
          parsedSpecifications = JSON.parse(productData.specifications)
        }
      } catch (e) {
        console.warn(`Could not parse specifications for product ${productData.id}:`, productData.specifications)
      }

      let parsedImages: string[] = []
      try {
        if (productData.images) {
          parsedImages = JSON.parse(productData.images)
        }
      } catch (e) {
        console.warn(`Could not parse images for product ${productData.id}:`, productData.images)
      }

      return {
        id: productData.id || "",
        name: productData.name || "Unknown Product",
        description: productData.description || "",
        price: Number.parseFloat(productData.price?.toString() || "0"),
        stock: Number.parseInt(productData.stock?.toString() || "0"),
        image: productData.image || "/placeholder.svg",
        images: parsedImages,
        specifications: parsedSpecifications,
      }
    })

    return products
  } catch (error) {
    console.error("Error fetching products from Google Sheet:", error.message)
    throw error
  }
}

export async function updateProductStockInSheet(
  updatedProducts: Product[],
  newOrderRow?: string[], // Optional: for appending new order
) {
  try {
    const auth = getGoogleAuthClient()
    const sheets = google.sheets({ version: "v4", auth })

    if (!SPREADSHEET_ID) {
      throw new Error("GOOGLE_SHEET_ID environment variable is not set.")
    }

    // Fetch current products to get their row indices
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${PRODUCTS_SHEET_NAME}!A:A`, // Get only IDs to map rows
    })

    const existingProductIds = response.data.values?.flat() || []
    const updates = []

    for (const product of updatedProducts) {
      const rowIndex = existingProductIds.indexOf(product.id)
      if (rowIndex !== -1) {
        // Google Sheets API is 1-indexed, and headers are row 1, so data starts from row 2
        const sheetRowIndex = rowIndex + 1 // +1 because sheets are 1-indexed
        updates.push({
          range: `${PRODUCTS_SHEET_NAME}!F${sheetRowIndex}`, // Assuming 'Stock' is column F
          values: [[product.stock]],
        })
      }
    }

    if (updates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          valueInputOption: "RAW",
          data: updates,
        },
      })
      console.log("Product stock updated in Google Sheet.")
    }

    // Append new order row if provided
    if (newOrderRow) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${ORDERS_SHEET_NAME}!A:Z`, // Append to Orders sheet, adjust range as needed
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: {
          values: [newOrderRow],
        },
      })
      console.log("New order appended to Google Sheet.")
    }
  } catch (error) {
    console.error("Error updating Google Sheet:", error.message)
    throw error
  }
}
