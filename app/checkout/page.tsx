"use client"

import { Button } from "@/components/ui/button"

import { useCart } from "@/lib/cart-context"
import { CheckoutForm } from "./checkout-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { getProductImage } from "@/lib/image-utils"

export default function CheckoutPage() {
  const { state: cartState } = useCart()

  if (cartState.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 p-4">
        <ShoppingCart className="h-24 w-24 text-gray-400 mb-6" />
        <h2 className="text-3xl font-bold text-gray-800 mb-3">Your Cart is Empty</h2>
        <p className="text-gray-600 mb-8 text-center">Please add items to your cart before checking out.</p>
        <Link href="/">
          <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
            Start Shopping
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Checkout</h1>
        <CheckoutForm />
      </div>

      <div className="lg:col-span-1">
        <Card className="p-6 shadow-lg sticky top-24">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-2xl font-bold">Your Order</CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            {cartState.items.map((item) => (
              <div key={item.id} className="flex items-center space-x-4">
                <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden">
                  <Image
                    src={getProductImage(item.image) || "/placeholder.svg"}
                    alt={item.name}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
                <div className="flex-grow">
                  <p className="font-medium text-gray-800">{item.name}</p>
                  {item.selectedSize && <p className="text-sm text-gray-600">Size: {item.selectedSize}</p>}
                  {item.selectedColor && <p className="text-sm text-gray-600">Color: {item.selectedColor}</p>}
                  <p className="text-sm text-gray-600">
                    {formatCurrency(item.price)} x {item.quantity}
                  </p>
                </div>
                <span className="font-semibold text-gray-900">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="border-t pt-4 mt-4 space-y-2 text-gray-700">
              <div className="flex justify-between">
                <span>Subtotal ({cartState.itemCount} items)</span>
                <span>{formatCurrency(cartState.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="flex justify-between font-bold text-xl text-gray-900 border-t pt-4 mt-4">
                <span>Total</span>
                <span>{formatCurrency(cartState.totalAmount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
