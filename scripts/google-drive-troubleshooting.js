console.log(`
========================================
  Google Drive Upload Troubleshooting
========================================

If you are encountering "404 File not found" or permission errors when uploading to Google Drive,
please follow these steps carefully:

1.  **Verify GOOGLE_DRIVE_FOLDER_ID:**
    -   The folder ID you are using is: 1MJlxaWMfn6yxMOSCQy3BctURr070QEWQ
    -   Go to this URL in your browser: https://drive.google.com/drive/folders/1MJlxaWMfn6yxMOSCQy3BctURr070QEWQ
    -   **Crucially, ensure this folder is located within a Google Shared Drive.** Personal Drive folders often cause permission issues with service accounts. If it's not in a Shared Drive, create a new Shared Drive and a folder within it, then use that new folder's ID.

2.  **Check Service Account Permissions:**
    -   Your Google Service Account email is: ${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "NOT_SET"}
    -   Go to the Google Shared Drive (or the specific folder within it) where you want to upload files.
    -   Right-click on the Shared Drive (or folder) and select "Manage members" or "Share".
    -   **Ensure your service account email (${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "NOT_SET"}) is added as a member with at least "Content manager" or "Editor" access.** "Viewer" access is not sufficient for uploads.
    -   If you recently changed permissions, it might take a few minutes for them to propagate.

3.  **Verify GOOGLE_PRIVATE_KEY:**
    -   Ensure your GOOGLE_PRIVATE_KEY environment variable is correctly set in Vercel.
    -   It should be the entire private key from your GCP service account JSON file, including the "-----BEGIN PRIVATE KEY-----" and "-----END PRIVATE KEY-----" headers/footers. Vercel handles newlines automatically when you paste it directly.

4.  **Update Environment Variables in Vercel:**
    -   Go to your Vercel project settings.
    -   Navigate to "Environment Variables".
    -   Double-check that \`GOOGLE_DRIVE_FOLDER_ID\`, \`GOOGLE_SERVICE_ACCOUNT_EMAIL\`, and \`GOOGLE_PRIVATE_KEY\` are correctly set and match the values from your GCP setup.
    -   If you made any changes, save them.

5.  **Redeploy Your Project:**
    -   After verifying and updating environment variables, redeploy your Vercel project. This ensures the new environment variables are picked up by your application.

6.  **Test Again:**
    -   Try uploading a proof of payment again through your shop's checkout process.

This script (scripts/setup-google-drive.js) provides a detailed guide on setting up the Google Drive environment correctly. Please refer to it for comprehensive instructions.

If the issue persists after following these steps, there might be a more complex permission or network configuration issue within your GCP project or Vercel deployment.
`)
