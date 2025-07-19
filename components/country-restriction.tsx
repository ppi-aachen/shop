"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GlobeIcon } from "lucide-react"

export function CountryRestriction() {
  const [country, setCountry] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCountry() {
      try {
        const response = await fetch("https://ipapi.co/json/")
        const data = await response.json()
        setCountry(data.country_name)
      } catch (error) {
        console.error("Error fetching country:", error)
        setCountry(null) // Fallback if IP API fails
      } finally {
        setLoading(false)
      }
    }
    fetchCountry()
  }, [])

  if (loading) {
    return null // Or a loading spinner
  }

  if (country && country !== "Germany") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <Card className="w-full max-w-md p-6 text-center shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold text-red-600">
              <GlobeIcon className="h-8 w-8" />
              Access Restricted
            </CardTitle>
          </CardHeader>
          <CardContent className="mt-4">
            <p className="text-lg text-gray-700">
              We apologize, but our shop is currently only accessible from Germany.
            </p>
            <p className="mt-2 text-sm text-gray-500">Thank you for your understanding.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
