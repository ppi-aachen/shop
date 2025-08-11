"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useCart } from "@/lib/cart-context"
import { submitOrder } from "@/app/checkout/actions"
import { useToast } from "@/hooks/use-toast"
import { Package, MapPin, Truck } from "lucide-react"
import { getProductImage } from "@/lib/image-utils" // Import getProductImage

export default function CheckoutPage() {
  const { state, dispatch } = useCart()
  const router = useRouter()
  const { toast } = useToast()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (state.items.length === 0) {
      toast({
        title: "Cart Empty",
        description: "Your cart is empty. Please add items before checking out.",
        variant: "destructive",
      })
      router.push("/")
    }
  }, [state.items.length, router, toast])

  const handleDeliveryMethodChange = (method: "pickup" | "delivery") => {
    dispatch({ type: "SET_DELIVERY_METHOD", payload: method })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("email", email)
      formData.append("address", address)
      formData.append("cartItems", JSON.stringify(state.items))
      formData.append("totalAmount", state.finalTotal.toFixed(2))
      formData.append("deliveryMethod", state.deliveryMethod)
      formData.append("shippingCost", state.shippingCost.toFixed(2))
      formData.append("itemCount", state.itemCount.toString())

      const result = await submitOrder(formData)

      if (result.success) {
        // Redirection handled by server action
      } else {
        toast({
          title: "Order Failed",
          description: result.error || "There was an error processing your order.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting order:", error)
      toast({
        title: "Order Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalItemsPrice = useMemo(() => {
    return state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [state.items])

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Customer Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl">Customer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="address">Delivery Address</Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  placeholder="Street, City, Postal Code, Country"
                  required
                />
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-2xl">Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {state.items.map((item, index) => (
                <div
                  key={`${item.id}-${item.selectedSize}-${item.selectedColor}-${index}`}
                  className="flex items-center gap-4"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden shrink-0">
                    {item.image ? (
                      <img
                        src={getProductImage(item.image) || "/placeholder.svg"} // Use getProductImage
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = "none"
                          const parent = target.parentElement
                          if (parent) {
                            const iconDiv = document.createElement("div")
                            iconDiv.className = "flex items-center justify-center w-full h-full"
                            iconDiv.innerHTML =
                              '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="text-gray-400"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="M10 4v4"></path><path d="M2 8h20"></path><path d="M6 12h.01"></path><path d="M6 16h.01"></path><path d="M10 12h8"></path><path d="M10 16h8"></path></svg>'
                            parent.appendChild(iconDiv)
                          }
                        }}
                      />
                    ) : (
                      <Package className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-base">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      Qty: {item.quantity}
                      {item.selectedSize && `, Size: ${item.selectedSize}`}
                      {item.selectedColor && `, Color: ${item.selectedColor}`}
                    </p>
                  </div>
                  <p className="font-semibold text-base">€{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t space-y-2">
              <div className="flex justify-between text-base">
                <span>Subtotal ({state.itemCount} items)</span>
                <span>€{totalItemsPrice.toFixed(2)}</span>
              </div>

              <div className="mt-4">
                <Label className="text-base font-medium">Delivery Method</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="pickup"
                      name="delivery"
                      checked={state.deliveryMethod === "pickup"}
                      onChange={() => handleDeliveryMethodChange("pickup")}
                      className="text-green-600"
                    />
                    <label htmlFor="pickup" className="flex items-center gap-2 cursor-pointer">
                      <MapPin className="h-4 w-4" />
                      <span>Pickup in Aachen (Free)</span>
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="delivery"
                      name="delivery"
                      checked={state.deliveryMethod === "delivery"}
                      onChange={() => handleDeliveryMethodChange("delivery")}
                      className="text-green-600"
                    />
                    <label htmlFor="delivery" className="flex items-center gap-2 cursor-pointer">
                      <Truck className="h-4 w-4" />
                      <span>Delivery</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-between text-base">
                <span>{state.deliveryMethod === "pickup" ? "Pickup" : "Delivery"} Cost</span>
                <span>€{state.shippingCost.toFixed(2)}</span>
              </div>

              <div className="flex justify-between font-bold text-xl border-t pt-2">
                <span>Total</span>
                <span>€{state.finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleSubmit}
              className="w-full"
              size="lg"
              disabled={isSubmitting || state.items.length === 0 || !name || !email || !address}
            >
              {isSubmitting ? "Processing Order..." : "Proceed to Payment"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
