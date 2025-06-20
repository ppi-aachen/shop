// Google Drive Integration Troubleshooting Guide

console.log("🔧 GOOGLE DRIVE TROUBLESHOOTING")
console.log("=".repeat(35))
console.log("")

console.log("❌ COMMON ERRORS AND SOLUTIONS:")
console.log("")

console.log("1. 'Google Drive API has not been used'")
console.log("   SOLUTION:")
console.log("   a) Go to https://console.cloud.google.com")
console.log("   b) Select your project")
console.log("   c) APIs & Services → Library")
console.log("   d) Search 'Google Drive API'")
console.log("   e) Click 'Enable'")
console.log("")

console.log("2. 'Insufficient permissions'")
console.log("   SOLUTION:")
console.log("   a) Your service account needs Drive access")
console.log("   b) The same account used for Sheets should work")
console.log("   c) Verify GOOGLE_SERVICE_ACCOUNT_EMAIL is correct")
console.log("")

console.log("3. 'Upload failed' or 'Auth error'")
console.log("   SOLUTION:")
console.log("   a) Check GOOGLE_PRIVATE_KEY format")
console.log("   b) Ensure \\n line breaks are preserved")
console.log("   c) Verify service account JSON is valid")
console.log("")

console.log("4. 'Folder creation failed'")
console.log("   SOLUTION:")
console.log("   a) Service account needs Drive file creation permission")
console.log("   b) Check if folder already exists manually")
console.log("   c) Try creating folder manually first")
console.log("")

console.log("🔍 DEBUGGING STEPS:")
console.log("=".repeat(18))
console.log("1. Check browser console for detailed error messages")
console.log("2. Verify Google Drive API is enabled")
console.log("3. Test with a small image file first")
console.log("4. Check Google Drive for folder creation")
console.log("5. Verify service account permissions")
console.log("")

console.log("📂 MANUAL FOLDER SETUP (if needed):")
console.log("=".repeat(35))
console.log("1. Go to https://drive.google.com")
console.log("2. Create folder: 'Aachen Studio - Proof of Payments'")
console.log("3. Share folder with your service account email")
console.log("4. Give 'Editor' permissions")
console.log("")

console.log("✅ VERIFICATION CHECKLIST:")
console.log("=".repeat(25))
console.log("□ Google Drive API enabled in Cloud Console")
console.log("□ Same service account as Google Sheets")
console.log("□ GOOGLE_PRIVATE_KEY has proper \\n formatting")
console.log("□ Service account email is correct")
console.log("□ Test order completes successfully")
console.log("□ File appears in Google Drive folder")
console.log("□ Link works in Google Sheets")
console.log("")

console.log("🆘 FALLBACK OPTION:")
console.log("=".repeat(17))
console.log("If Google Drive upload fails:")
console.log("• Order will still be saved to Google Sheets")
console.log("• Email notifications will still work")
console.log("• Proof of payment URL will show error message")
console.log("• You can manually handle the payment proof")
console.log("")

console.log("📞 SUPPORT:")
console.log("=".repeat(10))
console.log("If issues persist:")
console.log("1. Check Google Cloud Console logs")
console.log("2. Verify all APIs are enabled")
console.log("3. Test service account permissions")
console.log("4. Contact support with specific error messages")
