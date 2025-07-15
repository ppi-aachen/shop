"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

interface OrderData {
  orderId: string
  date: string
  time: string
  customerName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  deliveryMethod: string
  totalItems: number
  subtotal: number
  shippingCost: number
  totalAmount: number
  notes: string
  proofOfPaymentUrl: string
  status: string
}

interface OrderItemData {
  orderId: string
  itemId: number
  productName: string
  price: number
  quantity: number
  subtotal: number
  description: string
  selectedSize: string
  selectedColor: string
}

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const [orderInfo, setOrderInfo] = useState<{ order: OrderData; items: OrderItemData[] } | null>(null)

  useEffect(() => {
    if (orderId) {
      const storedOrder = localStorage.getItem(`order-${orderId}`)
      if (storedOrder) {
        setOrderInfo(JSON.parse(storedOrder))
        localStorage.removeItem(`order-${orderId}`) // Clear from local storage after display
      }
    }
  }, [orderId])

  if (!orderId) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Order Not Found</h1>
        <p className="text-gray-600 mb-6">
          We could not find details for this order. Please check your order ID or contact support.
        </p>
        <Link href="/">
          <Button>Go to Homepage</Button>
        </Link>
      </div>
    )
  }

  if (!orderInfo) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Loading Order Details...</h1>
        <p className="text-gray-600">Please wait while we retrieve your order information.</p>
      </div>
    )
  }

  const { order, items } = orderInfo

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:py-12">
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-green-600">Order Placed Successfully!</CardTitle>
          <CardDescription className="text-lg mt-2">Thank you for your purchase from Aachen Studio.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-xl font-semibold">Your Order ID: {order.orderId}</p>
            <p className="text-gray-600">A confirmation email has been sent to **{order.email}**.</p>
            <p className="text-gray-600">
              We will review your proof of payment and process your order within 24 hours.
            </p>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-3">Order Details</h3>
              <p>
                <strong>Date:</strong> {order.date} at {order.time}
              </p>
              <p>
                <strong>Delivery Method:</strong> {order.deliveryMethod === "pickup" ? "Pickup in Aachen" : "Delivery"}
              </p>
              <p>
                <strong>Total Items:</strong> {order.totalItems}
              </p>
              <p>
                <strong>Total Amount:</strong> €{order.totalAmount.toFixed(2)}
              </p>
              {order.proofOfPaymentUrl && (
                <p className="mt-2">
                  <strong>Proof of Payment:</strong>{" "}
                  <a
                    href={order.proofOfPaymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View Uploaded File
                  </a>
                </p>
              )}
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">Customer Information</h3>
              <p>
                <strong>Name:</strong> {order.customerName}
              </p>
              <p>
                <strong>Email:</strong> {order.email}
              </p>
              <p>
                <strong>Phone:</strong> {order.phone}
              </p>
              {order.deliveryMethod === "delivery" && (
                <>
                  <p>
                    <strong>Address:</strong> {order.address}, {order.city}, {order.state} {order.zipCode},{" "}
                    {order.country}
                  </p>
                </>
              )}
              {order.notes && (
                <p>
                  <strong>Notes:</strong> {order.notes}
                </p>
              )}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-xl font-semibold mb-3">Items Ordered</h3>
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.itemId}
                  className="flex justify-between items-center border-b pb-2 last:border-b-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">
                      {item.productName} (x{item.quantity})
                    </p>
                    {(item.selectedSize || item.selectedColor) && (
                      <p className="text-sm text-gray-500">
                        {item.selectedSize && `Size: ${item.selectedSize}`}
                        {item.selectedSize && item.selectedColor && ", "}
                        {item.selectedColor && `Color: ${item.selectedColor}`}
                      </p>
                    )}
                  </div>
                  <p>€{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-8">
            <Link href="/">
              <Button variant="outline">Continue Shopping</Button>
            </Link>
            <Link href="https://instagram.com/aachen.studio" target="_blank" rel="noopener noreferrer">
              <Button>Contact Us on Instagram</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
