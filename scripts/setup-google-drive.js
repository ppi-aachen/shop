const { google } = require("googleapis")
const { JWT } = require("google-auth-library")
const readline = require("readline")

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

async function setupGoogleDrive() {
  console.log(`
========================================
  Google Drive Setup Guide
========================================
This script will help you verify your Google Drive folder setup for proof of payment uploads.

Before running this script, ensure you have:
1. Created a Google Shared Drive (recommended for service accounts).
2. Created a folder within that Shared Drive for payment proofs.
3. Enabled "Google Drive API" in your Google Cloud Project.
4. Created a Service Account and downloaded its JSON key file.
5. Shared your Google Shared Drive (or the specific folder) with the Service Account email
   as a "Content manager" or "Editor".

You need to have the following environment variables set in your .env.local file:
- GOOGLE_DRIVE_FOLDER_ID
- GOOGLE_SERVICE_ACCOUNT_EMAIL
- GOOGLE_PRIVATE_KEY (the entire private key string, including newlines)
`)

  const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID
  const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n") // Handle escaped newlines

  if (!GOOGLE_DRIVE_FOLDER_ID || !GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    console.error("❌ Error: Missing one or more required environment variables.")
    console.error(
      "Please ensure GOOGLE_DRIVE_FOLDER_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, and GOOGLE_PRIVATE_KEY are set in your .env.local file.",
    )
    rl.close()
    return
  }

  const auth = new google.auth.JWT(
    GOOGLE_SERVICE_ACCOUNT_EMAIL,
    undefined,
    GOOGLE_PRIVATE_KEY,
    ["https://www.googleapis.com/auth/drive.readonly"], // Use readonly for initial check
  )

  const drive = google.drive({ version: "v3", auth })

  try {
    console.log(`\nAttempting to verify Google Drive folder with ID: ${GOOGLE_DRIVE_FOLDER_ID}`)
    const res = await drive.files.get({
      fileId: GOOGLE_DRIVE_FOLDER_ID,
      fields: "id, name, mimeType, parents, capabilities",
    })

    const folder = res.data
    console.log(`✅ Successfully found folder: "${folder.name}" (ID: ${folder.id})`)
    console.log(`MIME Type: ${folder.mimeType}`)

    if (folder.mimeType !== "application/vnd.google-apps.folder") {
      console.warn("⚠️ Warning: The provided ID does not point to a Google Drive folder.")
      console.warn("Please ensure GOOGLE_DRIVE_FOLDER_ID is the ID of a folder, not a file.")
    }

    // Check if it's a Shared Drive folder
    if (folder.parents && folder.parents.length > 0) {
      const parentId = folder.parents[0]
      try {
        const parentRes = await drive.files.get({
          fileId: parentId,
          fields: "id, name, capabilities",
          supportsAllDrives: true, // Required for Shared Drives
        })
        if (parentRes.data.capabilities?.canAddChildren) {
          // A simple heuristic for Shared Drive
          console.log(`✅ Folder "${folder.name}" appears to be within a Shared Drive.`)
        } else {
          console.warn("⚠️ Warning: The folder might not be in a Google Shared Drive.")
          console.warn(
            "For service account uploads, it is highly recommended to use a folder within a Google Shared Drive to avoid permission issues.",
          )
          console.warn(
            "If you continue to face '404 File not found' or permission errors, please move this folder to a Shared Drive.",
          )
        }
      } catch (parentError) {
        console.warn("⚠️ Could not determine parent type. Ensure the folder is in a Shared Drive.")
      }
    } else {
      console.warn("⚠️ Warning: The folder appears to be a root folder or not have a clear parent.")
      console.warn(
        "For service account uploads, it is highly recommended to use a folder within a Google Shared Drive to avoid permission issues.",
      )
      console.warn(
        "If you continue to face '404 File not found' or permission errors, please move this folder to a Shared Drive.",
      )
    }

    // Check service account permissions for writing
    console.log("\nChecking service account write permissions...")
    const permissionAuth = new google.auth.JWT(
      GOOGLE_SERVICE_ACCOUNT_EMAIL,
      undefined,
      GOOGLE_PRIVATE_KEY,
      ["https://www.googleapis.com/auth/drive"], // Use full drive scope for permission check
    )
    await permissionAuth.authorize()

    try {
      // Attempt to list permissions for the folder
      const permissionsRes = await drive.permissions.list({
        fileId: GOOGLE_DRIVE_FOLDER_ID,
        fields: "permissions(id,role,type,emailAddress)",
        supportsAllDrives: true,
      })

      const serviceAccountPermission = permissionsRes.data.permissions?.find(
        (p) => p.emailAddress === GOOGLE_SERVICE_ACCOUNT_EMAIL,
      )

      if (serviceAccountPermission) {
        console.log(
          `✅ Service account "${GOOGLE_SERVICE_ACCOUNT_EMAIL}" found with role: "${serviceAccountPermission.role}"`,
        )
        if (
          serviceAccountPermission.role === "writer" ||
          serviceAccountPermission.role === "owner" ||
          serviceAccountPermission.role === "organizer" ||
          serviceAccountPermission.role === "fileOrganizer"
        ) {
          console.log(
            "🎉 Service account has sufficient permissions ('writer', 'owner', 'organizer', or 'fileOrganizer') to upload files.",
          )
        } else if (serviceAccountPermission.role === "reader") {
          console.warn(
            "⚠️ Warning: Service account has 'reader' permission. This is NOT sufficient for uploading files.",
          )
          console.warn(
            "Please change the service account's role to 'Content manager' or 'Editor' for the Google Drive folder.",
          )
        } else {
          console.warn(`⚠️ Warning: Service account has an unexpected role: "${serviceAccountPermission.role}".`)
          console.warn(
            "Please ensure the service account has 'Content manager' or 'Editor' access to the Google Drive folder.",
          )
        }
      } else {
        console.error("❌ Service account does NOT have explicit permissions on this folder.")
        console.error(
          `Please ensure "${GOOGLE_SERVICE_ACCOUNT_EMAIL}" is added as a 'Content manager' or 'Editor' to the Google Drive folder.`,
        )
      }
    } catch (permError) {
      console.error("❌ Could not retrieve service account permissions for the folder.")
      console.error("This might indicate a permission issue itself or incorrect setup.")
      console.error(
        `Please manually verify that "${GOOGLE_SERVICE_ACCOUNT_EMAIL}" has 'Content manager' or 'Editor' access to the Google Drive folder.`,
      )
      console.error(permError)
    }

    console.log("\nGoogle Drive setup check complete.")
    console.log(
      "If all checks passed, your setup should be correct. If you still face issues, double-check all steps in 'scripts/environment-setup-guide.js'.",
    )
  } catch (e) {
    console.error("❌ An error occurred during Google Drive setup check:")
    if (e.code === 404) {
      console.error("Folder not found. Please ensure:")
      console.error(`- The GOOGLE_DRIVE_FOLDER_ID "${GOOGLE_DRIVE_FOLDER_ID}" is correct.`)
      console.error("- The folder exists and is not deleted.")
      console.error("- The folder is within a Google Shared Drive (highly recommended).")
    } else if (e.code === 403) {
      console.error("Permission denied. Please ensure:")
      console.error(
        `- The service account email "${GOOGLE_SERVICE_ACCOUNT_EMAIL}" has 'Viewer' or higher access to the Google Drive folder for this check.`,
      )
      console.error("- The Google Drive API is enabled in your Google Cloud Project.")
    } else {
      console.error(e)
    }
    console.error("\nFor more detailed instructions, refer to the 'scripts/environment-setup-guide.js' file.")
  } finally {
    rl.close()
  }
}

setupGoogleDrive()
