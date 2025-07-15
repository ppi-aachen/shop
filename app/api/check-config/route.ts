import { NextResponse } from "next/server"

export async function GET() {
  const configStatus = {
    GOOGLE_SHEET_ID: !!process.env.GOOGLE_SHEET_ID,
    GOOGLE_SERVICE_ACCOUNT_EMAIL: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    GOOGLE_PRIVATE_KEY: !!process.env.GOOGLE_PRIVATE_KEY,
    RESEND_API_KEY: !!process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.startsWith("re_"),
    GOOGLE_DRIVE_FOLDER_ID: !!process.env.GOOGLE_DRIVE_FOLDER_ID,
  }

  const missingConfigs: string[] = []
  for (const [key, value] of Object.entries(configStatus)) {
    if (!value) {
      missingConfigs.push(key)
    }
  }

  if (missingConfigs.length > 0) {
    return NextResponse.json(
      {
        message: "Missing or improperly configured environment variables.",
        missing: missingConfigs,
        status: "error",
      },
      { status: 500 },
    )
  }

  return NextResponse.json(
    {
      message: "All required environment variables are configured.",
      status: "success",
    },
    { status: 200 },
  )
}
