"use server"

import { Resend } from "resend"
import { uploadProofOfPaymentToDrive } from "@/lib/google-drive-upload"

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY)

// Google Sheets configuration
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n")

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  description?: string
  selectedSize?: string
  selectedColor?: string
  sizes?: string[]
  colors?: string[]
}

interface OrderData {
  orderId: string
  date: string
  time: string
  customerName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  deliveryMethod: string
  totalItems: number
  subtotal: number
  shippingCost: number
  totalAmount: number
  notes: string
  proofOfPaymentUrl: string
  status: string
}

interface OrderItemData {
  orderId: string
  itemId: number
  productName: string
  price: number
  quantity: number
  subtotal: number
  description: string
  selectedSize: string
  selectedColor: string
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

  function base64UrlEncode(str: string): string {
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

function pemToDer(pem: string): ArrayBuffer {
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

async function addOrderToGoogleSheet(orderData: OrderData) {
  try {
    const accessToken = await getGoogleSheetsAuth()

    const values = [
      [
        orderData.orderId,
        orderData.date,
        orderData.time,
        orderData.customerName,
        orderData.email,
        orderData.phone,
        orderData.address,
        orderData.city,
        orderData.state,
        orderData.zipCode,
        orderData.country,
        orderData.deliveryMethod,
        orderData.totalItems,
        orderData.subtotal,
        orderData.shippingCost,
        orderData.totalAmount,
        orderData.notes,
        orderData.proofOfPaymentUrl,
        orderData.status,
      ],
    ]

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/Orders:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
      {
        method: "POST",
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
      throw new Error(`Google Sheets API error: ${response.statusText} - ${JSON.stringify(errorData)}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error adding order to Google Sheet:", error)
    throw error
  }
}

async function addOrderItemsToGoogleSheet(orderItems: OrderItemData[]) {
  try {
    const accessToken = await getGoogleSheetsAuth()

    const values = orderItems.map((item) => [
      item.orderId,
      item.itemId,
      item.productName,
      item.price,
      item.quantity,
      item.subtotal,
      item.description,
      item.selectedSize || "",
      item.selectedColor || "",
    ])

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/Order_Items:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
      {
        method: "POST",
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
      throw new Error(`Google Sheets API error: ${response.statusText} - ${JSON.stringify(errorData)}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error adding order items to Google Sheet:", error)
    throw error
  }
}

export async function submitOrder(formData: FormData) {
  try {
    const cartItems = JSON.parse(formData.get("cartItems") as string) as CartItem[]
    const deliveryMethod = formData.get("deliveryMethod") as string
    const subtotal = Number.parseFloat(formData.get("subtotal") as string)
    const shippingCost = Number.parseFloat(formData.get("shippingCost") as string)
    const totalAmount = Number.parseFloat(formData.get("totalAmount") as string)
    const itemCount = Number.parseInt(formData.get("itemCount") as string)
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const address = formData.get("address") as string
    const city = formData.get("city") as string
    const state = formData.get("state") as string
    const zipCode = formData.get("zipCode") as string
    const country = formData.get("country") as string
    const notes = (formData.get("notes") as string) || ""
    const proofFile = formData.get("proofOfPayment") as File

    // Validate cart items for required options
    const validationErrors: string[] = []
    cartItems.forEach((item, index) => {
      if (item.sizes && item.sizes.length > 0 && !item.selectedSize) {
        validationErrors.push(`Item ${index + 1} (${item.name}): Size is required`)
      }
      if (item.colors && item.colors.length > 0 && !item.selectedColor) {
        validationErrors.push(`Item ${index + 1} (${item.name}): Color is required`)
      }
    })

    if (validationErrors.length > 0) {
      return {
        success: false,
        error: "Required options missing: " + validationErrors.join(", "),
      }
    }

    const now = new Date()
    // Generate order ID with format: PU/DL + DDMMYY + random 3-char alphanumeric
    const deliveryPrefix = deliveryMethod === "pickup" ? "PU" : "DL"
    const dateStr = now
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })
      .replace(/\//g, "")
    const randomSuffix = Math.random().toString(36).substr(2, 3).toUpperCase()
    const orderId = `${deliveryPrefix}${dateStr}-${randomSuffix}`

    const customerName = `${firstName} ${lastName}`

    // Upload proof of payment to Google Drive
    console.log("Uploading proof of payment to Google Drive...")
    const uploadResult = await uploadProofOfPaymentToDrive(proofFile, orderId, customerName)

    if (!uploadResult.success) {
      console.error("Failed to upload proof of payment:", uploadResult.error)
      throw new Error(`Failed to upload proof of payment: ${uploadResult.error}`)
    }

    console.log("Proof of payment uploaded successfully:", uploadResult.webViewLink)

    const date = now.toLocaleDateString("en-GB")
    const time = now.toLocaleTimeString("en-GB", { hour12: false })

    const orderData: OrderData = {
      orderId,
      date,
      time,
      customerName,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      country,
      deliveryMethod,
      totalItems: itemCount,
      subtotal,
      shippingCost,
      totalAmount,
      notes,
      proofOfPaymentUrl: uploadResult.webViewLink || "",
      status: "Pending Review",
    }

    const orderItemsData: OrderItemData[] = cartItems.map((item) => ({
      orderId,
      itemId: item.id,
      productName: item.name,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
      description: item.description || "",
      selectedSize: item.selectedSize || "",
      selectedColor: item.selectedColor || "",
    }))

    await Promise.all([addOrderToGoogleSheet(orderData), addOrderItemsToGoogleSheet(orderItemsData)])

    // Store order data for PDF generation
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(
        `order-${orderId}`,
        JSON.stringify({
          order: orderData,
          items: orderItemsData,
        }),
      )
    }

    return { success: true, orderId}
  } catch (error) {
    console.error("Error submitting order:", error)
    return { success: false, error: "Failed to submit order" }
  }
}
