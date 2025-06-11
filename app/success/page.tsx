// app/success/page.tsx
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
  }, [orderId, dispatch])

  const handleDownloadPDF = () => {
    // Generate PDF even if orderData is not immediately available
    // You might need to fetch order details again here if they are not in localStorage
    // For now, I'm assuming the order details are available or can be constructed from orderId
    if (orderId) {
      // Example: If you had a function to fetch order details by ID:
      // const orderDetails = await fetchOrderDetails(orderId);
      // const htmlContent = generateOrderPDF(orderDetails.order, orderDetails.items);
      // downloadPDF(htmlContent, `Order-Receipt-${orderId}.pdf`);

      // For now, using a placeholder.  Replace this with actual logic to get order details
      const placeholderOrder = { /* ... placeholder order object ... */ };
      const placeholderItems = [/* ... placeholder items array ... */];
      const htmlContent = generateOrderPDF(placeholderOrder, placeholderItems);
      downloadPDF(htmlContent, `Order-Receipt-${orderId}.pdf`);
    } else {
      alert("Order ID not found.  Unable to generate receipt.");
    }
  };

  const handleContactInstagram = () => {
    window.open("https://instagram.com/aachen.studio", "_blank")
  }

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
        {/* ... loading indicator ... */}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* ... success content ... */}
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">{/* ... loading indicator ... */}</div>}>
      <SuccessContent />
    </Suspense>
  )
}
