"use client"

import type React from "react"
import { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { submitOrder } from "@/app/checkout/actions"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function CheckoutForm() {
  const { state: cartState, dispatch: cartDispatch } = useCart()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [proofOfPayment, setProofOfPayment] = useState<File | null>(null)
  const [deliveryMethod, setDeliveryMethod] = useState(cartState.deliveryMethod || "pickup") // Initialize with cart context
  const router = useRouter()
  const { toast } = useToast()

  const subtotal = cartState.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingCost = deliveryMethod === "pickup" ? 0 : 5 // Example shipping cost
  const totalAmount = subtotal + shippingCost
  const itemCount = cartState.items.reduce((sum, item) => sum + item.quantity, 0)

  // Validate cart items for required options
  const validateCartItems = (): string[] => {
    const errors: string[] = []
    cartState.items.forEach((item, index) => {
      if (item.sizes && item.sizes.length > 0 && !item.selectedSize) {
        errors.push(`Item ${index + 1} (${item.name}): Size is required`)
      }
      if (item.colors && item.colors.length > 0 && !item.selectedColor) {
        errors.push(`Item ${index + 1} (${item.name}): Color is required`)
      }
    })
    return errors
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const cartErrors = validateCartItems()
    if (cartErrors.length > 0) {
      setError("Please select required options for all items: " + cartErrors.join(", "))
      toast({
        title: "Validation Error",
        description: "Please select required options for all items.",
        variant: "destructive",
      })
      return
    }

    if (!proofOfPayment) {
      setError("Please upload a proof of payment.")
      toast({
        title: "Missing Proof of Payment",
        description: "Please upload a PDF or image of your payment confirmation.",
        variant: "destructive",
      })
      return
    }

    const formData = new FormData(event.currentTarget)
    formData.append("cartItems", JSON.stringify(cartState.items))
    formData.append("subtotal", subtotal.toFixed(2))
    formData.append("shippingCost", shippingCost.toFixed(2))
    formData.append("totalAmount", totalAmount.toFixed(2))
    formData.append("itemCount", itemCount.toString())
    formData.append("deliveryMethod", deliveryMethod)
    formData.append("proofOfPayment", proofOfPayment)

    startTransition(async () => {
      const result = await submitOrder(formData)
      if (result.success) {
        toast({
          title: "Order Placed Successfully!",
          description: `Your order ID is ${result.orderId}. Confirmation email sent.`,
          variant: "default",
        })
        cartDispatch({ type: "CLEAR_CART" }) // Clear cart after successful submission
        router.push(`/success?orderId=${result.orderId}`)
      } else {
        const errorMessage = result.error || "Failed to submit order. Please try again."
        setError(errorMessage)
        toast({
          title: "Order Submission Failed",
          description: errorMessage,
          variant: "destructive",
        })
        // If email sending failed but order was recorded, still redirect to success
        if (errorMessage.includes("Email") || errorMessage.includes("API key")) {
          cartDispatch({ type: "CLEAR_CART" })
          router.push(`/success?orderId=${result.orderId}`)
        }
      }
    })
  }

  useEffect(() => {
    // Redirect to home if cart is empty and not submitting
    if (cartState.items.length === 0 && !isPending) {
      router.push("/")
    }
  }, [cartState.items, isPending, router])

  if (cartState.items.length === 0 && !isPending) {
    return null // Or a loading spinner, or a message
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:py-12">
      <h1 className="mb-8 text-3xl font-bold">Checkout</h1>
      <form onSubmit={handleSubmit} className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" name="firstName" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" name="lastName" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" type="tel" required />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delivery Method</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                defaultValue="pickup"
                value={deliveryMethod}
                onValueChange={setDeliveryMethod}
                className="grid grid-cols-2 gap-4"
              >
                <Label
                  htmlFor="pickup"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                >
                  <RadioGroupItem id="pickup" value="pickup" className="sr-only" />
                  <TruckIcon className="mb-3 h-6 w-6" />
                  Pickup in Aachen
                </Label>
                <Label
                  htmlFor="delivery"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                >
                  <RadioGroupItem id="delivery" value="delivery" className="sr-only" />
                  <HomeIcon className="mb-3 h-6 w-6" />
                  Delivery
                </Label>
              </RadioGroup>
              {deliveryMethod === "delivery" && (
                <div className="mt-6 grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" name="address" required={deliveryMethod === "delivery"} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" name="city" required={deliveryMethod === "delivery"} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province</Label>
                      <Input id="state" name="state" required={deliveryMethod === "delivery"} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">Zip Code</Label>
                      <Input id="zipCode" name="zipCode" required={deliveryMethod === "delivery"} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" name="country" required={deliveryMethod === "delivery"} />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea id="notes" name="notes" placeholder="Any special instructions or requests?" rows={3} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {cartState.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div>
                      {item.name} (x{item.quantity})
                      {item.selectedSize && (
                        <span className="ml-2 text-sm text-gray-500">Size: {item.selectedSize}</span>
                      )}
                      {item.selectedColor && (
                        <span className="ml-2 text-sm text-gray-500">Color: {item.selectedColor}</span>
                      )}
                    </div>
                    <div>€{(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="space-y-2 text-right">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>€{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{deliveryMethod === "pickup" ? "Pickup Cost:" : "Shipping Cost:"}</span>
                  <span>€{shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>€{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Proof of Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500">
                Please upload a PDF or image (JPG, PNG) of your payment confirmation.
              </p>
              <Input
                id="proofOfPayment"
                name="proofOfPayment"
                type="file"
                accept="image/*,application/pdf"
                required
                onChange={(e) => setProofOfPayment(e.target.files ? e.target.files[0] : null)}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </CardContent>
          </Card>

          <Button
            type="submit"
            className="w-full"
            disabled={isPending || cartState.items.length === 0 || !proofOfPayment}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Placing Order..." : "Place Order"}
          </Button>
        </div>
      </form>
    </div>
  )
}

function HomeIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
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
      <path d="M19 18h2a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-1.44a2 2 0 0 1-1.41-.59L14 7" />
      <path d="M14 7a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-4Z" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  )
}
