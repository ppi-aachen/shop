// Google Drive Troubleshooting Script

console.log("🔍 GOOGLE DRIVE TROUBLESHOOTING")
console.log("=".repeat(50))
console.log("")

async function runTroubleshooting() {
  const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n")
  const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID

  console.log("Checking environment variables...")
  let hasAllEnvVars = true
  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL) {
    console.error("❌ GOOGLE_SERVICE_ACCOUNT_EMAIL is not set.")
    hasAllEnvVars = false
  } else {
    console.log(`✅ GOOGLE_SERVICE_ACCOUNT_EMAIL: ${GOOGLE_SERVICE_ACCOUNT_EMAIL}`)
  }
  if (!GOOGLE_PRIVATE_KEY) {
    console.error("❌ GOOGLE_PRIVATE_KEY is not set.")
    hasAllEnvVars = false
  } else {
    console.log("✅ GOOGLE_PRIVATE_KEY is set.")
  }
  if (!GOOGLE_DRIVE_FOLDER_ID) {
    console.warn("⚠️ GOOGLE_DRIVE_FOLDER_ID is not set. The system will attempt to create a default folder.")
  } else {
    console.log(`✅ GOOGLE_DRIVE_FOLDER_ID: ${GOOGLE_DRIVE_FOLDER_ID}`)
  }

  if (!hasAllEnvVars) {
    console.log("\n🚫 Cannot proceed with Google Drive checks. Please set the missing environment variables.")
    console.log("Refer to scripts/setup-google-drive.js for setup instructions.")
    return
  }

  console.log("\nAttempting Google Drive authentication...")
  let accessToken = null
  try {
    // Re-using the authentication logic from lib/google-drive-upload.ts
    const now = Math.floor(Date.now() / 1000)

    const header = { alg: "RS256", typ: "JWT" }
    const payload = {
      iss: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      scope: "https://www.googleapis.com/auth/drive.file",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    }

    const base64UrlEncode = (obj) => {
      const str = typeof obj === "string" ? obj : JSON.stringify(obj)
      return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
    }

    const encodedHeader = base64UrlEncode(header)
    const encodedPayload = base64UrlEncode(payload)
    const unsignedToken = `${encodedHeader}.${encodedPayload}`

    // Helper to convert PEM to DER (simplified for script context)
    const convertPemToDer = (pem) => {
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

    const privateKeyDer = await convertPemToDer(GOOGLE_PRIVATE_KEY)

    const cryptoKey = await crypto.subtle.importKey(
      "pkcs8",
      privateKeyDer,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"],
    )

    const encoder = new TextEncoder()
    const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, encoder.encode(unsignedToken))
    const encodedSignature = base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)))
    const jwt = `${unsignedToken}.${encodedSignature}`

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }),
    })

    const authData = await response.json()
    if (!response.ok) {
      throw new Error(`Auth error: ${authData.error_description || authData.error}`)
    }
    accessToken = authData.access_token
    console.log("✅ Successfully authenticated with Google Drive API.")
  } catch (error) {
    console.error("❌ Google Drive authentication failed:")
    console.error(`   Error: ${error.message}`)
    console.error("   Please check GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY.")
    console.error("   Ensure Google Drive API is enabled in your Google Cloud project.")
    return
  }

  console.log("\nChecking Google Drive folder access...")
  if (GOOGLE_DRIVE_FOLDER_ID) {
    try {
      const folderResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files/${GOOGLE_DRIVE_FOLDER_ID}?fields=id,name,mimeType,capabilities/canAddChildren`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )

      if (!folderResponse.ok) {
        const errorData = await folderResponse.json()
        console.error(`❌ Failed to access folder ID '${GOOGLE_DRIVE_FOLDER_ID}':`)
        console.error(`   Status: ${folderResponse.status}`)
        console.error(`   Error: ${errorData.error?.message || JSON.stringify(errorData)}`)
        if (folderResponse.status === 404) {
          console.error("   This usually means the folder ID is incorrect or the service account does not have access.")
          console.error(
            "   Ensure the folder exists and is a Shared Drive, and the service account is added as a 'Content manager' or 'Editor'.",
          )
        } else if (folderResponse.status === 403) {
          console.error("   Forbidden. The service account likely does not have sufficient permissions on this folder.")
          console.error(
            "   Ensure the service account is added as a 'Content manager' or 'Editor' to the Shared Drive folder.",
          )
        }
        return
      }

      const folderData = await folderResponse.json()
      console.log(`✅ Successfully accessed folder: '${folderData.name}' (ID: ${folderData.id})`)
      console.log(`   Mime Type: ${folderData.mimeType}`)
      if (folderData.mimeType !== "application/vnd.google-apps.folder") {
        console.warn("⚠️ Warning: The provided ID points to a file, not a folder. Please provide a folder ID.")
      }
      if (folderData.capabilities && folderData.capabilities.canAddChildren) {
        console.log("✅ Service account has permission to add files to this folder.")
      } else {
        console.error("❌ Service account DOES NOT have permission to add files to this folder.")
        console.error(
          "   Ensure the service account is added as a 'Content manager' or 'Editor' to the Shared Drive folder.",
        )
      }

      // Check if it's a Shared Drive
      const aboutResponse = await fetch(
        `https://www.googleapis.com/drive/v3/about?fields=user,storageQuota,driveThemes,kind,maxImportSizes,maxUploadSizes,appInstalled,canCreateTeamDrives,canCreateDrives`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )
      const aboutData = await aboutResponse.json()
      if (aboutData.canCreateDrives) {
        // This capability indicates Shared Drive support for the user/service account
        console.log("✅ Service account has capabilities consistent with Shared Drive access.")
      } else {
        console.warn(
          "⚠️ Warning: Service account may not have full Shared Drive capabilities. Ensure it's a Shared Drive.",
        )
      }

      // Attempt to list files in the folder to confirm read access
      console("\nAttempting to list files in the folder (read access check)...")
      const listResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${GOOGLE_DRIVE_FOLDER_ID}' in parents and trashed=false&fields=files(id,name)`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )
      if (!listResponse.ok) {
        const errorData = await listResponse.json()
        console.error(`❌ Failed to list files in folder: ${errorData.error?.message || JSON.stringify(errorData)}`)
        console.error("   This indicates the service account might not have read access to the folder.")
      } else {
        const listData = await listResponse.json()
        console.log(`✅ Successfully listed ${listData.files.length} files in the folder. Read access confirmed.`)
      }
    } catch (error) {
      console.error("❌ An unexpected error occurred during folder access check:")
      console.error(`   Error: ${error.message}`)
    }
  } else {
    console.log(
      "Skipping folder access check as GOOGLE_DRIVE_FOLDER_ID is not set. The system will attempt to create a default folder on first upload.",
    )
  }

  console.log("\nTroubleshooting complete. Please review the output above.")
  console.log(
    "If issues persist, double-check your Google Cloud project setup, API enablement, and service account permissions on the Shared Drive folder.",
  )
}

runTroubleshooting()
