import { getGoogleSheetsAuth } from "@/lib/google-auth-utils"
import { GOOGLE_SHEET_ID } from "@/app/checkout/actions" // Import GOOGLE_SHEET_ID from actions

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

interface OrderItemData {
  itemId: number
  quantity: number
}

const PRODUCT_HEADERS = [
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

export async function getProductsFromSheet(): Promise<ProductData[]> {
  try {
    const accessToken = await getGoogleSheetsAuth()
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/Products?valueRenderOption=FORMATTED_VALUE`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        next: {
          revalidate: 0, // Ensure fresh data on every request
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

    const headers = rows[0]
    const products = rows.slice(1).map((row) => {
      const product: any = {}
      headers.forEach((header, index) => {
        const value = row[index]
        const cleanHeader = header.replace(/\s$$JSON$$/, "") // Remove (JSON) for property names

        switch (cleanHeader) {
          case "ID":
            product.id = Number(value)
            break
          case "Name":
            product.name = value
            break
          case "Price":
            product.price = Number(value)
            break
          case "Image":
            product.image = value
            break
          case "Images":
            try {
              product.images = value ? JSON.parse(value) : []
            } catch (e) {
              console.warn(`Error parsing Images for product ID ${product.id}: ${value}`, e)
              product.images = []
            }
            break
          case "Description":
            product.description = value
            break
          case "Detailed Description":
            product.detailedDescription = value
            break
          case "Features":
            try {
              product.features = value ? JSON.parse(value) : []
            } catch (e) {
              console.warn(`Error parsing Features for product ID ${product.id}: ${value}`, e)
              product.features = []
            }
            break
          case "Specifications":
            try {
              product.specifications = value ? JSON.parse(value) : {}
            } catch (e) {
              console.warn(`Error parsing Specifications for product ID ${product.id}: ${value}`, e)
              product.specifications = {}
            }
            break
          case "Materials":
            try {
              product.materials = value ? JSON.parse(value) : []
            } catch (e) {
              console.warn(`Error parsing Materials for product ID ${product.id}: ${value}`, e)
              product.materials = []
            }
            break
          case "Care Instructions":
            try {
              product.careInstructions = value ? JSON.parse(value) : []
            } catch (e) {
              console.warn(`Error parsing Care Instructions for product ID ${product.id}: ${value}`, e)
              product.careInstructions = []
            }
            break
          case "Sizes":
            try {
              product.sizes = value ? JSON.parse(value) : []
            } catch (e) {
              console.warn(`Error parsing Sizes for product ID ${product.id}: ${value}`, e)
              product.sizes = []
            }
            break
          case "Colors":
            try {
              product.colors = value ? JSON.parse(value) : []
            } catch (e) {
              console.warn(`Error parsing Colors for product ID ${product.id}: ${value}`, e)
              product.colors = []
            }
            break
          case "Stock":
            product.stock = Number(value)
            break
          default:
            product[cleanHeader.toLowerCase().replace(/\s/g, "")] = value // Fallback for other headers
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

    // First, get all product data to find the row index of the product
    const allProducts = await getProductsFromSheet()
    const productRowIndex = allProducts.findIndex((p) => p.id === productId)

    if (productRowIndex === -1) {
      throw new Error(`Product with ID ${productId} not found in Google Sheet.`)
    }

    // The actual row in the sheet is productRowIndex + 2 (1 for header, 1 for 0-based index)
    const sheetRow = productRowIndex + 2

    // Find the column index for 'Stock'
    const stockColumnIndex = PRODUCT_HEADERS.indexOf("Stock")

    if (stockColumnIndex === -1) {
      throw new Error("Stock column not found in Google Sheet headers.")
    }

    // Convert column index to A1 notation (e.g., 0 -> A, 1 -> B, etc.)
    const columnLetter = String.fromCharCode("A".charCodeAt(0) + stockColumnIndex)
    const range = `Products!${columnLetter}${sheetRow}`

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

    return await response.json()
  } catch (error) {
    console.error(`Error updating stock for product ${productId}:`, error)
    throw error
  }
}
