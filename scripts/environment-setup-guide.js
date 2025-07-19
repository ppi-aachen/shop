console.log(`
================================================================================
Vercel Shop Template - Environment Variable Setup Guide
================================================================================

To ensure your shop functions correctly, you need to set up several
environment variables. These are crucial for connecting to Google Sheets,
Google Drive, and Resend for email notifications.

--------------------------------------------------------------------------------
1. Google Sheet Setup (for Products and Orders)
--------------------------------------------------------------------------------

This template uses Google Sheets as a simple database for products and orders.

Steps:
  a. Create a new Google Sheet: Go to Google Sheets (sheets.new) and create a new spreadsheet.
  b. Name your sheets:
     - Rename the first sheet to "Products".
     - Create a second sheet and name it "Orders".
  c. Set up "Products" sheet headers (Row 1):
     - A1: id
     - B1: name
     - C1: description
     - D1: price
     - E1: image (URL to product image)
     - F1: stock
     - G1: images (JSON array of image URLs, e.g., ["url1", "url2"])
     - H1: specifications (JSON string, e.g., {"sizes": ["S", "M"], "colors": ["Red", "Blue"]})
  d. Set up "Orders" sheet headers (Row 1):
     - A1: orderId
     - B1: timestamp
     - C1: customerName
     - D1: email
     - E1: phone
     - F1: address
     - G1: city
     - H1: state
     - I1: zipCode
     - J1: country
     - K1: deliveryMethod
     - L1: totalItems
     - M1: subtotal
     - N1: shippingCost
     - O1: totalAmount
     - P1: notes
     - Q1: proofOfPaymentLink
     - R1: status
     - S1: itemsSummary
  e. Populate "Products" sheet: Add some dummy product data following the headers.
  f. Get your Google Sheet ID: The ID is part of the URL.
     Example: https://docs.google.com/spreadsheets/d/<YOUR_SHEET_ID_HERE>/edit
     Copy this ID.

--------------------------------------------------------------------------------
2. Google Service Account Setup (for API Access)
--------------------------------------------------------------------------------

To allow your application to read/write to Google Sheets and upload to Google Drive,
you need a Google Service Account.

Steps:
  a. Go to Google Cloud Console: console.cloud.google.com
  b. Create a new project (if you don't have one) or select an existing one.
  c. Enable APIs:
     - In the search bar, search for "Google Sheets API" and enable it.
     - Search for "Google Drive API" and enable it.
  d. Create Service Account Credentials:
     - Navigate to "APIs & Services" > "Credentials".
     - Click "CREATE CREDENTIALS" > "Service Account".
     - Follow the steps to create a new service account.
     - Grant it the "Editor" role (or more specific roles like "Google Sheets Editor" and "Google Drive Editor" for production).
     - In step 2, click "CREATE KEY" and choose "JSON". This will download a JSON file.
       SAVE THIS FILE SECURELY.
  e. Extract credentials from JSON file:
     - Open the downloaded JSON file.
     - Copy the 'client_email' value. This will be your GOOGLE_SERVICE_ACCOUNT_EMAIL.
     - Copy the 'private_key' value. This will be your GOOGLE_PRIVATE_KEY.
       (Note: The private key will contain "\\n" characters. You might need to replace them with actual newlines if you're pasting into some environments, but Vercel usually handles this automatically.)
  f. Share your Google Sheet with the Service Account:
     - Go back to your Google Sheet.
     - Click the "Share" button.
     - Paste the 'client_email' (from step 2.e) into the "Add people and groups" field.
     - Grant it "Editor" access.

--------------------------------------------------------------------------------
3. Google Drive Folder Setup (for Proof of Payment Uploads)
--------------------------------------------------------------------------------

This template uploads proof of payment images/PDFs to a specific Google Drive folder.

Steps:
  a. Create a new folder in Google Drive: Go to drive.google.com and create a new folder.
     Name it something like "Aachen Studio Payments".
  b. Get the Folder ID: Open the folder. The ID is in the URL.
     Example: https://drive.google.com/drive/folders/<YOUR_FOLDER_ID_HERE>
     Copy this ID.
  c. Share the folder with the Service Account:
     - Right-click the folder, select "Share" > "Share".
     - Paste the 'client_email' (from step 2.e) into the "Add people and groups" field.
     - Grant it "Editor" access.

--------------------------------------------------------------------------------
4. Resend API Key Setup (for Email Notifications)
--------------------------------------------------------------------------------

This template uses Resend to send order confirmation emails.

Steps:
  a. Go to Resend: resend.com
  b. Sign up or log in.
  c. Add a domain: Follow their instructions to add and verify your sending domain
     (e.g., yourdomain.com or a subdomain like mail.yourdomain.com).
  d. Create an API Key: Go to "API Keys" and create a new API key.
     Copy this key.

--------------------------------------------------------------------------------
5. Set Environment Variables in Vercel
--------------------------------------------------------------------------------

Finally, add these values as Environment Variables in your Vercel project settings.
Go to your Vercel project dashboard -> "Settings" -> "Environment Variables".

Add the following variables:

  - GOOGLE_SHEET_ID: Your Google Sheet ID (from step 1.f)
  - GOOGLE_SERVICE_ACCOUNT_EMAIL: Your service account client_email (from step 2.e)
  - GOOGLE_PRIVATE_KEY: Your service account private_key (from step 2.e)
  - GOOGLE_DRIVE_FOLDER_ID: Your Google Drive folder ID (from step 3.b)
  - RESEND_API_KEY: Your Resend API Key (from step 4.d)
  - NEXT_PUBLIC_VERCEL_URL: Set this to your Vercel deployment URL (e.g., https://your-project-name.vercel.app).
    This is used for the link in the confirmation email. For local development, it will be http://localhost:3000.

Make sure these are available for both "Development", "Preview", and "Production" environments.

================================================================================
Once all variables are set, redeploy your project.
If you encounter issues, refer to the troubleshooting scripts in the 'scripts' folder.
================================================================================
`)
