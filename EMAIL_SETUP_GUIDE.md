# Email System Setup Guide

## 🎉 Current Status: WORKING (with limitations)

Your email system is now working! Here's what you need to know:

### ✅ What's Working:
- API key is valid and functional
- Business notifications sent to `aachen.ppi@gmail.com`
- Order processing continues normally
- Stock updates work correctly

### ⚠️ Current Limitations:
- Can only send to verified email (`aachen.ppi@gmail.com`)
- Customer emails are not sent (domain not verified)
- Business emails go to `aachen.ppi@gmail.com` instead of `funding@ppiaachen.de`

---

## 🔧 Setup Instructions

### Step 1: Local Development Setup

Create a `.env.local` file in your `shop` directory:

```bash
RESEND_API_KEY=re_f7QZi8mN_KB4CfWt5VzK7QufgvWmMfVaW
```

### Step 2: Vercel Deployment Setup

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the following variable:
   - **Name:** `RESEND_API_KEY`
   - **Value:** `re_f7QZi8mN_KB4CfWt5VzK7QufgvWmMfVaW`
4. Redeploy your project

### Step 3: Test the System

After setting up the environment variable:

1. Restart your development server
2. Test the checkout process
3. Check your email (`aachen.ppi@gmail.com`) for order notifications

---

## 🚀 Permanent Solution: Domain Verification

To send emails to any address and use `orders@ppiaachen.de`:

### Option 1: Verify ppiaachen.de Domain

1. Go to [Resend Domains](https://resend.com/domains)
2. Click "Add Domain"
3. Enter: `ppiaachen.de`
4. Follow the DNS verification steps:
   - Add TXT record for domain verification
   - Add MX record for email routing
   - Add SPF record for authentication
5. Wait for verification (usually 24-48 hours)

### Option 2: Use a Different Domain

If you don't own `ppiaachen.de`, you can:
1. Use a domain you do own
2. Or continue using the current setup

---

## 📧 Email Configuration

### Current Setup:
- **From:** `onboarding@resend.dev`
- **Business To:** `aachen.ppi@gmail.com`
- **Customer To:** Not sent (domain limitation)

### After Domain Verification:
- **From:** `orders@ppiaachen.de`
- **Business To:** `funding@ppiaachen.de`
- **Customer To:** Customer's email address

---

## 🔍 Troubleshooting

### If emails stop working:

1. **Check environment variables:**
   ```bash
   node scripts/check-email-env.js
   ```

2. **Test API key:**
   ```bash
   node scripts/test-api-key.js
   ```

3. **Test with verified email:**
   ```bash
   node scripts/test-verified-email.js
   ```

### Common Issues:

- **403 Error:** Domain not verified
- **401 Error:** Invalid API key
- **No emails sent:** Missing environment variable

---

## 📋 Order Processing Flow

### Current Flow (Working):
1. ✅ Customer submits order
2. ✅ Order saved to Google Sheets
3. ✅ Stock updated correctly
4. ✅ Business notification sent to `aachen.ppi@gmail.com`
5. ❌ Customer confirmation email not sent
6. ✅ Order ID generated and displayed

### After Domain Verification:
1. ✅ Customer submits order
2. ✅ Order saved to Google Sheets
3. ✅ Stock updated correctly
4. ✅ Business notification sent to `funding@ppiaachen.de`
5. ✅ Customer confirmation email sent
6. ✅ Order ID generated and displayed

---

## 🎯 Next Steps

1. **Immediate:** Set up environment variables and test
2. **Short-term:** Verify domain in Resend dashboard
3. **Long-term:** Update email configuration to use verified domain

---

## 📞 Support

If you need help:
- Check the troubleshooting scripts above
- Review Resend documentation: https://resend.com/docs
- Contact support if domain verification issues persist 