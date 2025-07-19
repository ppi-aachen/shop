import { google } from "googleapis"
import { getGoogleAuthClient } from "./google-auth-utils"
import type { Product } from "./types"

const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID

export async function getProductsFromSheet(): Promise<Product[]> {
  if (!GOOGLE_SHEET_ID) {
    throw new Error("GOOGLE_SHEET_ID environment variable is not set.")
  }

  try {
    const auth = getGoogleAuthClient()
    const sheets = google.sheets({ version: "v4", auth })

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: "Products!A:Z", // Adjust range as needed
    })

    const rows = response.data.values
    if (!rows || rows.length === 0) {
      return []
    }

    const headers = rows[0]
    const products: Product[] = rows.slice(1).map((row) => {
      const product: any = {}
      headers.forEach((header, index) => {
        const key = header.replace(/\s$$JSON$$/g, "").toLowerCase() // Clean up header names
        const value = row[index]

        if (header.includes("(JSON)")) {
          try {
            product[key] = value ? JSON.parse(value) : []
          } catch (e) {
            console.error(`Error parsing JSON for ${header}:`, value, e)
            product[key] = []
          }
        } else if (key === "price" || key === "stock" || key === "id") {
          product[key] = Number(value)
        } else if (key === "images") {
          product[key] = value ? value.split(",").map((s: string) => s.trim()) : []
        } else {
          product[key] = value
        }
      })
      return product as Product
    })

    return products
  } catch (error) {
    console.error("Error fetching products from Google Sheet:", error)
    throw error
  }
}

export async function updateProductStockInSheet(updatedProducts: Product[], newOrderRow?: string[]) {
  if (!GOOGLE_SHEET_ID) {
    throw new Error("GOOGLE_SHEET_ID environment variable is not set.")
  }

  try {
    const auth = getGoogleAuthClient()
    const sheets = google.sheets({ version: "v4", auth })

    // 1. Get current product data to find row indices
    const productsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: "Products!A:Z",
    })
    const existingRows = productsResponse.data.values
    if (!existingRows || existingRows.length === 0) {
      throw new Error("No existing product data found in sheet.")
    }

    const headers = existingRows[0]
    const idColumnIndex = headers.indexOf("ID") // Assuming 'ID' is the header for product ID
    const stockColumnIndex = headers.indexOf("Stock") // Assuming 'Stock' is the header for stock

    if (idColumnIndex === -1 || stockColumnIndex === -1) {
      throw new Error("Required columns (ID, Stock) not found in Products sheet.")
    }

    const requests = []

    // Update stock for each product
    for (const updatedProduct of updatedProducts) {
      const rowIndex = existingRows.findIndex(
        (row, idx) => idx > 0 && row[idColumnIndex] === updatedProduct.id.toString(),
      ) // Find row by ID, skip header
      if (rowIndex !== -1) {
        const sheetRowIndex = rowIndex + 1 // Google Sheets is 1-indexed
        const range = `Products!${String.fromCharCode(65 + stockColumnIndex)}${sheetRowIndex}` // e.g., H2, H3
        requests.push({
          range: range,
          values: [[updatedProduct.stock.toString()]],
        })
      } else {
        console.warn(`Product with ID ${updatedProduct.id} not found for stock update.`)
      }
    }

    if (requests.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: GOOGLE_SHEET_ID,
        requestBody: {
          data: requests,
          valueInputOption: "RAW",
        },
      })
      console.log("Product stock updated in Google Sheet.")
    }

    // Append new order row if provided
    if (newOrderRow) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: GOOGLE_SHEET_ID,
        range: "Orders!A:Z", // Assuming an "Orders" sheet exists
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: {
          values: [newOrderRow],
        },
      })
      console.log("New order appended to Google Sheet.")
    }
  } catch (error) {
    console.error("Error updating Google Sheet:", error)
    throw error
  }
}
