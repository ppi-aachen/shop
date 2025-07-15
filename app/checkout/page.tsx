"use client"

import { useCart } from "@/lib/cart-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import CheckoutForm from "./checkout-form"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CheckoutPage() {
  const { state } = useCart()
  const router = useRouter()

  useEffect(() => {
    if (state.items.length === 0) {
      router.push("/cart") // Redirect to cart if it's empty
    }
  }, [state.items, router])

  if (state.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 md:px-6 lg:py-12">
        <Card className="w-full max-w-md mx-auto text-center py-12">
          <CardTitle className="mb-4">Your cart is empty</CardTitle>
          <CardContent>
            <p className="text-gray-500 mb-6">You need to add items to your cart before checking out.</p>
            <Link href="/">
              <Button>Go to Homepage</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:py-12">
      <CheckoutForm />
    </div>
  )
}
