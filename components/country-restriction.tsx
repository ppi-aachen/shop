"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Instagram, AlertTriangle } from "lucide-react"

interface CountryRestrictionProps {
  selectedCountry: string
  onContactInstagram: () => void
}

export function CountryRestriction({ selectedCountry, onContactInstagram }: CountryRestrictionProps) {
  if (selectedCountry.toLowerCase() === "germany" || selectedCountry.toLowerCase() === "deutschland") {
    return null
  }

  return (
    <Card className="border-orange-200 bg-orange-50 mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertTriangle className="h-5 w-5" />
          Delivery Not Available
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-orange-600 mt-0.5" />
          <div>
            <p className="text-orange-800 font-medium">We currently only deliver within Germany</p>
            <p className="text-orange-700 text-sm mt-1">
              For international orders, please contact us on Instagram for special arrangements.
            </p>
          </div>
        </div>

        <Button
          onClick={onContactInstagram}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
        >
          <Instagram className="h-4 w-4 mr-2" />
          Contact @aachen.studio on Instagram
        </Button>
      </CardContent>
    </Card>
  )
}
