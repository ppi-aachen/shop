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
        cache: "no-store", // Ensure fresh data for stock check
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Google Sheets API error: ${response.statusText} - ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    const rows = data.values

    if (!rows || rows.length < 2) {
      console.warn("No product data found in Google Sheet or only headers present.")
      return []
    }

    const headers = rows[0]
    const products = rows.slice(1).map((row) => {
      const product: any = {}
      headers.forEach((header, index) => {
        const value = row[index]
        const cleanHeader = header.replace(/\s$$JSON$$/, "") // Remove (JSON) for cleaner keys

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
            product[cleanHeader.toLowerCase().replace(/\s/g, "")] = value
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

export async function updateProductStockInSheet(productId: number, newStock: number) {
  try {
    const accessToken = await getGoogleSheetsAuth()

    // First, get all products to find the row index of the product to update
    const productsResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/Products?valueRenderOption=FORMATTED_VALUE`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store", // Ensure fresh data
      },
    )

    if (!productsResponse.ok) {
      const errorData = await productsResponse.json()
      throw new Error(
        `Google Sheets API error fetching products for stock update: ${productsResponse.statusText} - ${JSON.stringify(errorData)}`,
      )
    }

    const productsData = await productsResponse.json()
    const rows = productsData.values as string[][]

    if (!rows || rows.length < 2) {
      throw new Error("No product data found in Google Sheet to update stock.")
    }

    const headers = rows[0]
    const idColumnIndex = headers.indexOf("ID")
    const stockColumnIndex = headers.indexOf("Stock")

    if (idColumnIndex === -1 || stockColumnIndex === -1) {
      throw new Error("Required columns 'ID' or 'Stock' not found in Google Sheet headers.")
    }

    let rowIndexToUpdate = -1
    for (let i = 1; i < rows.length; i++) {
      if (Number(rows[i][idColumnIndex]) === productId) {
        rowIndexToUpdate = i + 1 // Google Sheets is 1-indexed
        break
      }
    }

    if (rowIndexToUpdate === -1) {
      console.warn(`Product with ID ${productId} not found in Google Sheet for stock update.`)
      return { success: false, error: `Product with ID ${productId} not found.` }
    }

    // Update the stock value in the specific cell
    const range = `Products!${String.fromCharCode(65 + stockColumnIndex)}${rowIndexToUpdate}`

    const updateResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/${range}?valueInputOption=RAW`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values: [[newStock]],
        }),
      },
    )

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json()
      throw new Error(
        `Google Sheets API error updating stock: ${updateResponse.statusText} - ${JSON.stringify(errorData)}`,
      )
    }

    console.log(`Stock for product ID ${productId} updated to ${newStock} successfully.`)
    return { success: true }
  } catch (error) {
    console.error(`Error updating stock for product ID ${productId}:`, error)
    throw error
  }
}
