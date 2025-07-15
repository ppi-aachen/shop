"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Download, Instagram, FileText, Package, Clock } from "lucide-react"
import { generateOrderPDF, downloadPDF } from "@/lib/pdf-generator"
import { useCart } from "@/lib/cart-context"

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const [orderData, setOrderData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { dispatch } = useCart()

  useEffect(() => {
    dispatch({ type: "CLEAR_CART" })
    // Try to get order data from localStorage (if available)
    if (orderId) {
      const savedOrderData = localStorage.getItem(`order-${orderId}`)
      if (savedOrderData) {
        try {
          const parsedData = JSON.parse(savedOrderData)
          setOrderData(parsedData)
        } catch (error) {
          console.error("Error parsing order data:", error)
        }
      }
    }
    setIsLoading(false)
  }, [orderId])

  const handleDownloadPDF = () => {
    if (orderData && orderId) {
      const htmlContent = generateOrderPDF(orderData.order, orderData.items)
      downloadPDF(htmlContent, `Order-Receipt-${orderId}.pdf`)
    } else {
      // Fallback if no order data available
      alert("Order receipt data not available. Please contact support for a copy of your receipt.")
    }
  }

  const handleContactInstagram = () => {
    window.open("https://instagram.com/aachen.studio", "_blank")
  }

  // Decode order ID for display info
  const getOrderInfo = (orderIdStr: string) => {
    if (!orderIdStr) return null

    const isPickup = orderIdStr.startsWith("PU")
    const isDelivery = orderIdStr.startsWith("DL")

    return {
      method: isPickup ? "Pickup" : isDelivery ? "Delivery" : "Unknown",
      icon: isPickup ? Package : isDelivery ? "🚚" : "📦",
    }
  }

  const orderInfo = orderId ? getOrderInfo(orderId) : null

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Processing your order...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4">
            <CheckCircle className="h-20 w-20 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-green-700 mb-2">Order Submitted Successfully!</CardTitle>

          {orderId && (
            <div className="space-y-2">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-700 font-medium">Order ID</p>
                <p className="text-lg font-mono font-bold text-green-800">{orderId}</p>
                {orderInfo && (
                  <div className="flex items-center justify-center gap-2 mt-2">
                    {typeof orderInfo.icon === "string" ? (
                      <span className="text-lg">{orderInfo.icon}</span>
                    ) : (
                      <Package className="h-4 w-4 text-green-600" />
                    )}
                    <span className="text-sm text-green-700">{orderInfo.method} Order</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Order Status */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-green-700">
              <Clock className="h-5 w-5" />
              <span className="font-medium">Processing within 24 hours</span>
            </div>
            <p className="text-gray-600">
              Thank you for your order! We have received your proof of payment and will process your order within 24
              hours.
            </p>
            <p className="text-sm text-gray-500">
              You will receive a confirmation email shortly with your order details and tracking information.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* PDF Download Button */}
            <Button onClick={handleDownloadPDF} className="w-full" size="lg" disabled={!orderData}>
              <Download className="h-5 w-5 mr-2" />
              Download Order Receipt (PDF)
            </Button>

            {!orderData && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">Receipt will be sent via email</span>
                </div>
              </div>
            )}

            {/* Instagram Button */}
            <Button onClick={handleContactInstagram} variant="outline" className="w-full" size="lg">
              <Instagram className="h-5 w-5 mr-2" />
              Follow @aachen.studio
            </Button>

            {/* Continue Shopping */}
            <Link href="/" className="block">
              <Button variant="outline" className="w-full" size="lg">
                Continue Shopping
              </Button>
            </Link>
          </div>

          {/* What's Next */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. We verify your proof of payment</li>
              <li>2. Your order enters production/preparation</li>
              <li>
                3. We{" "}
                {orderInfo?.method === "Pickup"
                  ? "contact you for pickup arrangement"
                  : "ship your order with tracking"}
              </li>
              <li>4. You receive your authentic Indonesian-inspired items!</li>
            </ol>
          </div>

          {/* Contact Information */}
          <div className="pt-4 border-t text-center">
            <p className="text-xs text-gray-500">
              Questions about your order?
              <br />
              Email:{" "}
              <a href="mailto:funding@ppiaachen.de" className="text-green-600 hover:underline">
                funding@ppiaachen.de
              </a>
              {" • "}
              Instagram:{" "}
              <button onClick={handleContactInstagram} className="text-green-600 hover:underline">
                @aachen.studio
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
