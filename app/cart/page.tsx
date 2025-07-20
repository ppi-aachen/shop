"use client"

import Link from "next/link"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCart } from "@/lib/cart-context"
import { Minus, Plus, Trash2, ShoppingBag, Package, Truck, MapPin } from "lucide-react"
import { getProductImage } from "@/lib/image-utils"

export default function CartPage() {
  const { state, dispatch } = useCart()

  const updateQuantity = (index: number, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id: index, quantity } })
  }

  const removeItem = (index: number) => {
    dispatch({ type: "REMOVE_ITEM", payload: index })
  }

  const setDeliveryMethod = (method: "pickup" | "delivery") => {
    dispatch({ type: "SET_DELIVERY_METHOD", payload: method })
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some products to get started!</p>
            <Link href="/">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {state.items.map((item, index) => (
              <Card key={`${item.id}-${item.selectedSize}-${item.selectedColor}-${index}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                    {/* Product Image with Fallback */}
                    <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center border overflow-hidden shrink-0">
                      {item.image ? (
                        <img
                          src={getProductImage(item.image) || "/placeholder.svg"}
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

                    <div className="flex-1 w-full">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                      {/* Show selected options */}
                      <div className="flex gap-2 mt-1">
                        {item.selectedSize && (
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">Size: {item.selectedSize}</span>
                        )}
                        {item.selectedColor && (
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">Color: {item.selectedColor}</span>
                        )}
                      </div>
                      <p className="text-lg font-bold text-green-600 mt-1">€{item.price.toFixed(2)}</p>
                    </div>

                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                      <Button variant="outline" size="sm" onClick={() => updateQuantity(index, item.quantity - 1)}>
                        <Minus className="h-4 w-4" />
                      </Button>

                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(index, Number.parseInt(e.target.value) || 0)}
                        className="w-16 text-center"
                        min="0"
                      />

                      <Button variant="outline" size="sm" onClick={() => updateQuantity(index, item.quantity + 1)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="text-right mt-2 sm:mt-0">
                      <p className="font-semibold text-lg">€{(item.price * item.quantity).toFixed(2)}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-700 mt-1"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Delivery Method Selection */}
                <div>
                  <Label className="text-base font-medium">Delivery Method</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="pickup"
                        name="delivery"
                        checked={state.deliveryMethod === "pickup"}
                        onChange={() => setDeliveryMethod("pickup")}
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
                        onChange={() => setDeliveryMethod("delivery")}
                        className="text-green-600"
                      />
                      <label htmlFor="delivery" className="flex items-center gap-2 cursor-pointer">
                        <Truck className="h-4 w-4" />
                        <span>Delivery</span>
                      </label>
                    </div>
                  </div>

                  {state.deliveryMethod === "delivery" && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm">
                      <p className="font-medium text-blue-900">Delivery Pricing:</p>
                      <p className="text-blue-800">1-3 items: €6.19</p>
                      <p className="text-blue-800">4-7 items: €7.69</p>
                      <p className="text-blue-800">8+ items: €10.49</p>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Items ({state.itemCount})</span>
                    <span>€{state.total.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>{state.deliveryMethod === "pickup" ? "Pickup" : "Delivery"}</span>
                    <span>€{state.shippingCost.toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>€{state.finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                <Link href="/checkout" className="block">
                  <Button className="w-full" size="lg">
                    Proceed to Checkout
                  </Button>
                </Link>

                <Link href="/" className="block">
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
