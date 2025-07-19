"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { CheckCircleIcon, DownloadIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { generatePdfReceipt } from "@/lib/pdf-generator" // Corrected import
import type { OrderData, OrderItem } from "@/lib/types" // Assuming types are defined here

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[] | null>(null)

  useEffect(() => {
    // In a real application, you would fetch order details from a database
    // using the orderId. For this example, we'll use dummy data or
    // try to reconstruct from localStorage if available (not recommended for production)
    const storedOrderData = localStorage.getItem("lastOrderData")
    const storedOrderItems = localStorage.getItem("lastOrderItems")

    if (orderId && storedOrderData && storedOrderItems) {
      try {
        setOrderData(JSON.parse(storedOrderData))
        setOrderItems(JSON.parse(storedOrderItems))
        // Clear localStorage after successful display
        localStorage.removeItem("lastOrderData")
        localStorage.removeItem("lastOrderItems")
      } catch (error) {
        console.error("Failed to parse stored order data:", error)
      }
    }
  }, [orderId])

  const handleDownloadReceipt = () => {
    if (orderData && orderItems) {
      const pdfHtml = generatePdfReceipt(orderData, orderItems)
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(pdfHtml)
        printWindow.document.close()
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print()
          }, 500)
        }
      }
    } else {
      console.warn("Order data not available for PDF generation.")
    }
  }

  if (!orderId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-700 mb-2">Order Not Found</h2>
        <p className="text-gray-500 mb-8">The order ID is missing or invalid. Please check your order confirmation.</p>
        <Link href="/">
          <Button size="lg">Go to Shop</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-4 py-8">
      <Card className="w-full max-w-2xl text-center shadow-lg">
        <CardHeader className="bg-green-50 p-6 rounded-t-lg">
          <CheckCircleIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold text-green-800">Order Placed Successfully!</CardTitle>
          <CardDescription className="text-green-700 text-lg">
            Thank you for your purchase from Aachen Studio.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="text-left">
            <p className="text-gray-700 text-lg mb-2">
              Your order ID is: <span className="font-bold text-primary">{orderId}</span>
            </p>
            <p className="text-gray-600">
              We have received your proof of payment and your order is now pending review. You will receive an email
              confirmation shortly with all the details.
            </p>
            <p className="text-gray-600 mt-2">
              We will contact you once your order has been processed and is ready for{" "}
              {orderData?.deliveryMethod === "pickup" ? "pickup" : "delivery"}.
            </p>
          </div>

          {orderData && orderItems && (
            <div className="border-t pt-6">
              <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-left text-gray-700">
                <div>
                  <p>
                    <strong>Customer:</strong> {orderData.customerName}
                  </p>
                  <p>
                    <strong>Email:</strong> {orderData.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {orderData.phone}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Date:</strong> {orderData.date}
                  </p>
                  <p>
                    <strong>Time:</strong> {orderData.time}
                  </p>
                  <p>
                    <strong>Delivery Method:</strong> {orderData.deliveryMethod === "pickup" ? "Pickup" : "Delivery"}
                  </p>
                </div>
              </div>
              <div className="mt-4 text-left">
                <p className="font-semibold mb-2">Items:</p>
                <ul className="list-disc list-inside">
                  {orderItems.map((item, index) => (
                    <li key={index}>
                      {item.productName} (x{item.quantity}) - {item.selectedSize ? `Size: ${item.selectedSize}` : ""}{" "}
                      {item.selectedColor ? `Color: ${item.selectedColor}` : ""} - €{item.subtotal.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4 text-right text-lg font-bold text-gray-800">
                Total: €{orderData.totalAmount.toFixed(2)}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
            <Button onClick={handleDownloadReceipt} className="w-full sm:w-auto">
              <DownloadIcon className="mr-2 h-4 w-4" />
              Download Receipt
            </Button>
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full bg-transparent">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
