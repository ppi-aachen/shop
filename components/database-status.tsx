"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Database, CheckCircle, XCircle } from "lucide-react"

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
        }
      } catch (error) {
        setStatus("error")
        setMessage("Failed to connect to backend. Please check your deployment logs.")
        console.error("Error checking config:", error)
      }
    }

    checkConfig()
  }, [])

  if (status === "loading") {
    return (
      <Alert className="mb-4">
        <Database className="h-4 w-4" />
        <AlertTitle>Database Status</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    )
  }

  if (status === "success") {
    return (
      <Alert className="mb-4 border-green-500 text-green-700">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <AlertTitle>Database Connected</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    )
  }

  if (status === "error") {
    return (
      <Alert variant="destructive" className="mb-4">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Database Error</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    )
  }

  return null
}
