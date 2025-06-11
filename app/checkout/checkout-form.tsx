"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, FileText, ImageIcon, AlertTriangle } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { CountryRestriction } from "@/components/country-restriction"
import { submitOrder } from "./actions"
import { LoadingPopup } from "@/app/success/loading"

export default function CheckoutForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [country, setCountry] = useState("")
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const { state, dispatch } = useCart()
  const router = useRouter()

  // Validate cart items for required options
  const validateCartItems = (): string[] => {
    const errors: string[] = []

    state.items.forEach((item, index) => {
      // Check if item has size options but no size selected
      if (item.sizes && item.sizes.length > 0 && !item.selectedSize) {
        errors.push(`Item ${index + 1} (${item.name}): Size is required`)
      }

      // Check if item has color options but no color selected
      if (item.colors && item.colors.length > 0 && !item.selectedColor) {
        errors.push(`Item ${index + 1} (${item.name}): Color is required`)
      }
    })

    return errors
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
      if (allowedTypes.includes(file.type)) {
        setSelectedFile(file)
      } else {
        alert("Please upload a PDF or image file (JPG, PNG)")
        e.target.value = ""
      }
    }
  }

  const handleContactInstagram = () => {
    window.open("https://instagram.com/aachen.studio", "_blank")
  }

  const handleSubmit = async (formData: FormData) => {
    // Set submitting state to true immediately to show the loading popup
    setIsSubmitting(true)

    // Validate cart items first
    const cartErrors = validateCartItems()
    if (cartErrors.length > 0) {
      setValidationErrors(cartErrors)
      alert("Please select required options for all items:\n\n" + cartErrors.join("\n"))
      setIsSubmitting(false) // Turn off loading if validation fails
      return
    }

    if (!selectedFile) {
      alert("Please upload proof of payment")
      setIsSubmitting(false) // Turn off loading if validation fails
      return
    }

    // Check if delivery is to Germany
    const selectedCountry = formData.get("country") as string
    if (
      state.deliveryMethod === "delivery" &&
      selectedCountry.toLowerCase() !== "germany" &&
      selectedCountry.toLowerCase() !== "deutschland"
    ) {
      alert("We currently only deliver within Germany. Please contact us on Instagram for international orders.")
      setIsSubmitting(false) // Turn off loading if validation fails
      return
    }

    setValidationErrors([])

    try {
      formData.append("cartItems", JSON.stringify(state.items))
      formData.append("deliveryMethod", state.deliveryMethod)
      formData.append("subtotal", state.total.toString())
      formData.append("shippingCost", state.shippingCost.toString())
      formData.append("totalAmount", state.finalTotal.toString())
      formData.append("itemCount", state.itemCount.toString())
      formData.append("proofOfPayment", selectedFile)

      const result = await submitOrder(formData)

      if (result.success) {
        dispatch({ type: "CLEAR_CART" })
        router.push(`/success?orderId=${result.orderId}`)
      } else {
        const errorMessage = result.error || "Unknown error occurred"
        if (errorMessage.includes("Email") || errorMessage.includes("API key")) {
          alert(
            "Order submitted successfully, but email notifications may not have been sent. You will be contacted directly.",
          )
          dispatch({ type: "CLEAR_CART" })
          router.push(`/success?orderId=${result.orderId}`)
        } else {
          alert(`Error submitting order: ${errorMessage}. Please try again.`)
        }
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error submitting order. Please try again or contact support.")
    } finally {
      // This will run regardless of success or error, but the redirect will happen first on success.
      // In case of an error alert, the loading screen will be hidden.
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Details & Proof of Payment</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Cart Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h4 className="font-medium text-red-800">Required Options Missing</h4>
            </div>
            <ul className="text-sm text-red-700 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
            <p className="text-sm text-red-600 mt-2">
              Please go back to your cart and select the required options for all items.
            </p>
          </div>
        )}

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Customer Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input id="firstName" name="firstName" required />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input id="lastName" name="lastName" required />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input id="email" name="email" type="email" required />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input id="phone" name="phone" type="tel" required />
            </div>
          </div>

          {state.deliveryMethod === "delivery" && (
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Delivery Address</h3>

              <div>
                <Label htmlFor="address">Street Address *</Label>
                <Input id="address" name="address" required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" name="city" required />
                </div>
                <div>
                  <Label htmlFor="state">State/Province *</Label>
                  <Input id="state" name="state" required />
                </div>
                <div>
                  <Label htmlFor="zipCode">ZIP/Postal Code *</Label>
                  <Input id="zipCode" name="zipCode" required />
                </div>
              </div>

              <div>
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  name="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Germany"
                  required
                />
              </div>

              <CountryRestriction selectedCountry={country} onContactInstagram={handleContactInstagram} />
            </div>
          )}

          {state.deliveryMethod === "pickup" && (
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">Pickup in Aachen</h3>
              <p className="text-green-800 text-sm">
                We will contact you within 24 hours to arrange the pickup location and time in Aachen.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-medium text-lg">Proof of Payment</h3>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                id="proofOfPayment"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="proofOfPayment" className="cursor-pointer">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">Upload Proof of Payment</p>
                <p className="text-sm text-gray-600 mb-4">PDF, JPG, PNG files up to 10MB</p>
              </label>

              {selectedFile && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg flex items-center justify-center gap-2">
                  {selectedFile.type === "application/pdf" ? (
                    <FileText className="h-5 w-5 text-green-600" />
                  ) : (
                    <ImageIcon className="h-5 w-5 text-green-600" />
                  )}
                  <span className="text-green-800 font-medium">{selectedFile.name}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea id="notes" name="notes" placeholder="Any special delivery instructions or comments..." rows={3} />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !selectedFile || validationErrors.length > 0}
          >
            {isSubmitting ? "Submitting Order..." : `Submit Order - €${state.finalTotal.toFixed(2)}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
  return (
    <> {/* Use a Fragment to wrap the Card and the Popup */}
      <LoadingPopup isSubmitting={isSubmitting} /> {/* 2. Add the popup component here */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Details & Proof of Payment</CardTitle>
        </CardHeader>
        <CardContent>
          {/* ... (all your existing form JSX) ... */}
        </CardContent>
      </Card>
    </>
  )
}
