interface GoogleDriveUploadResult {
  success: boolean
  fileId?: string
  webViewLink?: string
  error?: string
}

async function getGoogleDriveAuth(): Promise<string> {
  const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n")

  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    throw new Error(
      "Google Drive credentials not configured. Please ensure GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY are set.",
    )
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

async function getProofOfPaymentFolderId(): Promise<string> {
  const envFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID

  if (!envFolderId) {
    throw new Error(
      "GOOGLE_DRIVE_FOLDER_ID environment variable is not set. " +
        "Please create a folder in a Google Shared Drive, share it with your service account, " +
        "and set its ID as GOOGLE_DRIVE_FOLDER_ID.",
    )
  }

  console.log("Using Google Drive folder ID from environment variables:", envFolderId)
  return envFolderId
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

    // Get folder ID (now strictly from env)
    const folderId = await getProofOfPaymentFolderId()
    console.log("Using folder ID:", folderId)

    // Create a descriptive filename
    const fileExtension = file.name.split(".").pop() || "unknown"
    const sanitizedCustomerName = customerName.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_")
    const timestamp = new Date().toISOString().split("T")[0] // YYYY-MM-DD format
    const fileName = `${orderId}_${sanitizedCustomerName}_${timestamp}.${fileExtension}`

    console.log("Uploading file:", fileName)

    // Convert file to ArrayBuffer then to base64
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    const binaryString = Array.from(uint8Array, (byte) => String.fromCharCode(byte)).join("")
    const base64Data = btoa(binaryString)

    // Create multipart body
    const boundary = "foo_bar_baz"
    const delimiter = "\r\n--" + boundary + "\r\n"
    const close_delim = "\r\n--" + boundary + "--"

    const metadata = {
      name: fileName,
      parents: [folderId],
      description: `Proof of payment for order ${orderId} from ${customerName}`,
      // Specify supportsAllDrives for Shared Drive uploads
      // This is crucial for uploading to Shared Drives
      supportsAllDrives: true,
    }

    const multipartRequestBody =
      delimiter +
      "Content-Type: application/json\r\n\r\n" +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${file.type}\r\n` +
      "Content-Transfer-Encoding: base64\r\n\r\n" +
      base64Data +
      close_delim

    // Upload file to Google Drive
    const uploadResponse = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary="${boundary}"`,
      },
      body: multipartRequestBody,
    })

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      throw new Error(`Upload failed: ${uploadResponse.statusText} - ${errorText}`)
    }

    const uploadData = await uploadResponse.json()
    console.log("File uploaded successfully:", uploadData.id)

    // Make file publicly readable (optional, but good for sharing links)
    try {
      const shareResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${uploadData.id}/permissions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: "reader",
          type: "anyone",
        }),
      })

      if (!shareResponse.ok) {
        console.warn("Failed to make file publicly readable, but upload succeeded")
      } else {
        console.log("File made publicly readable")
      }
    } catch (shareError) {
      console.warn("Error making file public:", shareError)
    }

    // Get file details including web view link
    const fileResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${uploadData.id}?fields=id,name,webViewLink,webContentLink`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    const fileData = await fileResponse.json()
    const webViewLink = fileData.webViewLink || `https://drive.google.com/file/d/${uploadData.id}/view`

    console.log("Upload completed successfully. File link:", webViewLink)

    return {
      success: true,
      fileId: uploadData.id,
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
