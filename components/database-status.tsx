"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, Database, ExternalLink } from "lucide-react"

export function DatabaseStatus() {
  const [status, setStatus] = useState<{
    googleSheets: boolean
    email: boolean
    loading: boolean
  }>({
    googleSheets: false,
    email: false,
    loading: true,
  })

  useEffect(() => {
    // Check if environment variables are configured
    const checkConfig = async () => {
      try {
        const response = await fetch("/api/check-config")
        const data = await response.json()
        setStatus({
          googleSheets: data.googleSheets,
          email: data.email,
          loading: false,
        })
      } catch (error) {
        console.error("Error checking configuration:", error)
        setStatus({
          googleSheets: false,
          email: false,
          loading: false,
        })
      }
    }

    checkConfig()
  }, [])

  if (status.loading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 animate-spin" />
            <span>Checking database connection...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!status.googleSheets) {
    return (
      <Card className="mb-6 border-red-200 bg-red-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertCircle className="h-5 w-5" />
            Database Not Connected
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-red-700 text-sm">
            Google Sheets database is not configured. Orders cannot be saved until this is set up.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" asChild>
              <a
                href="https://console.cloud.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                Google Cloud Console
              </a>
            </Button>
            <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
              Refresh Status
            </Button>
          </div>
          <details className="text-xs text-red-600">
            <summary className="cursor-pointer font-medium">Quick Setup Guide</summary>
            <ol className="mt-2 space-y-1 list-decimal list-inside">
              <li>Go to Google Cloud Console</li>
              <li>Create/select project</li>
              <li>Enable Google Sheets API</li>
              <li>Create Service Account</li>
              <li>Download JSON key</li>
              <li>Set environment variables</li>
              <li>Create Google Sheet</li>
            </ol>
          </details>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-6 border-green-200 bg-green-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-green-800">
          <CheckCircle className="h-4 w-4" />
          <span className="font-medium">Database Connected</span>
          {!status.email && <span className="text-xs text-yellow-600 ml-2">(Email notifications disabled)</span>}
        </div>
      </CardContent>
    </Card>
  )
}
