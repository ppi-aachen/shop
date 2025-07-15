const { Resend } = require("resend")
const readline = require("readline")

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

async function setupResend() {
  console.log(`
========================================
  Resend API Key Setup Guide
========================================
This script will help you verify your Resend API Key.

Before running this script, ensure you have:
1. Signed up for a Resend account at https://resend.com/
2. Created an API Key in your Resend dashboard.

You need to have the following environment variable set in your .env.local file:
- RESEND_API_KEY
`)

  const RESEND_API_KEY = process.env.RESEND_API_KEY

  if (!RESEND_API_KEY || !RESEND_API_KEY.startsWith("re_")) {
    console.error("❌ Error: RESEND_API_KEY is missing or invalid.")
    console.error("Please ensure RESEND_API_KEY is set in your .env.local file and starts with 're_'.")
    rl.close()
    return
  }

  const resend = new Resend(RESEND_API_KEY)

  try {
    console.log("\nAttempting to list domains to verify API key...")
    const { data, error } = await resend.domains.list()

    if (error) {
      console.error("❌ Error verifying Resend API Key:", error.message)
      console.error("Please check if your RESEND_API_KEY is correct and has the necessary permissions.")
      console.error("You might also need to verify your sending domain in Resend.")
    } else {
      console.log("🎉 Resend API Key verified successfully!")
      console.log("Currently configured domains in Resend:")
      if (data && data.data.length > 0) {
        data.data.forEach((domain) => {
          console.log(`- ${domain.id}: ${domain.name} (Status: ${domain.status})`)
        })
        console.log(
          "\nEnsure your sending domain (e.g., shop.ppiaachen.de) is listed above and its status is 'verified'.",
        )
        console.log("If not, add and verify your domain in the Resend dashboard: https://resend.com/domains")
      } else {
        console.log("No domains configured yet. Please add and verify your sending domain in the Resend dashboard.")
      }
    }
  } catch (e) {
    console.error("❌ An unexpected error occurred during Resend setup:", e)
  } finally {
    rl.close()
  }
}

setupResend()
