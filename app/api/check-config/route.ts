import { NextResponse } from "next/server"

export async function GET() {
  const config = {
    GOOGLE_SHEET_ID: !!process.env.GOOGLE_SHEET_ID,
    GOOGLE_SERVICE_ACCOUNT_EMAIL: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    GOOGLE_PRIVATE_KEY: !!process.env.GOOGLE_PRIVATE_KEY,
    GOOGLE_DRIVE_FOLDER_ID: !!process.env.GOOGLE_DRIVE_FOLDER_ID,
    RESEND_API_KEY: !!process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.startsWith("re_"),
  }

  const missingConfigs = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key)

  if (missingConfigs.length > 0) {
    return NextResponse.json(
      {
        status: "error",
        message: "Missing or improperly configured environment variables.",
        missing: missingConfigs,
        details:
          "Please check your .env.local file and Vercel Environment Variables. Refer to the setup guide for more information.",
      },
      { status: 500 },
    )
  }

  return NextResponse.json({
    status: "success",
    message: "All required environment variables are configured.",
    config,
  })
}
