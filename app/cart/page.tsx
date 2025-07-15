"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/lib/cart-context"
import { MinusCircle, PlusCircle, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function CartPage() {
  const { state, dispatch } = useCart()
  const router = useRouter()

  const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingCost = state.deliveryMethod === "pickup" ? 0 : 5 // Example shipping cost
  const finalTotal = subtotal + shippingCost

  const handleUpdateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity > 0) {
      dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity: newQuantity } })
    } else {
      dispatch({ type: "REMOVE_FROM_CART", payload: id })
    }
  }

  const handleRemoveItem = (id: number) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: id })
  }

  const handleCheckout = () => {
    router.push("/checkout")
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:py-12">
      <h1 className="mb-8 text-3xl font-bold">Your Cart</h1>

      {state.items.length === 0 ? (
        <Card className="w-full max-w-md mx-auto text-center py-12">
          <CardTitle className="mb-4">Your cart is empty</CardTitle>
          <CardContent>
            <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
            <Link href="/">
              <Button>Start Shopping</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {state.items.map((item) => (
              <Card key={item.id} className="flex flex-col sm:flex-row items-center p-4 gap-4">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  width={120}
                  height={120}
                  className="rounded-md object-cover"
                />
                <div className="flex-1 grid gap-2 text-center sm:text-left">
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <p className="text-gray-500">€{item.price.toFixed(2)}</p>
                  {(item.selectedSize || item.selectedColor) && (
                    <p className="text-sm text-gray-500">
                      {item.selectedSize && `Size: ${item.selectedSize}`}
                      {item.selectedSize && item.selectedColor && ", "}
                      {item.selectedColor && `Color: ${item.selectedColor}`}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                  <span className="font-medium">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                  <Trash2 className="h-5 w-5 text-red-500" />
                </Button>
              </Card>
            ))}
          </div>

          <Card className="lg:col-span-1 h-fit">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal ({state.itemCount} items)</span>
                <span>€{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>{state.deliveryMethod === "pickup" ? "Pickup Cost" : "Shipping Cost"}</span>
                <span>€{shippingCost.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>€{finalTotal.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleCheckout}>
                Proceed to Checkout
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}
