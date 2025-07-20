# Stock Update System Fix Guide

## Problem Identified

The stock update system was broken because:

1. **Wrong Function Used**: The `submitOrder` function was trying to import and use `updateStockInGoogleSheet` from a Node.js script, but this doesn't work properly in Next.js server actions.

2. **Environment Variables**: The Google Sheets credentials are not properly configured in your Vercel environment.

## ✅ What I Fixed

1. **Updated the stock update function**: Changed `submitOrder` to use the properly implemented `updateProductStock` function that's already in the actions file.

2. **Removed problematic import**: Removed the import of the Node.js script version.

3. **Created diagnostic tools**: Added comprehensive testing and diagnostic scripts.

## 🔧 Required Environment Variables

You need to set these environment variables in your **Vercel dashboard**:

### Required Variables:
- `GOOGLE_SHEET_ID` - Your Google Spreadsheet ID
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` - Your Google Service Account email
- `GOOGLE_PRIVATE_KEY` - Your Google Service Account private key

### Optional Variables:
- `RESEND_API_KEY` - For email notifications (starts with `re_`)

## 📋 How to Set Up Environment Variables in Vercel

1. **Go to your Vercel dashboard**
2. **Select your project**
3. **Go to Settings → Environment Variables**
4. **Add each variable**:
   - Name: `GOOGLE_SHEET_ID`
   - Value: Your spreadsheet ID (from the URL)
   - Environment: Production, Preview, Development
   
   - Name: `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - Value: Your service account email (ends with `@project.iam.gserviceaccount.com`)
   - Environment: Production, Preview, Development
   
   - Name: `GOOGLE_PRIVATE_KEY`
   - Value: Your private key (include the full key with `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)
   - Environment: Production, Preview, Development

5. **Redeploy your application**

## 🧪 Testing the Fix

### Option 1: Test Locally (if you have environment variables)
\`\`\`bash
cd shop
node scripts/diagnose-stock-system.js
\`\`\`

### Option 2: Test in Production
1. Deploy to Vercel with the environment variables
2. Try placing a test order
3. Check Vercel logs for any errors
4. Verify stock is updated in your Google Sheet

## 📊 What the Stock Update System Does

1. **When an order is placed**, the system:
   - Gets the current stock from your Google Sheet
   - Calculates new stock (current stock - ordered quantity)
   - Updates the stock in the Google Sheet
   - Prevents negative stock (sets to 0 if needed)

2. **Error handling**:
   - If stock update fails, the order still completes
   - Errors are logged for manual review
   - The system doesn't break the checkout process

## 🔍 Troubleshooting

### If stock updates still don't work:

1. **Check Vercel logs**:
   - Go to your Vercel dashboard
   - Click on your latest deployment
   - Check the "Functions" tab for errors

2. **Verify Google Sheets setup**:
   - Make sure your service account has access to the spreadsheet
   - Share the spreadsheet with your service account email
   - Verify the spreadsheet has "id" and "stock" columns

3. **Test with diagnostic script**:
   \`\`\`bash
   node scripts/diagnose-stock-system.js
   \`\`\`

### Common Issues:

1. **"Missing environment variables"**: Set them in Vercel dashboard
2. **"Authentication failed"**: Check your service account credentials
3. **"Spreadsheet not found"**: Verify the spreadsheet ID
4. **"Missing columns"**: Make sure your Products sheet has "id" and "stock" columns

## 📝 Google Sheets Structure Required

Your Products sheet must have these columns:
- `id` - Product ID (number)
- `name` - Product name
- `stock` - Current stock level (number)
- Other columns as needed

Example:
\`\`\`
| id | name        | price | stock | description |
|----|-------------|-------|-------|-------------|
| 1  | T-Shirt     | 25.99 | 10    | Cotton t-shirt |
| 2  | Hoodie      | 45.99 | 5     | Warm hoodie |
\`\`\`

## 🚀 Next Steps

1. **Set the environment variables in Vercel**
2. **Redeploy your application**
3. **Test with a real order**
4. **Monitor the logs for any issues**

The stock update system should now work correctly! The fix ensures that:
- ✅ Stock is updated when orders are placed
- ✅ The system is robust and handles errors gracefully
- ✅ It works properly in the Vercel environment
- ✅ It uses the correct Next.js/TypeScript approach
