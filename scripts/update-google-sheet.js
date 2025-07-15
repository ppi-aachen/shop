const { google } = require("googleapis")
const { GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY } = require("../app/checkout/actions") // Import from actions

// Helper function to convert PEM to DER format for crypto.subtle
function pemToDer(pem) {
  const pemContents = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "")

  const binaryString = atob(pemContents)
  const bytes = new Uint8Array(binaryString.length)

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  return bytes.buffer
}

async function getGoogleSheetsAuth() {
  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    throw new Error("Google Sheets credentials not configured")
  }

  const now = Math.floor(Date.now() / 1000)

  const header = {
    alg: "RS256",
    typ: "JWT",
  }

  const payload = {
    iss: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  }

  function base64UrlEncode(str) {
    return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
  }

  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const unsignedToken = `${encodedHeader}.${encodedPayload}`

  const privateKeyDer = pemToDer(GOOGLE_PRIVATE_KEY)

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    privateKeyDer,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  )

  const encoder = new TextEncoder()
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, encoder.encode(unsignedToken))

  const encodedSignature = base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)))

  const jwt = `${unsignedToken}.${encodedSignature}`

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  })

  const authData = await response.json()

  if (!response.ok) {
    throw new Error(`Auth error: ${authData.error_description || authData.error}`)
  }

  return authData.access_token
}

async function getProductsFromSheetForUpdate() {
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
      const product = {}
      headers.forEach((header, index) => {
        const value = row[index]
        const cleanHeader = header.replace(/\s$$JSON$$/, "")

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
      return product
    })

    return products
  } catch (error) {
    console.error("Error fetching products from Google Sheet for update:", error)
    throw error
  }
}

export async function updateStockInGoogleSheet(orderItems) {
  try {
    const accessToken = await getGoogleSheetsAuth()
    const sheets = google.sheets({ version: "v4", auth: { accessToken } })

    const productsInSheet = await getProductsFromSheetForUpdate()

    const requests = []
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
    const stockColumnIndex = PRODUCT_HEADERS.indexOf("Stock")

    if (stockColumnIndex === -1) {
      throw new Error("Stock column not found in Google Sheet headers.")
    }

    for (const item of orderItems) {
      const product = productsInSheet.find((p) => p.id === item.itemId)
      if (product) {
        const newStock = product.stock - item.quantity
        if (newStock < 0) {
          console.warn(
            `Attempted to deduct more stock than available for product ID ${item.itemId}. Current stock: ${product.stock}, requested: ${item.quantity}.`,
          )
          // Optionally throw an error here if strict stock management is needed
          throw new Error(`Insufficient stock for product ID ${item.itemId}.`)
        }

        // Find the row index (Google Sheets is 1-based, and we have a header row)
        const rowIndex = productsInSheet.indexOf(product) + 2 // +1 for 0-based to 1-based, +1 for header row

        const range = `Products!${String.fromCharCode(65 + stockColumnIndex)}${rowIndex}` // Convert column index to letter (A=65)

        requests.push({
          range: range,
          values: [[newStock]],
        })
      } else {
        console.warn(`Product with ID ${item.itemId} not found in Google Sheet for stock update.`)
      }
    }

    if (requests.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: GOOGLE_SHEET_ID,
        requestBody: {
          valueInputOption: "RAW",
          data: requests,
        },
      })
      console.log("Stock updated successfully in Google Sheet.")
    } else {
      console.log("No stock updates needed.")
    }
  } catch (error) {
    console.error("Error updating stock in Google Sheet:", error)
    throw error
  }
}
