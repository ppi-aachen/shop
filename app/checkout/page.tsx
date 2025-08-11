"use client"

import type React from "react"

import { useMemo, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCart } from "@/lib/cart-context"
import { getProductImage } from "@/lib/utils"
import { submitOrderWithProofOfPayment } from "@/app/checkout/actions"
import { useToast } from "@/hooks/use-toast"
import { LoadingOverlay } from "@/components/loading-overlay"

export default function CheckoutPage() {
  const { cart, clearCart } = useCart()
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [proofOfPayment, setProofOfPayment] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [cart])

  const shippingCost = 5.0 // Example fixed shipping cost
  const taxRate = 0.08 // Example tax rate (8%)

  const taxAmount = useMemo(() => {
    return subtotal * taxRate
  }, [subtotal, taxRate])

  const total = useMemo(() => {
    return subtotal + shippingCost + taxAmount
  }, [subtotal, shippingCost, taxAmount])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setProofOfPayment(event.target.files[0])
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (cart.length === 0) {
      toast({
        title: "Error",
        description: "Your cart is empty.",
        variant: "destructive",
      })
      return
    }
    if (!proofOfPayment) {
      toast({
        title: "Error",
        description: "Please upload proof of payment.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("customerName", customerName)
      formData.append("customerEmail", customerEmail)
      formData.append("customerPhone", customerPhone)
      formData.append("deliveryAddress", deliveryAddress)
      formData.append("proofOfPayment", proofOfPayment)
      formData.append("cartItems", JSON.stringify(cart))
      formData.append("totalAmount", total.toFixed(2))

      const result = await submitOrderWithProofOfPayment(formData)

      if (result.success) {
        toast({
          title: "Order Submitted",
          description: "Your order has been successfully placed and proof of payment uploaded.",
        })
        clearCart()
        setCustomerName("")
        setCustomerEmail("")
        setCustomerPhone("")
        setDeliveryAddress("")
        setProofOfPayment(null)
      } else {
        toast({
          title: "Submission Failed",
          description: result.error || "There was an error submitting your order.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting order:", error)
      toast({
        title: "Submission Failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex flex-col lg:flex-row gap-4">
      {isSubmitting && <LoadingOverlay />}

      {/* Order Summary */}
      <Card className="flex-1 p-4">
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {cart.length === 0 ? (
            <p className="text-gray-500">Your cart is empty.</p>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.variantId} className="flex items-center gap-4 border-b pb-2">
                  <Image
                    src={getProductImage(item.productId) || "/placeholder.svg"} // Use getProductImage for dynamic image
                    alt={item.productName}
                    width={80}
                    height={80}
                    className="object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">{item.productName}</h4>
                    <p className="text-sm text-gray-600">
                      {item.size && `Size: ${item.size}`} {item.color && `Color: ${item.color}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      ${item.price.toFixed(2)} x {item.quantity}
                    </p>
                  </div>
                  <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 border-t pt-4 space-y-2">
            <div className="flex justify-between text-lg">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span>Shipping:</span>
              <span>${shippingCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span>Tax ({taxRate * 100}%):</span>
              <span>${taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold mt-2">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Details and Payment Proof */}
      <Card className="w-full lg:w-1/2 p-4">
        <CardHeader>
          <CardTitle>Customer Details & Proof of Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="customerName">Full Name</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="customerEmail">Email</Label>
              <Input
                id="customerEmail"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="customerPhone">Phone Number</Label>
              <Input
                id="customerPhone"
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="deliveryAddress">Delivery Address</Label>
              <Textarea
                id="deliveryAddress"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="proofOfPayment">Upload Proof of Payment (Image/PDF)</Label>
              <Input
                id="proofOfPayment"
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                required
              />
              {proofOfPayment && <p className="text-sm text-gray-500 mt-1">File selected: {proofOfPayment.name}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting || cart.length === 0 || !proofOfPayment}>
              {isSubmitting ? "Submitting Order..." : "Place Order"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
