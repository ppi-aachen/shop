import { google } from "googleapis"
import { Readable } from "stream"

// Google Drive configuration
const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n") // Handle escaped newlines

export async function uploadProofOfPaymentToDrive(
  file: File,
  orderId: string,
  customerName: string,
): Promise<{ success: boolean; webViewLink?: string; error?: string }> {
  if (!GOOGLE_DRIVE_FOLDER_ID || !GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    return {
      success: false,
      error: "Google Drive environment variables are not fully configured.",
    }
  }

  try {
    const auth = new google.auth.JWT(GOOGLE_SERVICE_ACCOUNT_EMAIL, undefined, GOOGLE_PRIVATE_KEY, [
      "https://www.googleapis.com/auth/drive",
    ])

    await auth.authorize()

    const drive = google.drive({ version: "v3", auth })

    // Sanitize filename to be web-friendly and include order details
    const originalFileName = file.name
    const fileExtension = originalFileName.split(".").pop()
    const sanitizedCustomerName = customerName.replace(/[^a-zA-Z0-9]/g, "_")
    const fileName = `Proof_of_Payment_${orderId}_${sanitizedCustomerName}.${fileExtension}`

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Create a Readable stream from the buffer
    const media = {
      mimeType: file.type,
      body: Readable.from(buffer),
    }

    const requestBody = {
      name: fileName,
      parents: [GOOGLE_DRIVE_FOLDER_ID],
    }

    const response = await drive.files.create({
      requestBody: requestBody,
      media: media,
      fields: "id, webViewLink",
    })

    if (response.status === 200 && response.data.webViewLink) {
      console.log("File uploaded successfully:", response.data.webViewLink)
      return { success: true, webViewLink: response.data.webViewLink }
    } else {
      console.error("Google Drive upload failed:", response.status, response.statusText, response.data)
      return {
        success: false,
        error: `Google Drive upload failed: ${response.statusText || "Unknown error"}`,
      }
    }
  } catch (error: any) {
    console.error("Error uploading to Google Drive:", error.message, error.errors)
    let errorMessage = "An unexpected error occurred during Google Drive upload."
    if (error.code === 404) {
      errorMessage =
        "Google Drive folder not found. Please ensure GOOGLE_DRIVE_FOLDER_ID is correct and points to an existing folder in a Shared Drive."
    } else if (error.code === 403) {
      errorMessage =
        "Permission denied. Ensure the service account has 'Content manager' or 'Editor' access to the Google Drive folder."
    } else if (error.errors && error.errors.length > 0) {
      errorMessage = error.errors.map((err: any) => err.message).join("; ")
    }
    return { success: false, error: errorMessage }
  }
}
