import { google } from "googleapis"

export function getGoogleAuthClient() {
  const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n")

  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    throw new Error("Google service account credentials are not configured.")
  }

  const auth = new google.auth.JWT(GOOGLE_SERVICE_ACCOUNT_EMAIL, null, GOOGLE_PRIVATE_KEY, [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
  ])

  return auth
}
