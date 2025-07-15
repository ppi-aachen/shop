console.log(`
========================================
  Aachen Studio Webshop Setup Guide
========================================

This guide will help you set up the necessary environment variables for the Aachen Studio webshop.
You will need:
1. A Google Sheet for storing order data.
2. A Google Cloud Platform (GCP) project with a service account for Google Sheets and Google Drive API access.
3. A Resend API Key for sending emails.
4. A Google Shared Drive folder for storing proof of payment files.

----------------------------------------
Step 1: Google Sheet Setup
----------------------------------------
1. Create a new Google Sheet.
2. Name the sheet (e.g., "Aachen Studio Orders").
3. Create two tabs (worksheets) named exactly:
   - "Orders"
   - "Order_Items"
4. In the "Orders" tab, add the following headers in the first row (A1:S1):
   OrderId, Date, Time, CustomerName, Email, Phone, Address, City, State, ZipCode, Country, DeliveryMethod, TotalItems, Subtotal, ShippingCost, TotalAmount, Notes, ProofOfPaymentUrl, Status
5. In the "Order_Items" tab, add the following headers in the first row (A1:I1):
   OrderId, ItemId, ProductName, Price, Quantity, Subtotal, Description, SelectedSize, SelectedColor
6. Get the Google Sheet ID from the URL:
   The URL looks like: https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit
   Copy the ID and set it as GOOGLE_SHEET_ID in your .env.local file.
   Example: GOOGLE_SHEET_ID=123abc...xyz

----------------------------------------
Step 2: Google Cloud Platform (GCP) Setup
----------------------------------------
1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Create a new project or select an existing one.
3. Enable APIs:
   - Navigate to "APIs & Services" > "Enabled APIs & Services".
   - Click "+ ENABLE APIS AND SERVICES".
   - Search for and enable:
     - "Google Sheets API"
     - "Google Drive API"
4. Create a Service Account:
   - Navigate to "IAM & Admin" > "Service Accounts".
   - Click "+ CREATE SERVICE ACCOUNT".
   - Enter a Service account name (e.g., "aachen-studio-service").
   - Click "DONE".
   - Click on the newly created service account's email address.
   - Go to the "Keys" tab.
   - Click "ADD KEY" > "Create new key".
   - Select "JSON" and click "CREATE".
   - A JSON file will be downloaded. This file contains your private key and client email.
   - Open the JSON file.
   - Copy the "client_email" value and set it as GOOGLE_SERVICE_ACCOUNT_EMAIL in .env.local.
     Example: GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project-id.iam.gserviceaccount.com
   - Copy the "private_key" value (including "-----BEGIN PRIVATE KEY-----" and "-----END PRIVATE KEY-----" and all newline characters) and set it as GOOGLE_PRIVATE_KEY in .env.local.
     Example: GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
     NOTE: Ensure the private key is enclosed in double quotes and newline characters are escaped as \\n if you are putting it directly into a .env file. Vercel handles this automatically if you paste it directly into the environment variable field.

5. Share Google Sheet with Service Account:
   - Go back to your Google Sheet (from Step 1).
   - Click the "Share" button.
   - Add the GOOGLE_SERVICE_ACCOUNT_EMAIL (from the JSON key file) as an editor.

----------------------------------------
Step 3: Google Shared Drive Setup for Proof of Payment
----------------------------------------
1. Create a Google Shared Drive:
   - Go to Google Drive: https://drive.google.com/drive/shared-drives
   - Click "+ New" > "Shared drive".
   - Name it (e.g., "Aachen Studio Proofs").
2. Create a folder within the Shared Drive:
   - Open your new Shared Drive.
   - Click "+ New" > "Folder".
   - Name it (e.g., "Payment Proofs").
3. Get the Shared Drive Folder ID:
   - Navigate into the "Payment Proofs" folder.
   - The URL will look like: https://drive.google.com/drive/folders/YOUR_FOLDER_ID_HERE?usp=sharing
   - Copy the folder ID and set it as GOOGLE_DRIVE_FOLDER_ID in your .env.local file.
     Example: GOOGLE_DRIVE_FOLDER_ID=abc123xyz
4. Manage Shared Drive Permissions:
   - Right-click on your "Aachen Studio Proofs" Shared Drive (or the specific "Payment Proofs" folder if you prefer more granular control).
   - Select "Manage members".
   - Add the GOOGLE_SERVICE_ACCOUNT_EMAIL (from your GCP service account JSON key) as a "Content manager" or "Editor". This is crucial for the service account to be able to upload files.
   - Ensure that "Anyone with the link" access is NOT given to the Shared Drive itself, only to the specific folder if you intend for public viewing of uploaded proofs (which is generally not recommended for sensitive data). The service account access is what matters for uploads.

----------------------------------------
Step 4: Resend API Key Setup
----------------------------------------
1. Go to Resend: https://resend.com/
2. Sign up or log in.
3. Create a new API Key.
4. Copy the API Key and set it as RESEND_API_KEY in your .env.local file.
   Example: RESEND_API_KEY=re_123abc...xyz

----------------------------------------
Step 5: Update .env.local
----------------------------------------
Create a file named .env.local in the root of your project and add all the variables:

GOOGLE_SHEET_ID=YOUR_GOOGLE_SHEET_ID
GOOGLE_SERVICE_ACCOUNT_EMAIL=YOUR_SERVICE_ACCOUNT_EMAIL
GOOGLE_PRIVATE_KEY="YOUR_PRIVATE_KEY_WITH_ESCAPED_NEWLINES"
RESEND_API_KEY=YOUR_RESEND_API_KEY
GOOGLE_DRIVE_FOLDER_ID=YOUR_GOOGLE_DRIVE_FOLDER_ID

----------------------------------------
Step 6: Deploy to Vercel
----------------------------------------
1. If you are deploying to Vercel, go to your project settings.
2. Navigate to "Environment Variables".
3. Add each of the variables (GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, RESEND_API_KEY, GOOGLE_DRIVE_FOLDER_ID) with their respective values.
   - For GOOGLE_PRIVATE_KEY, paste the entire key including BEGIN/END markers directly into the value field. Vercel will handle the newlines correctly.
4. Redeploy your project.

----------------------------------------
Troubleshooting
----------------------------------------
- If you encounter "404 File not found" errors for Google Drive uploads, double-check that GOOGLE_DRIVE_FOLDER_ID points to a folder within a Shared Drive, and that the service account has "Content manager" or "Editor" access to that specific folder.
- Ensure your Google Private Key is correctly formatted with escaped newlines if in .env.local, or pasted directly into Vercel environment variables.
- Use the 'npm run check-env' script to verify your local environment variables.
- Use the 'npm run google-drive-troubleshooting' script for specific Google Drive issues.
- Use the 'npm run resend-troubleshooting' script for specific Resend issues.

If you have any questions, feel free to ask!
`)
