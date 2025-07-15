import { getGoogleSheetsAuth, GOOGLE_SHEET_ID } from "@/lib/google-auth-utils" // Import from new utility

interface Product {
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
  stock: number // Added stock property
}

// getGoogleSheetsAuth and pemToDer functions are now in lib/google-auth-utils.ts

export async function getProductsFromSheet(): Promise<Product[]> {
  try {
    const accessToken = await getGoogleSheetsAuth()
    const range = "Products!A:N" // Adjust range if you add more columns beyond N (Stock)

    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/${range}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Google Sheets API error: ${response.statusText} - ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    const rows = data.values

    if (!rows || rows.length === 0) {
      return []
    }

    const headers = rows[0]
    const products: Product[] = []

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      const product: Partial<Product> = {}
      headers.forEach((header: string, index: number) => {
        const value = row[index]
        switch (header) {
          case "ID":
            product.id = Number.parseInt(value)
            break
          case "Name":
            product.name = value
            break
          case "Price":
            product.price = Number.parseFloat(value)
            break
          case "Image":
            product.image = value
            break
          case "Images (JSON)":
            try {
              product.images = value ? JSON.parse(value) : []
            } catch (e) {
              console.error(`Error parsing images JSON for product ID ${product.id}:`, value, e)
              product.images = []
            }
            break
          case "Description":
            product.description = value
            break
          case "Detailed Description":
            product.detailedDescription = value
            break
          case "Features (JSON)":
            try {
              product.features = value ? JSON.parse(value) : []
            } catch (e) {
              console.error(`Error parsing features JSON for product ID ${product.id}:`, value, e)
              product.features = []
            }
            break
          case "Specifications (JSON)":
            try {
              product.specifications = value ? JSON.parse(value) : {}
            } catch (e) {
              console.error(`Error parsing specifications JSON for product ID ${product.id}:`, value, e)
              product.specifications = {}
            }
            break
          case "Materials (JSON)":
            try {
              product.materials = value ? JSON.parse(value) : []
            } catch (e) {
              console.error(`Error parsing materials JSON for product ID ${product.id}:`, value, e)
              product.materials = []
            }
            break
          case "Care Instructions (JSON)":
            try {
              product.careInstructions = value ? JSON.parse(value) : []
            } catch (e) {
              console.error(`Error parsing care instructions JSON for product ID ${product.id}:`, value, e)
              product.careInstructions = []
            }
            break
          case "Sizes (JSON)":
            try {
              product.sizes = value ? JSON.parse(value) : []
            } catch (e) {
              console.error(`Error parsing sizes JSON for product ID ${product.id}:`, value, e)
              product.sizes = []
            }
            break
          case "Colors (JSON)":
            try {
              product.colors = value ? JSON.parse(value) : []
            } catch (e) {
              console.error(`Error parsing colors JSON for product ID ${product.id}:`, value, e)
              product.colors = []
            }
            break
          case "Stock":
            product.stock = Number.parseInt(value) || 0
            break
        }
      })
      // Ensure all required properties are present before pushing
      if (
        product.id &&
        product.name &&
        product.price !== undefined &&
        product.image &&
        product.description &&
        product.stock !== undefined
      ) {
        products.push(product as Product)
      } else {
        console.warn("Skipping malformed product row:", row)
      }
    }
    return products
  } catch (error) {
    console.error("Error fetching products from Google Sheet:", error)
    throw error
  }
}

export async function updateProductStockInSheet(productId: number, newStock: number): Promise<any> {
  try {
    const accessToken = await getGoogleSheetsAuth()
    const range = "Products!A:A" // Range to find the product ID

    // First, find the row index of the product
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/${range}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Google Sheets API error (find product): ${response.statusText} - ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    const rows = data.values
    let rowIndex = -1

    if (rows) {
      for (let i = 0; i < rows.length; i++) {
        if (Number.parseInt(rows[i][0]) === productId) {
          rowIndex = i + 1 // +1 because sheets are 1-indexed and header row
          break
        }
      }
    }

    if (rowIndex === -1) {
      throw new Error(`Product with ID ${productId} not found in sheet.`)
    }

    // Assuming 'Stock' is column N (14th column, 0-indexed is 13)
    const stockColumnIndex = 13 // N is the 14th letter, so 13 in 0-indexed array
    const stockCell = `${String.fromCharCode(65 + stockColumnIndex)}${rowIndex}`
    const updateRange = `Products!${stockCell}`

    const updateResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/${updateRange}?valueInputOption=RAW`,
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
        `Google Sheets API error (update stock): ${updateResponse.statusText} - ${JSON.stringify(errorData)}`,
      )
    }

    return await updateResponse.json()
  } catch (error) {
    console.error(`Error updating stock for product ${productId}:`, error)
    throw error
  }
}
