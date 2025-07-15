console.log(`
========================================
  Resend Email Troubleshooting
========================================

If you are not receiving emails from your shop, please follow these steps:

1.  **Verify RESEND_API_KEY:**
    -   Your current RESEND_API_KEY (first 5 chars): ${process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.substring(0, 5) + "..." : "NOT_SET"}
    -   Ensure this key is valid and active in your Resend dashboard: https://resend.com/api-keys
    -   It should start with 're_'.

2.  **Check Domain Verification in Resend:**
    -   Log in to your Resend account.
    -   Go to the "Domains" section.
    -   Ensure the domain you are sending emails from (e.g., "shop.ppiaachen.de" or "ppiaachen.de" if you're using a subdomain) is added and **VERIFIED**.
    -   You will need to add DNS records (TXT, CNAME) provided by Resend to your domain's DNS settings. This is a common reason for emails not being sent.

3.  **Check Sender Email Address:**
    -   In \`app/checkout/actions.ts\`, the sender email is set:
        -   Customer email: \`from: "No Reply Aachen Studio <no-reply@shop.ppiaachen.de>"\`
        -   Business email: \`from: "Webshop Aachen Studio <orders@shop.ppiaachen.de>"\`
    -   **Ensure these sender email addresses (e.g., no-reply@shop.ppiaachen.de, orders@shop.ppiaachen.de) are either:**
        -   Verified as individual email addresses in Resend (under "Senders").
        -   Part of a verified domain in Resend.
    -   If you're using a custom domain, make sure the 'from' address matches a verified sender or domain.

4.  **Check Recipient Email Addresses:**
    -   Ensure the recipient email addresses (e.g., the customer's email, and "fundraising@ppiaachen.de" for business notifications) are valid and not causing bounces.
    -   Check spam folders for the recipient emails.

5.  **Review Resend Logs:**
    -   In your Resend dashboard, go to the "Emails" section.
    -   Check the logs for any failed email attempts. Resend provides detailed error messages that can help pinpoint the exact issue (e.g., "unverified domain", "invalid recipient").

6.  **Update Environment Variables in Vercel:**
    -   Go to your Vercel project settings.
    -   Navigate to "Environment Variables".
    -   Double-check that \`RESEND_API_KEY\` is correctly set.
    -   If you made any changes, save them.

7.  **Redeploy Your Project:**
    -   After verifying and updating environment variables, redeploy your Vercel project.

If emails are still not sending, consider using Resend's debugging tools or contacting their support for more specific assistance.
`)
