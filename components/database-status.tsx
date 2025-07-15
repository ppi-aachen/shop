"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal, CheckCircle, XCircle } from "lucide-react"

export function DatabaseStatus() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("Checking database and email configuration...")
  const [missingVars, setMissingVars] = useState<string[]>([])

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
          setMissingVars(data.missing || [])
        }
      } catch (err) {
        setStatus("error")
        setMessage("Failed to connect to the configuration check API.")
        console.error(err)
      }
    }
    checkConfig()
  }, [])

  if (status === "loading") {
    return (
      <Alert className="bg-blue-50 border-blue-200 text-blue-800">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Configuration Check</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    )
  }

  if (status === "success") {
    return (
      <Alert className="bg-green-50 border-green-200 text-green-800">
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>Configuration OK</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert variant="destructive">
      <XCircle className="h-4 w-4" />
      <AlertTitle>Configuration Error</AlertTitle>
      <AlertDescription>
        {message}
        {missingVars.length > 0 && (
          <div className="mt-2">
            <p className="font-medium">Missing/Incorrect Environment Variables:</p>
            <ul className="list-disc list-inside">
              {missingVars.map((v) => (
                <li key={v}>{v}</li>
              ))}
            </ul>
            <p className="mt-2">
              Please check your Vercel project's environment variables and ensure they are correctly set.
            </p>
          </div>
        )}
      </AlertDescription>
    </Alert>
  )
}
