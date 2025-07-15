"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Instagram } from "lucide-react"

interface CountryRestrictionProps {
  selectedCountry: string
  onContactInstagram: () => void
}

export function CountryRestriction({ selectedCountry, onContactInstagram }: CountryRestrictionProps) {
  const isGermany = selectedCountry.toLowerCase() === "germany" || selectedCountry.toLowerCase() === "deutschland"

  if (isGermany || selectedCountry === "") {
    return null
  }

  return (
    <Alert variant="destructive">
      <AlertTitle className="flex items-center gap-2">
        <Instagram className="h-5 w-5" />
        International Delivery
      </AlertTitle>
      <AlertDescription className="mt-2">
        We currently only deliver within Germany. For international orders, please contact us directly on Instagram to
        arrange shipping.
        <Button onClick={onContactInstagram} className="mt-4 w-full bg-transparent" variant="outline">
          <Instagram className="h-4 w-4 mr-2" />
          Contact us on Instagram
        </Button>
      </AlertDescription>
    </Alert>
  )
}
