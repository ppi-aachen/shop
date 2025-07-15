import { GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY } from "../lib/constants" // Assuming these are defined or imported from a central place

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

  const privateKeyPem = GOOGLE_PRIVATE_KEY
  const privateKeyDer = pemToDer(privateKeyPem)

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

export async function updateStockInGoogleSheet(orderItems) {
  try {
    const accessToken = await getGoogleSheetsAuth()

    // First, get the current product data to find the correct row index and stock column
    const productsResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/Products?valueRenderOption=FORMATTED_VALUE`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    if (!productsResponse.ok) {
      const errorData = await productsResponse.json()
      throw new Error(
        `Google Sheets API error fetching products: ${productsResponse.statusText} - ${JSON.stringify(errorData)}`,
      )
    }

    const productsData = await productsResponse.json()
    const rows = productsData.values
    if (!rows || rows.length < 1) {
      throw new Error("No data found in Products sheet.")
    }

    const headers = rows[0]
    const stockColumnIndex = headers.findIndex((header) => header.toLowerCase() === "stock")

    if (stockColumnIndex === -1) {
      throw new Error("Stock column not found in Products sheet. Please ensure a 'stock' header exists.")
    }

    const updates = []
    for (const item of orderItems) {
      const rowIndex = rows.findIndex((row) => Number(row[0]) === item.itemId) // Assuming ID is in the first column (index 0)
      if (rowIndex === -1) {
        console.warn(`Product with ID ${item.itemId} not found in Google Sheet. Skipping stock update.`)
        continue
      }

      const currentStock = Number(rows[rowIndex][stockColumnIndex]) || 0
      const newStock = currentStock - item.quantity

      // Google Sheets API uses 1-based indexing for rows and A1 notation for columns
      const sheetRow = rowIndex + 1 // +1 because headers are row 1, data starts row 2
      const stockColumnLetter = String.fromCharCode(65 + stockColumnIndex) // Convert index to column letter (A=0, B=1, etc.)
      const range = `Products!${stockColumnLetter}${sheetRow}`

      updates.push({
        range: range,
        values: [[newStock.toString()]],
      })
    }

    if (updates.length === 0) {
      console.log("No stock updates to perform.")
      return { success: true, message: "No stock updates needed." }
    }

    const batchUpdateResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values:batchUpdate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: updates,
          valueInputOption: "USER_ENTERED",
        }),
      },
    )

    if (!batchUpdateResponse.ok) {
      const errorData = await batchUpdateResponse.json()
      throw new Error(
        `Google Sheets API batch update error: ${batchUpdateResponse.statusText} - ${JSON.stringify(errorData)}`,
      )
    }

    console.log("Stock updated successfully in Google Sheet.")
    return { success: true, data: await batchUpdateResponse.json() }
  } catch (error) {
    console.error("Error updating stock in Google Sheet:", error)
    throw error
  }
}
