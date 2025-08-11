"use server"

import { google } from "googleapis"
import { getProductsFromGoogleSheet as getProducts } from "./actions" // Renamed to avoid conflict
import { uploadFileToGoogleDrive } from "@/lib/google-drive-upload"

// Re-export existing getProductsFromGoogleSheet for other parts of the app
export { getProducts as getProductsFromGoogleSheet }

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"],
})

const sheets = google.sheets({ version: "v4", auth })

export async function submitOrderWithProofOfPayment(formData: FormData) {
  const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID
  const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID

  if (!GOOGLE_SHEET_ID || !GOOGLE_DRIVE_FOLDER_ID) {
    return { success: false, message: "Server configuration error: Google Sheet ID or Drive Folder ID missing." }
  }

  const customerName = formData.get("customerName") as string
  const customerContact = formData.get("customerContact") as string
  const deliveryAddress = formData.get("deliveryAddress") as string
  const cartItemsJson = formData.get("cartItems") as string
  const totalAmount = formData.get("totalAmount") as string
  const proofOfPaymentFile = formData.get("proofOfPayment") as File

  if (!customerName || !customerContact || !deliveryAddress || !cartItemsJson || !totalAmount || !proofOfPaymentFile) {
    return { success: false, message: "Missing required order details or proof of payment file." }
  }

  let proofOfPaymentUrl = ""
  try {
    const buffer = Buffer.from(await proofOfPaymentFile.arrayBuffer())
    const fileId = await uploadFileToGoogleDrive(
      proofOfPaymentFile.name,
      proofOfPaymentFile.type,
      buffer,
      GOOGLE_DRIVE_FOLDER_ID,
    )
    proofOfPaymentUrl = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`
  } catch (error) {
    console.error("Error uploading proof of payment to Google Drive:", error)
    return { success: false, message: "Failed to upload proof of payment. Please try again." }
  }

  const cartItems = JSON.parse(cartItemsJson)
  const orderDetails = cartItems
    .map(
      (item: any) =>
        `${item.name} (ID: ${item.id}${item.selectedSize ? `, Size: ${item.selectedSize}` : ""}${item.selectedColor ? `, Color: ${item.selectedColor}` : ""}) x${item.quantity} @ €${item.price.toFixed(2)}`,
    )
    .join("; ")

  const timestamp = new Date().toISOString()

  const rowData = [
    timestamp,
    customerName,
    customerContact,
    deliveryAddress,
    orderDetails,
    totalAmount,
    proofOfPaymentUrl,
  ]

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: "Orders!A:G", // Assuming a sheet named 'Orders' with columns A-G
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [rowData],
      },
    })

    return { success: true, message: "Order submitted successfully and proof of payment uploaded!" }
  } catch (error: any) {
    console.error("Error appending to Google Sheet:", error.message, error.stack)
    return { success: false, message: `Failed to save order to Google Sheet: ${error.message}` }
  }
}
