"use client"

import type React from "react"

import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { submitPOSOrder } from "@/app/checkout/actions"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { getProductImage } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { LoadingOverlay } from "@/components/loading-overlay"

export default function CheckoutPage() {
  const { cart, clearCart } = useCart()
  const { toast } = useToast()
  const router = useRouter()

  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [proofOfPayment, setProofOfPayment] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 0 ? 5.0 : 0.0
  const total = subtotal + shipping

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setProofOfPayment(event.target.files[0])
    } else {
      setProofOfPayment(null)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)

    if (cart.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checking out.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    const customerDetails = {
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      address: deliveryAddress,
    }

    const result = await submitPOSOrder(cart, customerDetails, proofOfPayment, subtotal, shipping, total)

    if (result.success) {
      toast({
        title: "Order Submitted!",
        description: `Your order #${result.orderId} has been placed. Proof of payment URL: ${result.proofOfPaymentUrl}`,
      })
      clearCart()
      router.push("/success")
    } else {
      toast({
        title: "Order Submission Failed",
        description: result.error || "Please try again.",
        variant: "destructive",
      })
    }
    setIsSubmitting(false)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="address">Delivery Address</Label>
                <Textarea
                  id="address"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="proofOfPayment">Proof of Payment (Image/PDF)</Label>
                <Input id="proofOfPayment" type="file" accept="image/*,.pdf" onChange={handleFileChange} required />
                {proofOfPayment && <p className="text-sm text-gray-500 mt-2">Selected file: {proofOfPayment.name}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Place Order"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <p className="text-gray-500">Your cart is empty.</p>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.variantId} className="flex items-center gap-4">
                    <Image
                      src={getProductImage(item.image) || "/placeholder.svg"}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      {Object.entries(item.selectedVariants).map(([type, value]) => (
                        <Badge key={type} variant="secondary" className="mr-1">
                          {type}: {value}
                        </Badge>
                      ))}
                      <p className="text-sm text-gray-600">
                        ${item.price.toFixed(2)} x {item.quantity}
                      </p>
                    </div>
                    <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="pt-4 mt-4 border-t">
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Shipping:</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-xl font-bold mt-2">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {isSubmitting && <LoadingOverlay />}
    </div>
  )
}
