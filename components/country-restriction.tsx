"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Ban } from "lucide-react"

export function CountryRestriction({ allowedCountries = ["DE", "ID"] }: { allowedCountries?: string[] }) {
  const [userCountry, setUserCountry] = useState<string | null>(null)
  const [isRestricted, setIsRestricted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCountry() {
      try {
        const response = await fetch("https://ipapi.co/json/")
        const data = await response.json()
        const countryCode = data.country_code
        setUserCountry(countryCode)
        if (allowedCountries.length > 0 && !allowedCountries.includes(countryCode)) {
          setIsRestricted(true)
        }
      } catch (error) {
        console.error("Error fetching country:", error)
        // If fetching fails, assume no restriction or handle as needed
      } finally {
        setLoading(false)
      }
    }

    fetchCountry()
  }, [allowedCountries])

  if (loading) {
    return null // Or a loading spinner
  }

  if (isRestricted) {
    return (
      <Alert variant="destructive" className="mb-4">
        <Ban className="h-4 w-4" />
        <AlertTitle>Access Restricted</AlertTitle>
        <AlertDescription>
          Unfortunately, we currently only ship to {allowedCountries.join(", ")}. We apologize for any inconvenience.
        </AlertDescription>
      </Alert>
    )
  }

  return null
}
