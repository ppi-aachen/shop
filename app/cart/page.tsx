"use client"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { useCart } from "@/lib/cart-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, Minus, Trash2, ArrowRight, Package } from "lucide-react"
import { getProductImage } from "@/lib/image-utils"

export default function CartPage() {
  const { state, dispatch } = useCart()
  const router = useRouter()

  const updateQuantity = (index: number, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id: index, quantity } })
  }

  const removeItem = (index: number) => {
    dispatch({ type: "REMOVE_ITEM", payload: index })
  }

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" })
  }

  const proceedToCheckout = () => {
    router.push("/checkout")
  }

  const setDeliveryMethod = (method: "pickup" | "delivery") => {
    dispatch({ type: "SET_DELIVERY_METHOD", payload: method })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        {state.items.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Add some products to get started!</p>
              <Button onClick={() => router.push("/")} size="lg">
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Items ({state.itemCount})</h2>
                <Button variant="ghost" onClick={clearCart} className="text-red-600 hover:text-red-700">
                  Clear Cart
                </Button>
              </div>

              {state.items.map((item, index) => {
                // Calculate display prices
                const hasDiscount = item.originalPrice && item.originalPrice > item.price
                const originalPrice = item.originalPrice || item.price
                const currentPrice = item.price

                return (
                  <Card key={`${item.id}-${item.selectedSize}-${item.selectedColor}-${index}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={getProductImage(item.image) || "/placeholder.svg"}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "/placeholder.svg"
                            }}
                          />
                        </div>

                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                          <p className="text-gray-600 text-sm mb-2">{item.description}</p>

                          <div className="flex gap-2 mb-2">
                            {item.selectedSize && (
                              <Badge variant="secondary" className="text-xs">
                                Size: {item.selectedSize}
                              </Badge>
                            )}
                            {item.selectedColor && (
                              <Badge variant="secondary" className="text-xs">
                                Color: {item.selectedColor}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {hasDiscount ? (
                              <>
                                <span className="text-gray-500 text-sm line-through">€{originalPrice.toFixed(2)}</span>
                                <span className="font-bold text-red-600">€{currentPrice.toFixed(2)}</span>
                                {item.discount && (
                                  <Badge className="bg-red-100 text-red-800 text-xs">{item.discount}% OFF</Badge>
                                )}
                              </>
                            ) : (
                              <span className="font-bold text-green-600">€{currentPrice.toFixed(2)}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(index, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="text-lg font-semibold min-w-[2rem] text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(index, item.quantity + 1)}
                              disabled={item.quantity >= (item.variantStock ?? item.stock)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="mt-4 text-right">
                        <p className="text-lg font-bold">Total: €{(currentPrice * item.quantity).toFixed(2)}</p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              {/* Delivery Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      state.deliveryMethod === "pickup"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setDeliveryMethod("pickup")}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Pickup in Aachen</h4>
                        <p className="text-sm text-gray-600">Free - We'll contact you</p>
                      </div>
                      <span className="font-bold text-green-600">€0.00</span>
                    </div>
                  </div>

                  <div
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      state.deliveryMethod === "delivery"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setDeliveryMethod("delivery")}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Delivery</h4>
                        <p className="text-sm text-gray-600">Based on item count</p>
                      </div>
                      <span className="font-bold text-green-600">€{state.shippingCost.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Items ({state.itemCount})</span>
                    <span>€{state.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{state.deliveryMethod === "pickup" ? "Pickup" : "Delivery"}</span>
                    <span>€{state.shippingCost.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>Total</span>
                    <span className="text-green-600">€{state.finalTotal.toFixed(2)}</span>
                  </div>

                  <Button onClick={proceedToCheckout} className="w-full mt-6" size="lg">
                    Proceed to Checkout
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>

                  <Button variant="outline" onClick={() => router.push("/")} className="w-full">
                    Continue Shopping
                  </Button>
                </CardContent>
              </Card>

              {/* Delivery Info */}
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full" />
                      <span>Secure payment with proof of payment</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full" />
                      <span>Quality guarantee on all products</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full" />
                      <span>Support Indonesian culture</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
