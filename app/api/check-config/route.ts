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
  if (!configStatus.GOOGLE_SHEET_ID) missingConfigs.push("GOOGLE_SHEET_ID")
  if (!configStatus.GOOGLE_SERVICE_ACCOUNT_EMAIL) missingConfigs.push("GOOGLE_SERVICE_ACCOUNT_EMAIL")
  if (!configStatus.GOOGLE_PRIVATE_KEY) missingConfigs.push("GOOGLE_PRIVATE_KEY")
  if (!configStatus.RESEND_API_KEY) missingConfigs.push("RESEND_API_KEY")
  if (!configStatus.GOOGLE_DRIVE_FOLDER_ID) missingConfigs.push("GOOGLE_DRIVE_FOLDER_ID")

  if (missingConfigs.length > 0) {
    return NextResponse.json(
      {
        status: "error",
        message: "Missing required environment variables.",
        missing: missingConfigs,
        details: configStatus,
      },
      { status: 500 },
    )
  }

  return NextResponse.json(
    {
      status: "success",
      message: "All required environment variables are configured.",
      details: configStatus,
    },
    { status: 200 },
  )
}
