"use client"

import type React from "react"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { CheckCircle, Download, Mail, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { generateOrderPDF, downloadPDF } from "@/lib/pdf-generator"
import { getProductsFromGoogleSheet } from "@/app/checkout/actions" // Assuming this can fetch products
import { formatCurrency } from "@/lib/utils"

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
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItemData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOrderDetails() {
      if (!orderId) {
        setError("Order ID not found in URL.")
        setLoading(false)
        return
      }

      try {
        // In a real application, you would fetch order details from a database
        // For this example, we'll simulate fetching and reconstruct data
        // This is a placeholder and won't actually retrieve the specific order from the sheet
        // You would need a server action/API route to query the sheet for a specific order ID
        const allProducts = await getProductsFromGoogleSheet() // Fetch all products to get details

        // Simulate order data (replace with actual fetch from your backend/sheet)
        const simulatedOrderData: OrderData = {
          orderId: orderId,
          date: new Date().toLocaleDateString("en-GB"),
          time: new Date().toLocaleTimeString("en-GB"),
          customerName: "Customer Name", // Placeholder
          email: "customer@example.com", // Placeholder
          phone: "+49 123 456789", // Placeholder
          address: "123 Main St", // Placeholder
          city: "Aachen", // Placeholder
          state: "NRW", // Placeholder
          zipCode: "52062", // Placeholder
          country: "Germany", // Placeholder
          deliveryMethod: "pickup", // Placeholder
          totalItems: 0, // Will be calculated
          subtotal: 0, // Will be calculated
          shippingCost: 0, // Will be calculated
          totalAmount: 0, // Will be calculated
          notes: "No notes.", // Placeholder
          proofOfPaymentUrl: "/placeholder.svg", // Placeholder
          status: "Pending Review", // Placeholder
        }

        // Simulate order items (replace with actual fetch from your backend/sheet)
        // This is a very basic simulation, assuming some items were ordered
        const simulatedOrderItems: OrderItemData[] = [
          {
            orderId: orderId,
            itemId: 1, // Placeholder ID
            productName: "Simulated Product 1",
            price: 15.0,
            quantity: 2,
            subtotal: 30.0,
            description: "A cool product",
            selectedSize: "M",
            selectedColor: "Red",
          },
          {
            orderId: orderId,
            itemId: 2, // Placeholder ID
            productName: "Simulated Product 2",
            price: 25.0,
            quantity: 1,
            subtotal: 25.0,
            description: "Another cool product",
            selectedSize: "L",
            selectedColor: "Blue",
          },
        ]

        // Calculate totals based on simulated items
        simulatedOrderData.totalItems = simulatedOrderItems.reduce((sum, item) => sum + item.quantity, 0)
        simulatedOrderData.subtotal = simulatedOrderItems.reduce((sum, item) => sum + item.subtotal, 0)
        simulatedOrderData.shippingCost = simulatedOrderData.deliveryMethod === "delivery" ? 5.0 : 0.0
        simulatedOrderData.totalAmount = simulatedOrderData.subtotal + simulatedOrderData.shippingCost

        setOrderData(simulatedOrderData)
        setOrderItems(simulatedOrderItems)
      } catch (err) {
        console.error("Failed to fetch order details:", err)
        setError("Failed to load order details. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [orderId])

  const handleDownloadPdf = () => {
    if (orderData && orderItems) {
      const pdfContent = generateOrderPDF(orderData, orderItems)
      downloadPDF(pdfContent, `order-receipt-${orderData.orderId}.pdf`)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 p-4">
        <Loader2Icon className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-gray-700">Loading your order details...</p>
      </div>
    )
  }

  if (error || !orderData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 p-4 text-center">
        <XCircleIcon className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Order</h2>
        <p className="text-gray-600 mb-8">{error || "Could not retrieve order details."}</p>
        <Link href="/">
          <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
            Go to Homepage
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center bg-green-600 text-white rounded-t-lg py-8">
            <CheckCircle className="h-16 w-16 mx-auto mb-4" />
            <CardTitle className="text-4xl font-bold mb-2">Order Confirmed!</CardTitle>
            <CardDescription className="text-green-100 text-lg">
              Thank you for your purchase from Aachen Studio.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="text-center">
              <p className="text-gray-700 text-lg mb-2">Your order ID is:</p>
              <p className="text-4xl font-extrabold text-green-700 tracking-wide">{orderData.orderId}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-xl mb-2 text-gray-800">Customer Details</h3>
                <p>
                  <strong>Name:</strong> {orderData.customerName}
                </p>
                <p>
                  <strong>Email:</strong> {orderData.email}
                </p>
                <p>
                  <strong>Phone:</strong> {orderData.phone}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-2 text-gray-800">Delivery Details</h3>
                <p>
                  <strong>Method:</strong> {orderData.deliveryMethod === "pickup" ? "Pickup in Aachen" : "Delivery"}
                </p>
                {orderData.deliveryMethod === "delivery" && (
                  <>
                    <p>
                      <strong>Address:</strong> {orderData.address}, {orderData.city}
                    </p>
                    <p>
                      {orderData.state} {orderData.zipCode}, {orderData.country}
                    </p>
                  </>
                )}
                <p>
                  <strong>Status:</strong> <span className="font-medium text-orange-600">{orderData.status}</span>
                </p>
              </div>
            </div>

            <div className="border-t pt-6 mt-6">
              <h3 className="font-semibold text-xl mb-4 text-gray-800">Order Summary</h3>
              <div className="space-y-2">
                {orderItems.map((item) => (
                  <div key={item.itemId} className="flex justify-between text-gray-700">
                    <span>
                      {item.productName} (x{item.quantity}){item.selectedSize && ` - Size: ${item.selectedSize}`}
                      {item.selectedColor && ` - Color: ${item.selectedColor}`}
                    </span>
                    <span>{formatCurrency(item.subtotal)}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t pt-2 text-gray-700">
                  <span>Subtotal</span>
                  <span>{formatCurrency(orderData.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span>{formatCurrency(orderData.shippingCost)}</span>
                </div>
                <div className="flex justify-between font-bold text-2xl text-green-700 border-t pt-4">
                  <span>Total</span>
                  <span>{formatCurrency(orderData.totalAmount)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <Button
                onClick={handleDownloadPdf}
                className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none"
              >
                <Download className="h-5 w-5 mr-2" />
                Download Receipt
              </Button>
              <a
                href={`mailto:${orderData.email}?subject=Your Order ${orderData.orderId} from Aachen Studio`}
                className="flex-1 sm:flex-none"
              >
                <Button variant="outline" className="w-full flex items-center bg-transparent">
                  <Mail className="h-5 w-5 mr-2" />
                  Email Confirmation
                </Button>
              </a>
              <Link href="/" className="flex-1 sm:flex-none">
                <Button variant="secondary" className="w-full flex items-center">
                  <Home className="h-5 w-5 mr-2" />
                  Back to Shop
                </Button>
              </Link>
            </div>

            <div className="text-center text-gray-500 text-sm mt-8">
              <p>
                You will also receive an email confirmation shortly. Please check your spam folder if you don't see it.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function XCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  )
}

function Loader2Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}
