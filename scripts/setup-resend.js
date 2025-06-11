// Resend Email Service Setup Instructions

console.log("Resend Email Service Setup Instructions:")
console.log("=======================================")
console.log("")

console.log("1. Create a Resend Account:")
console.log("   - Go to https://resend.com")
console.log("   - Sign up for a free account")
console.log("   - Free tier includes 3,000 emails/month")
console.log("")

console.log("2. Get your API Key:")
console.log("   - Go to https://resend.com/api-keys")
console.log("   - Click 'Create API Key'")
console.log("   - Name it 'Aachen Studio Shop'")
console.log("   - Copy the API key (starts with 're_')")
console.log("")

console.log("3. Add Domain (Optional but Recommended):")
console.log("   - Go to https://resend.com/domains")
console.log("   - Add your domain (e.g., ppiaachen.de)")
console.log("   - Follow DNS setup instructions")
console.log("   - This allows sending from orders@ppiaachen.de")
console.log("")

console.log("4. Environment Variables to Add:")
console.log("   RESEND_API_KEY=re_your_api_key_here")
console.log("")

console.log("5. Email Configuration:")
console.log("   - Customer emails sent from: orders@ppiaachen.de")
console.log("   - Business notifications sent to: funding@ppiaachen.de")
console.log("   - If domain not verified, emails will be sent from onboarding@resend.dev")
console.log("")

console.log("6. Email Features Included:")
console.log("   ✅ Professional HTML email templates")
console.log("   ✅ Order confirmation emails to customers")
console.log("   ✅ Business notification emails")
console.log("   ✅ Responsive design for mobile/desktop")
console.log("   ✅ Order details with product options")
console.log("   ✅ Payment information and proof links")
console.log("   ✅ Delivery/pickup instructions")
console.log("   ✅ Quick action buttons for business emails")
console.log("")

console.log("7. Testing:")
console.log("   - Place a test order to verify emails work")
console.log("   - Check spam folders initially")
console.log("   - Monitor Resend dashboard for delivery status")
console.log("")

console.log("8. Production Considerations:")
console.log("   - Set up domain authentication for better deliverability")
console.log("   - Monitor email analytics in Resend dashboard")
console.log("   - Consider upgrading plan if you exceed 3,000 emails/month")
console.log("")

console.log("Package Installation:")
console.log("npm install resend")
console.log("")

console.log("The email service is now integrated and ready to use!")
