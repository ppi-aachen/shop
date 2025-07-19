import { NextResponse } from "next/server"

export async function GET() {
  const requiredEnvVars = [
    "GOOGLE_SHEET_ID",
    "GOOGLE_SERVICE_ACCOUNT_EMAIL",
    "GOOGLE_PRIVATE_KEY",
    "RESEND_API_KEY",
    "GOOGLE_DRIVE_FOLDER_ID",
  ]

  const missingVars: string[] = []
  const configuredVars: string[] = []

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar)
    } else {
      configuredVars.push(envVar)
    }
  }

  if (missingVars.length > 0) {
    return NextResponse.json(
      {
        status: "error",
        message: "Missing required environment variables.",
        missing: missingVars,
        configured: configuredVars,
      },
      { status: 500 },
    )
  }

  return NextResponse.json(
    {
      status: "success",
      message: "All required environment variables are configured.",
      configured: configuredVars,
    },
    { status: 200 },
  )
}
