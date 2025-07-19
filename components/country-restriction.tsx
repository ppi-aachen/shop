"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function CountryRestriction({ allowedCountry = "DE" }: { allowedCountry?: string }) {
  const [userCountry, setUserCountry] = useState<string | null>(null)
  const [isRestricted, setIsRestricted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchCountry() {
      try {
        const response = await fetch("https://ipapi.co/json/")
        const data = await response.json()
        setUserCountry(data.country_code)
        if (data.country_code !== allowedCountry) {
          setIsRestricted(true)
        }
      } catch (error) {
        console.error("Error fetching country:", error)
        // If API fails, assume no restriction or handle as needed
        setIsRestricted(false)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCountry()
  }, [allowedCountry])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading country information...</p>
      </div>
    )
  }

  if (isRestricted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-red-600">Access Denied</CardTitle>
            <CardDescription>Unfortunately, our shop is currently only available in {allowedCountry}.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              We apologize for the inconvenience. We are working to expand our services to more regions.
            </p>
            {userCountry && (
              <p className="text-sm text-gray-500">
                Your detected country: <span className="font-semibold">{userCountry}</span>
              </p>
            )}
            <Button onClick={() => (window.location.href = "https://www.google.com")} className="w-full">
              Go to Google
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null // Render nothing if not restricted
}
