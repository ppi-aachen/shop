"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircleIcon, XCircleIcon, Loader2Icon } from "lucide-react"

export function DatabaseStatus() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("Checking database connection...")

  useEffect(() => {
    async function checkConfig() {
      try {
        const response = await fetch("/api/check-config")
        const data = await response.json()
        if (response.ok) {
          setStatus("success")
          setMessage(data.message)
        } else {
          setStatus("error")
          setMessage(data.message || "Failed to connect to database.")
          if (data.missing && data.missing.length > 0) {
            setMessage(
              `Missing environment variables: ${data.missing.join(", ")}. Please check your .env file or Vercel project settings.`,
            )
          }
        }
      } catch (error) {
        setStatus("error")
        setMessage("Network error or API not reachable.")
        console.error("Failed to fetch config status:", error)
      }
    }

    checkConfig()
  }, [])

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader className="text-center">
        {status === "loading" && <Loader2Icon className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />}
        {status === "success" && <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />}
        {status === "error" && <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />}
        <CardTitle className="text-xl">Database Status</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        {status === "error" && (
          <p className="text-sm text-gray-500 mt-2">
            Please ensure your Google Sheet ID, Service Account Email, Private Key, Resend API Key, and Google Drive
            Folder ID are correctly configured as environment variables.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
