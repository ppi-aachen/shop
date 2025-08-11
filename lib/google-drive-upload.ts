import { google } from "googleapis"
import type { File } from "formidable"
import { uploadFileToGoogleDrive } from "./uploadFileToGoogleDrive" // Import the missing function

interface GoogleDriveUploadResult {
  success: boolean
  fileId?: string
  webViewLink?: string
  error?: string
}

// Google Drive API configuration
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n")

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: GOOGLE_PRIVATE_KEY,
  },
  scopes: ["https://www.googleapis.com/auth/drive.file"],
})

const drive = google.drive({ version: "v3", auth })

async function getGoogleDriveAuth(): Promise<string> {
  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    throw new Error("Google Drive credentials not configured")
  }

  try {
    const now = Math.floor(Date.now() / 1000)

    const header = {
      alg: "RS256",
      typ: "JWT",
    }

    const payload = {
      iss: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      scope: "https://www.googleapis.com/auth/drive.file",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    }

    // Simplified base64 URL encoding
    const base64UrlEncode = (obj: any): string => {
      const str = typeof obj === "string" ? obj : JSON.stringify(obj)
      return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
    }

    const encodedHeader = base64UrlEncode(header)
    const encodedPayload = base64UrlEncode(payload)
    const unsignedToken = `${encodedHeader}.${encodedPayload}`

    // Import the private key
    const privateKeyPem = GOOGLE_PRIVATE_KEY
    const privateKeyDer = await convertPemToDer(privateKeyPem)

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

    // Sign the token
    const encoder = new TextEncoder()
    const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, encoder.encode(unsignedToken))

    const encodedSignature = base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)))

    const jwt = `${unsignedToken}.${encodedSignature}`

    // Get access token
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
  } catch (error) {
    console.error("Error in getGoogleDriveAuth:", error)
    throw new Error(
      `Failed to authenticate with Google Drive: ${error instanceof Error ? error.message : "Unknown error"}`,
    )
  }
}

async function convertPemToDer(pem: string): Promise<ArrayBuffer> {
  try {
    // Clean the PEM string
    const pemContents = pem
      .replace(/-----BEGIN PRIVATE KEY-----/, "")
      .replace(/-----END PRIVATE KEY-----/, "")
      .replace(/\s/g, "")

    // Convert base64 to binary
    const binaryString = atob(pemContents)
    const bytes = new Uint8Array(binaryString.length)

    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    return bytes.buffer
  } catch (error) {
    throw new Error(`Failed to convert PEM to DER: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

async function getProofOfPaymentFolderId(accessToken: string): Promise<string> {
  try {
    // First check if folder ID is provided in environment variables
    const envFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID

    if (envFolderId) {
      console.log("Using folder ID from environment variables:", envFolderId)
      return envFolderId
    }

    // Fallback: Create or find the default folder
    const folderName = "Aachen Studio - Proof of Payments"
    console.log("No folder ID provided, searching for or creating folder:", folderName)

    // Check if folder already exists
    const searchResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false&supportsAllDrives=true&includeItemsFromAllDrives=true`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    if (!searchResponse.ok) {
      throw new Error(`Failed to search for folder: ${searchResponse.statusText}`)
    }

    const searchData = await searchResponse.json()

    if (searchData.files && searchData.files.length > 0) {
      console.log("Found existing folder:", searchData.files[0].id)
      return searchData.files[0].id
    }

    // Create folder if it doesn't exist
    console.log("Creating new folder:", folderName)
    const createResponse = await fetch("https://www.googleapis.com/drive/v3/files", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
      }),
    })

    if (!createResponse.ok) {
      throw new Error(`Failed to create folder: ${createResponse.statusText}`)
    }

    const createData = await createResponse.json()
    console.log("Created new folder with ID:", createData.id)
    return createData.id
  } catch (error) {
    throw new Error(`Failed to get folder ID: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function uploadProofOfPaymentToDrive(
  file: File,
  orderId: string,
  customerName: string,
): Promise<GoogleDriveUploadResult> {
  try {
    console.log("Starting Google Drive upload for order:", orderId)

    // Get access token
    const accessToken = await getGoogleDriveAuth()
    console.log("Successfully authenticated with Google Drive")

    // Get folder ID
    const folderId = await getProofOfPaymentFolderId(accessToken)
    console.log("Using folder ID:", folderId)

    // Create a descriptive filename
    const fileExtension = file.name.split(".").pop() || "unknown"
    const sanitizedCustomerName = customerName.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_")
    const timestamp = new Date().toISOString().split("T")[0] // YYYY-MM-DD format
    const fileName = `${orderId}_${sanitizedCustomerName}_${timestamp}.${fileExtension}`

    console.log("Uploading file:", fileName)

    // Convert file to ArrayBuffer then to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    const fileBuffer = Buffer.from(uint8Array)

    // Upload file to Google Drive using the updated function
    const fileId = await uploadFileToGoogleDrive(fileName, file.type, fileBuffer, folderId)
    console.log("File uploaded successfully:", fileId)

    // Get file details including web view link
    const fileResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,webViewLink,webContentLink`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    const fileData = await fileResponse.json()
    const webViewLink =
      fileData.webViewLink ||
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,webViewLink,webContentLink&supportsAllDrives=true`

    console.log("Upload completed successfully. File link:", webViewLink)

    return {
      success: true,
      fileId: fileId,
      webViewLink: webViewLink,
    }
  } catch (error) {
    console.error("Error uploading to Google Drive:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
