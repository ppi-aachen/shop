"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export function DatabaseStatus() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState<string>("")
  const [missingConfigs, setMissingConfigs] = useState<string[]>([])

  useEffect(() => {
    async function checkConfig() {
      try {
        const response = await fetch("/api/check-config")
        const data = await response.json()
        if (data.status === "success") {
          setStatus("success")
          setMessage(data.message)
        } else {
          setStatus("error")
          setMessage(data.message)
          setMissingConfigs(data.missing || [])
        }
      } catch (error) {
        setStatus("error")
        setMessage("Failed to connect to the API. Check server logs.")
        console.error("Failed to fetch config status:", error)
      }
    }
    checkConfig()
  }, [])

  if (status === "loading") {
    return (
      <Alert className="fixed bottom-4 right-4 w-auto max-w-sm bg-blue-50 text-blue-800">
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertTitle>Checking Configuration...</AlertTitle>
        <AlertDescription>Verifying environment variables for Google Sheets, Drive, and Resend.</AlertDescription>
      </Alert>
    )
  }

  if (status === "success") {
    return (
      <Alert className="fixed bottom-4 right-4 w-auto max-w-sm bg-green-50 text-green-800">
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>Configuration OK!</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    )
  }

  if (status === "error") {
    return (
      <Alert variant="destructive" className="fixed bottom-4 right-4 w-auto max-w-sm">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Configuration Error!</AlertTitle>
        <AlertDescription>
          {message}
          {missingConfigs.length > 0 && (
            <ul className="mt-2 list-disc pl-5">
              {missingConfigs.map((config) => (
                <li key={config}>{config}</li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-sm">
            Please refer to the `scripts/environment-setup-guide.js` for setup instructions.
          </p>
        </AlertDescription>
      </Alert>
    )
  }

  return null
}
