import { NextResponse } from "next/server"

export async function GET() {
  const requiredEnvVars = [
    "GOOGLE_SHEET_ID",
    "GOOGLE_SERVICE_ACCOUNT_EMAIL",
    "GOOGLE_PRIVATE_KEY",
    "RESEND_API_KEY",
    "GOOGLE_DRIVE_FOLDER_ID",
  ]

  const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar])

  if (missingEnvVars.length > 0) {
    return NextResponse.json(
      {
        status: "error",
        message: "Missing environment variables",
        missing: missingEnvVars,
      },
      { status: 500 },
    )
  }

  return NextResponse.json({
    status: "success",
    message: "All required environment variables are set.",
  })
}
