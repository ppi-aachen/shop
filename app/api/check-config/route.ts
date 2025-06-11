import { NextResponse } from "next/server"

export async function GET() {
  const googleSheets = !!(
    process.env.GOOGLE_SHEET_ID &&
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_PRIVATE_KEY
  )

  const email = !!(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.startsWith("re_"))

  return NextResponse.json({
    googleSheets,
    email,
  })
}
