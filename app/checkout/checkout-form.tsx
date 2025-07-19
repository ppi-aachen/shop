"use client"

import type React from "react"
import { useState, useTransition } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/lib/cart-context"
import { submitOrder } from "./actions"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Loader2Icon, CheckCircle2Icon, XCircleIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  selectedSize?: string
  selectedColor?: string
}

function SubmitButton({ isPending }: { isPending: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending || isPending}>
      {pending || isPending ? (
        <>
          <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
          Submitting Order...
        </>
      ) : (
        "Place Order"
      )}
    </Button>
  )
}

function TruckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18H9" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.61a1 1 0 0 0-.88-.91l-1.52-.38a2 2 0 0 1-1.27-.73L14 2h-3v7" />
      <path d="M2 18h6" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  )
}

function StoreIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 7H4" />
      <path d="M22 21H2" />
      <path d="M7 21V7" />
      <path d="M17 21V7" />
      <path d="M2 7l7-3 2 4 2-4 7 3" />
    </svg>
  )
}

const buttonVariants = {
  default: "bg-blue-500 text-white hover:bg-blue-600",
}

export default function CheckoutForm() {
  const { cart, clearCart } = useCart()
  const [isPending, startTransition] = useTransition()
  const [deliveryMethod, setDeliveryMethod] = useState("delivery")
  const [proofOfPayment, setProofOfPayment] = useState<File | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingCost = deliveryMethod === "delivery" ? 5.0 : 0.0 // Example shipping cost
  const totalAmount = subtotal + shippingCost
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  const generateOrderId = () => {
    const now = new Date()
    const deliveryPrefix = deliveryMethod === "pickup" ? "PU" : "DL"
    const dateStr = now
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })
      .replace(/\//g, "")
    const randomSuffix = Math.random().toString(36).substr(2, 3).toUpperCase()
    return `${deliveryPrefix}${dateStr}-${randomSuffix}`
  }

  const orderId = generateOrderId()

  const handleSubmit = async (formData: FormData) => {
    setFormError(null)

    if (!proofOfPayment) {
      setFormError("Please upload a proof of payment.")
      return
    }

    formData.append("cartItems", JSON.stringify(cart))
    formData.append("orderId", orderId)
    formData.append("totalAmount", totalAmount.toFixed(2))
    formData.append("proofOfPayment", proofOfPayment)
    formData.append("deliveryMethod", deliveryMethod) // Add delivery method to form data

    startTransition(async () => {
      const result = await submitOrder(formData)
      if (result.success) {
        toast({
          title: "Order Submitted!",
          description: `Your order ${result.orderId} has been placed.`,
          action: (
            <Link href={`/success?orderId=${result.orderId}`} className={cn(buttonVariants.default)}>
              View Order
            </Link>
          ),
        })
        clearCart()
        router.push(`/success?orderId=${result.orderId}`)
      } else {
        setFormError(result.message || "Failed to submit order. Please try again.")
        toast({
          title: "Order Failed",
          description: result.message || "There was an error processing your order.",
          variant: "destructive",
        })
      }
    })
  }

  return (
    <form action={handleSubmit} className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customerName">Full Name</Label>
              <Input id="customerName" name="customerName" placeholder="John Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email</Label>
              <Input id="customerEmail" name="customerEmail" type="email" placeholder="john@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Phone Number</Label>
              <Input id="customerPhone" name="customerPhone" type="tel" placeholder="+49 123 456789" required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Order Notes (Optional)</Label>
              <Textarea id="notes" name="notes" placeholder="Any special instructions or requests?" rows={3} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Method</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={deliveryMethod} onValueChange={setDeliveryMethod} className="grid gap-4 md:grid-cols-2">
              <Label
                htmlFor="delivery"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
              >
                <RadioGroupItem id="delivery" value="delivery" className="sr-only" />
                <TruckIcon className="mb-3 h-6 w-6" />
                <span>Delivery</span>
              </Label>
              <Label
                htmlFor="pickup"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
              >
                <RadioGroupItem id="pickup" value="pickup" className="sr-only" />
                <StoreIcon className="mb-3 h-6 w-6" />
                <span>Pickup in Aachen</span>
              </Label>
            </RadioGroup>
          </CardContent>
        </Card>

        {deliveryMethod === "delivery" && (
          <Card>
            <CardHeader>
              <CardTitle>Delivery Address</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="deliveryAddress">Street Address</Label>
                <Input
                  id="deliveryAddress"
                  name="deliveryAddress"
                  placeholder="123 Main St"
                  required={deliveryMethod === "delivery"}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" placeholder="Aachen" required={deliveryMethod === "delivery"} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input id="state" name="state" placeholder="NRW" required={deliveryMethod === "delivery"} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input id="zipCode" name="zipCode" placeholder="52062" required={deliveryMethod === "delivery"} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" name="country" placeholder="Germany" required={deliveryMethod === "delivery"} />
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Proof of Payment</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <p className="text-sm text-gray-500">Please upload a screenshot or PDF of your payment confirmation.</p>
            <Input
              id="proofOfPayment"
              name="proofOfPayment"
              type="file"
              accept="image/*,application/pdf"
              required
              onChange={(e) => setProofOfPayment(e.target.files ? e.target.files[0] : null)}
            />
            {proofOfPayment && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2Icon className="h-4 w-4" />
                <span>{proofOfPayment.name} uploaded.</span>
              </div>
            )}
            {formError && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <XCircleIcon className="h-4 w-4" />
                <span>{formError}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              {cart.map((item) => (
                <div
                  key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
                  className="flex items-center justify-between"
                >
                  <div className="text-sm">
                    {item.name} ({item.quantity}x)
                    {(item.selectedSize || item.selectedColor) && (
                      <span className="text-gray-500">
                        {" "}
                        ({item.selectedSize && `Size: ${item.selectedSize}`}
                        {item.selectedSize && item.selectedColor && ", "}
                        {item.selectedColor && `Color: ${item.selectedColor}`})
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-medium">€{(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label>Subtotal ({totalItems} items)</Label>
              <span className="font-semibold">€{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <Label>{deliveryMethod === "pickup" ? "Pickup" : "Shipping"}</Label>
              <span className="font-semibold">€{shippingCost.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total</span>
              <span>€{totalAmount.toFixed(2)}</span>
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton isPending={isPending} />
          </CardFooter>
        </Card>
      </div>
    </form>
  )
}
