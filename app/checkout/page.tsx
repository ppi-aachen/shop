"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { useCart } from "@/lib/cart-context"
import { Package, MapPin, Truck } from "lucide-react"
import CheckoutForm from "./checkout-form"
import { Suspense } from "react"
import LoadingOverlay from "@/components/loading-overlay"

export default function CheckoutPage() {
  const { state } = useCart()
  const router = useRouter()

  useEffect(() => {
    if (state.items.length === 0) {
      router.push("/cart")
    }
  }, [state.items.length, router])

  if (state.items.length === 0) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
              {state.items.map((item, index) => (
                <div
                  key={`${item.id}-${item.selectedSize}-${item.selectedColor}-${index}`}
                  className="flex items-center gap-4 pb-4 border-b"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center border">
                    <Package className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <div className="flex gap-2 mt-1">
                      {item.selectedSize && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">Size: {item.selectedSize}</span>
                      )}
                      {item.selectedColor && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">Color: {item.selectedColor}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    <p className="font-semibold text-green-600">
                      €{item.price.toFixed(2)} × {item.quantity} = €{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery Method Display */}
            <div className="border-t pt-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                {state.deliveryMethod === "pickup" ? (
                  <MapPin className="h-4 w-4 text-green-600" />
                ) : (
                  <Truck className="h-4 w-4 text-green-600" />
                )}
                <span className="font-medium">
                  {state.deliveryMethod === "pickup" ? "Pickup in Aachen" : "Delivery"}
                </span>
              </div>
              {state.deliveryMethod === "pickup" && (
                <p className="text-sm text-gray-600 ml-6">We'll contact you to arrange pickup location and time</p>
              )}
            </div>

            <div className="border-t pt-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Items ({state.itemCount})</span>
                  <span>€{state.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{state.deliveryMethod === "pickup" ? "Pickup" : "Delivery"}</span>
                  <span>€{state.shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xl font-bold border-t pt-2">
                  <span>Total</span>
                  <span className="text-green-600">€{state.finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Payment Instructions</h4>
              <p className="text-blue-800 text-sm">
                Please transfer €{state.finalTotal.toFixed(2)} to our account and upload the proof of payment:
              </p>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  <strong>PayPal:</strong> Friends & Family
                </p>
                <p>
                  <strong>Name:</strong> PPI Aachen
                </p>
                <p>
                  <strong>Account:</strong> macariozachary@gmail.com
                </p>
                <p>
                  <strong>Note:</strong> Aachen Studio-"Your name here"
                </p>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <Suspense fallback={<LoadingOverlay />}>
            <CheckoutForm />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
