"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/lib/cart-context"
import Image from "next/image"
import Link from "next/link"
import { MinusCircle, PlusCircle, Trash2 } from "lucide-react"

export default function CartPage() {
  const { state, dispatch } = useCart()

  const handleUpdateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      dispatch({ type: "REMOVE_ITEM", payload: id })
    } else {
      dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity: newQuantity } })
    }
  }

  const handleRemoveItem = (id: number) => {
    dispatch({ type: "REMOVE_ITEM", payload: id })
  }

  const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingCost = state.deliveryMethod === "pickup" ? 0 : 5 // Example shipping cost
  const totalAmount = subtotal + shippingCost

  const hasMissingOptions = state.items.some(
    (item) =>
      (item.sizes && item.sizes.length > 0 && !item.selectedSize) ||
      (item.colors && item.colors.length > 0 && !item.selectedColor),
  )

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:py-12">
      <h1 className="mb-8 text-3xl font-bold">Your Cart</h1>

      {state.items.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-lg text-gray-600 mb-6">Your cart is empty.</p>
            <Link href="/">
              <Button>Continue Shopping</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {state.items.map((item) => (
              <Card key={item.id} className="flex flex-col md:flex-row items-center p-4 gap-4">
                <div className="relative w-24 h-24 flex-shrink-0">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    fill
                    style={{ objectFit: "cover" }}
                    className="rounded-md"
                  />
                </div>
                <div className="flex-grow text-center md:text-left">
                  <h2 className="text-lg font-semibold">{item.name}</h2>
                  <p className="text-gray-600">€{item.price.toFixed(2)}</p>
                  {(item.selectedSize || item.selectedColor) && (
                    <p className="text-sm text-gray-500">
                      {item.selectedSize && `Size: ${item.selectedSize}`}
                      {item.selectedSize && item.selectedColor && ", "}
                      {item.selectedColor && `Color: ${item.selectedColor}`}
                    </p>
                  )}
                  {((item.sizes && item.sizes.length > 0 && !item.selectedSize) ||
                    (item.colors && item.colors.length > 0 && !item.selectedColor)) && (
                    <p className="text-sm text-red-500 mt-1">Please select required options for this item.</p>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-4 md:mt-0">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
                <div className="font-semibold text-lg mt-4 md:mt-0 md:ml-auto">
                  €{(item.price * item.quantity).toFixed(2)}
                </div>
              </Card>
            ))}
          </div>

          <Card className="lg:col-span-1 h-fit">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal ({state.itemCount} items):</span>
                  <span>€{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{state.deliveryMethod === "pickup" ? "Pickup Cost:" : "Shipping Cost:"}</span>
                  <span>€{shippingCost.toFixed(2)}</span>
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>€{totalAmount.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <Button asChild className="w-full" disabled={hasMissingOptions}>
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
                {hasMissingOptions && (
                  <p className="text-sm text-red-500 text-center">
                    Please select all required options for items in your cart before proceeding.
                  </p>
                )}
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => dispatch({ type: "CLEAR_CART" })}
                >
                  Clear Cart
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
