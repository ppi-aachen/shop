import { google } from "googleapis"
import { getGoogleAuthClient } from "./google-auth-utils"

interface GoogleDriveUploadResult {
  success: boolean
  fileId?: string
  webViewLink?: string
  error?: string
}

export async function uploadProofOfPaymentToDrive(
  file: File,
  orderId: string,
  customerName: string,
): Promise<GoogleDriveUploadResult> {
  try {
    const auth = getGoogleAuthClient()
    const drive = google.drive({ version: "v3", auth })

    const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID

    if (!GOOGLE_DRIVE_FOLDER_ID) {
      throw new Error("GOOGLE_DRIVE_FOLDER_ID environment variable is not set. Cannot upload to Google Drive.")
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer())

    const fileExtension = file.name.split(".").pop() || "unknown"
    const sanitizedCustomerName = customerName.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_")
    const timestamp = new Date().toISOString().split("T")[0] // YYYY-MM-DD format
    const fileName = `${orderId}_${sanitizedCustomerName}_${timestamp}.${fileExtension}`

    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [GOOGLE_DRIVE_FOLDER_ID],
        mimeType: file.type,
      },
      media: {
        mimeType: file.type,
        body: fileBuffer,
      },
      fields: "id, webViewLink",
    })

    if (!response.data.webViewLink) {
      throw new Error("Failed to get webViewLink after upload.")
    }

    // Make file publicly readable (anyone with link can view)
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    })

    console.log(`File uploaded to Google Drive: ${response.data.webViewLink}`)
    return {
      success: true,
      fileId: response.data.id,
      webViewLink: response.data.webViewLink,
    }
  } catch (error) {
    console.error("Error uploading file to Google Drive:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
