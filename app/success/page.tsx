"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, CheckCircle2Icon, HomeIcon } from "lucide-react"
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
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-gray-100 p-4 text-center">
      <CheckCircle2Icon className="h-20 w-20 text-green-500" />
      <h1 className="mt-6 text-4xl font-bold text-gray-800">Order Placed Successfully!</h1>
      <p className="mt-3 text-lg text-gray-600">Thank you for your purchase.</p>
      {orderId && (
        <p className="mt-2 text-xl font-semibold text-gray-700">
          Your Order ID: <span className="text-primary">{orderId}</span>
        </p>
      )}
      <p className="mt-4 max-w-md text-gray-500">
        You will receive an email confirmation shortly with your order details and a PDF receipt. Please check your spam
        folder if you don't see it.
      </p>
      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <Link href="/" passHref>
          <Button size="lg" className="flex items-center gap-2">
            <HomeIcon className="h-5 w-5" />
            Continue Shopping
          </Button>
        </Link>
        {/* You might want to add a button to view the PDF receipt directly if you have the URL */}
        {/* <Button size="lg" variant="outline" className="flex items-center gap-2 bg-transparent">
          <PrinterIcon className="h-5 w-5" />
          View Receipt
        </Button> */}
      </div>
    </div>
  )
}

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null // Render nothing on the server, wait for client-side hydration
  }

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
