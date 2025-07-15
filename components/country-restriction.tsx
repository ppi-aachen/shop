"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CountryRestrictionProps {
  selectedCountry: string
  onContactInstagram: () => void
}

export function CountryRestriction({ selectedCountry, onContactInstagram }: CountryRestrictionProps) {
  const isGermany = selectedCountry.toLowerCase() === "germany" || selectedCountry.toLowerCase() === "deutschland"

  if (selectedCountry && !isGermany) {
    return (
      <Alert variant="destructive">
        <Info className="h-4 w-4" />
        <AlertTitle>Delivery Restriction</AlertTitle>
        <AlertDescription>
          We currently only deliver within Germany. For international orders, please contact us directly.
          <Button variant="link" className="p-0 h-auto ml-1 text-red-700" onClick={onContactInstagram}>
            Contact us on Instagram
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return null
}
