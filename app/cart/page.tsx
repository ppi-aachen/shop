"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/lib/cart-context"
import { Header } from "@/components/header"
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getProductImage } from "@/lib/image-utils"

export default function CartPage() {
  const { state, dispatch } = useCart()
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">(state.deliveryMethod)

  const updateQuantity = (index: number, newQuantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id: index, quantity: newQuantity } })
  }

  const removeItem = (index: number) => {
    dispatch({ type: "REMOVE_ITEM", payload: index })
  }

  const handleDeliveryMethodChange = (method: "pickup" | "delivery") => {
    setDeliveryMethod(method)
    dispatch({ type: "SET_DELIVERY_METHOD", payload: method })
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add some products to get started!</p>
            <Link href="/">
              <Button size="lg">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-green-600 hover:text-green-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continue Shopping
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-2">
            {state.itemCount} item{state.itemCount !== 1 ? "s" : ""} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {state.items.map((item, index) => {
              // Calculate display prices
              const hasDiscount = item.originalPrice && item.originalPrice > item.price
              const displayOriginalPrice = item.originalPrice || item.price
              const displayCurrentPrice = item.price
              const discountPercentage = hasDiscount
                ? Math.round(((displayOriginalPrice - displayCurrentPrice) / displayOriginalPrice) * 100)
                : 0

              return (
                <Card key={`${item.id}-${item.selectedSize || "no-size"}-${item.selectedColor || "no-color"}-${index}`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Product Image */}
                      <div className="w-full md:w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={getProductImage(item.image) || "/placeholder.svg"}
                          alt={item.name || "Product"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg"
                          }}
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {item.name || "Unknown Product"}
                            </h3>
                            <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                              {item.description || "No description available"}
                            </p>

                            {/* Product Options */}
                            {(item.selectedSize || item.selectedColor) && (
                              <div className="flex flex-wrap gap-2 mb-3">
                                {item.selectedSize && <Badge variant="outline">Size: {item.selectedSize}</Badge>}
                                {item.selectedColor && <Badge variant="outline">Color: {item.selectedColor}</Badge>}
                              </div>
                            )}

                            {/* Price Display */}
                            <div className="flex items-center gap-2 mb-3">
                              {hasDiscount ? (
                                <>
                                  <span className="text-gray-500 text-sm line-through">
                                    €{displayOriginalPrice.toFixed(2)}
                                  </span>
                                  <span className="text-lg font-bold text-red-600">
                                    €{displayCurrentPrice.toFixed(2)}
                                  </span>
                                  <Badge className="bg-red-100 text-red-800 text-xs">{discountPercentage}% OFF</Badge>
                                </>
                              ) : (
                                <span className="text-lg font-bold text-green-600">
                                  €{displayCurrentPrice.toFixed(2)}
                                </span>
                              )}
                            </div>

                            {/* Stock Information */}
                            <div className="text-sm text-gray-500">
                              {item.variantStock !== undefined ? (
                                <span>Stock: {item.variantStock} available</span>
                              ) : (
                                <span>Stock: {item.stock || 0} available</span>
                              )}
                            </div>
                          </div>

                          {/* Quantity Controls and Remove Button */}
                          <div className="flex flex-col items-end gap-3">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(index, Math.max(0, item.quantity - 1))}
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-12 text-center font-medium">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(index, item.quantity + 1)}
                                disabled={item.quantity >= (item.variantStock || item.stock || 0)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>

                        {/* Item Subtotal */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              Subtotal ({item.quantity} item{item.quantity !== 1 ? "s" : ""})
                            </span>
                            <span className="font-semibold text-gray-900">
                              €{(displayCurrentPrice * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
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
                  <Label className="text-base font-medium mb-3 block">Delivery Method</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="pickup"
                        name="delivery"
                        value="pickup"
                        checked={deliveryMethod === "pickup"}
                        onChange={() => handleDeliveryMethodChange("pickup")}
                        className="w-4 h-4 text-green-600"
                      />
                      <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                        <div className="flex justify-between items-center">
                          <span>🏪 Pickup in Aachen</span>
                          <span className="text-green-600 font-medium">FREE</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">We'll contact you to arrange pickup</p>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="delivery"
                        name="delivery"
                        value="delivery"
                        checked={deliveryMethod === "delivery"}
                        onChange={() => handleDeliveryMethodChange("delivery")}
                        className="w-4 h-4 text-green-600"
                      />
                      <Label htmlFor="delivery" className="flex-1 cursor-pointer">
                        <div className="flex justify-between items-center">
                          <span>🚚 Delivery</span>
                          <span className="font-medium">€{state.shippingCost.toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {state.itemCount <= 3 && "1-3 items: €6.19"}
                          {state.itemCount >= 4 && state.itemCount <= 7 && "4-7 items: €7.69"}
                          {state.itemCount >= 8 && "8+ items: €10.49"}
                        </p>
                      </Label>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      Subtotal ({state.itemCount} item{state.itemCount !== 1 ? "s" : ""})
                    </span>
                    <span>€{state.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{deliveryMethod === "pickup" ? "Pickup" : "Delivery"}</span>
                    <span>€{state.shippingCost.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-green-600">€{state.finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Link href="/checkout" className="block">
                  <Button className="w-full" size="lg">
                    Proceed to Checkout
                  </Button>
                </Link>

                {/* Security Notice */}
                <div className="text-xs text-gray-500 text-center">
                  <p>🔒 Secure checkout with proof of payment verification</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
