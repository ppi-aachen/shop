"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal, CheckCircle, XCircle } from "lucide-react"

export function DatabaseStatus() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("Checking database connection...")

  useEffect(() => {
    async function checkStatus() {
      try {
        const response = await fetch("/api/check-config")
        const data = await response.json()
        if (response.ok) {
          setStatus("success")
          setMessage(data.message)
        } else {
          setStatus("error")
          setMessage(data.message || "Failed to connect to database or email service.")
        }
      } catch (err) {
        setStatus("error")
        setMessage("Failed to connect to backend. Please check your network connection.")
      }
    }
    checkStatus()
  }, [])

  return (
    <Alert className="mb-4">
      {status === "loading" && <Terminal className="h-4 w-4" />}
      {status === "success" && <CheckCircle className="h-4 w-4 text-green-500" />}
      {status === "error" && <XCircle className="h-4 w-4 text-red-500" />}
      <AlertTitle>Configuration Status</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
