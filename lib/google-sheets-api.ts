import { getGoogleSheetsAuth, GOOGLE_SHEET_ID } from "@/lib/google-auth-utils"

interface ProductData {
  id: number
  name: string
  price: number
  image: string
  images?: string[]
  description: string
  detailedDescription?: string
  features?: string[]
  specifications?: { [key: string]: string }
  materials?: string[]
  careInstructions?: string[]
  sizes?: string[]
  colors?: string[]
  stock: number
}

export async function getProductsFromSheet(): Promise<ProductData[]> {
  try {
    const accessToken = await getGoogleSheetsAuth()
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/Products?valueRenderOption=FORMATTED_VALUE`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Google Sheets API error: ${response.statusText} - ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    const rows = data.values as string[][]

    if (!rows || rows.length < 2) {
      console.warn("No product data found in Google Sheet or only headers present.")
      return []
    }

    // Map headers to a consistent format for parsing
    const rawHeaders = rows[0].map((h) => h.trim())
    const headersMap: { [key: string]: string } = {
      ID: "id",
      Name: "name",
      Price: "price",
      Image: "image",
      "Images (JSON)": "images",
      Description: "description",
      "Detailed Description": "detailedDescription",
      "Features (JSON)": "features",
      "Specifications (JSON)": "specifications",
      "Materials (JSON)": "materials",
      "Care Instructions (JSON)": "careInstructions",
      "Sizes (JSON)": "sizes",
      "Colors (JSON)": "colors",
      Stock: "stock",
    }

    const products = rows.slice(1).map((row) => {
      const product: any = {}
      rawHeaders.forEach((rawHeader, index) => {
        const key = headersMap[rawHeader] || rawHeader // Use mapped key or original if not mapped
        const value = row[index]

        if (key === "id" || key === "price" || key === "stock") {
          product[key] = Number(value)
        } else if (
          key === "images" ||
          key === "features" ||
          key === "materials" ||
          key === "careInstructions" ||
          key === "sizes" ||
          key === "colors"
        ) {
          try {
            // Attempt to parse as JSON array, fallback to comma-separated string array
            product[key] = value ? JSON.parse(value) : []
            if (!Array.isArray(product[key])) {
              // If JSON.parse didn't result in an array, treat as comma-separated
              product[key] = value.split(",").map((s: string) => s.trim())
            }
          } catch (e) {
            // Fallback for non-JSON array strings
            product[key] = value ? value.split(",").map((s: string) => s.trim()) : []
          }
        } else if (key === "specifications") {
          try {
            product[key] = value ? JSON.parse(value) : {}
          } catch (e) {
            console.error(
              `Error parsing specifications for product: ${product.name || row[rawHeaders.indexOf("Name")]}`,
              e,
            )
            product[key] = {}
          }
        } else {
          product[key] = value
        }
      })
      return product as ProductData
    })

    return products
  } catch (error) {
    console.error("Error fetching products from Google Sheet:", error)
    throw error
  }
}

export async function updateProductStockInSheet(productId: number, newStock: number): Promise<any> {
  try {
    const accessToken = await getGoogleSheetsAuth()

    // First, get all products to find the row index of the product to update
    const products = await getProductsFromSheet()
    const productIndex = products.findIndex((p) => p.id === productId)

    if (productIndex === -1) {
      throw new Error(`Product with ID ${productId} not found in Google Sheet.`)
    }

    // Google Sheets API is 1-indexed for rows, and we have a header row
    // So, if productIndex is 0 (first product after header), it's row 2 in the sheet.
    const sheetRowIndex = productIndex + 2 // +1 for 1-indexing, +1 for header row

    // Find the column index for 'Stock'
    const responseHeaders = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/Products!1:1`, // Fetch only the header row
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    if (!responseHeaders.ok) {
      const errorData = await responseHeaders.json()
      throw new Error(
        `Google Sheets API error fetching headers: ${responseHeaders.statusText} - ${JSON.stringify(errorData)}`,
      )
    }

    const headerData = await responseHeaders.json()
    const headers = headerData.values[0]
    const stockColumnIndex = headers.findIndex((h: string) => h.trim() === "Stock")

    if (stockColumnIndex === -1) {
      throw new Error("Stock column not found in 'Products' sheet.")
    }

    // Convert column index to A1 notation (e.g., 0 -> A, 1 -> B, etc.)
    const columnLetter = String.fromCharCode(65 + stockColumnIndex) // 65 is ASCII for 'A'

    const range = `Products!${columnLetter}${sheetRowIndex}`

    const values = [[newStock]]

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/${range}?valueInputOption=RAW`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values,
        }),
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Google Sheets API error updating stock: ${response.statusText} - ${JSON.stringify(errorData)}`)
    }

    console.log(`Stock for product ID ${productId} updated to ${newStock}.`)
    return await response.json()
  } catch (error) {
    console.error("Error updating product stock in Google Sheet:", error)
    throw error
  }
}
