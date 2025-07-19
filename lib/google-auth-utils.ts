import { google } from "googleapis"
import type { JWT } from "google-auth-library"
import { GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID } from "@/app/checkout/actions"

// Ensure GOOGLE_PRIVATE_KEY is always a string and correctly formatted
const privateKey = GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n") || ""

let jwtClient: JWT | null = null

export function getGoogleAuthClient(): JWT {
  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !privateKey) {
    throw new Error("Google Sheets credentials (email or private key) are not configured.")
  }

  if (!jwtClient) {
    jwtClient = new google.auth.JWT(
      GOOGLE_SERVICE_ACCOUNT_EMAIL,
      undefined, // keyFile
      privateKey,
      ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"],
    )
  }
  return jwtClient
}

export { GOOGLE_SHEET_ID } // Export GOOGLE_SHEET_ID from here for consistency
