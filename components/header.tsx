"use client"

import Link from "next/link"
import Image from "next/image"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"

export default function Header() {
  const { state } = useCart()

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/aachen-studio-logo.png"
              alt="Aachen Studio Logo"
              width={120}
              height={40}
              className="object-contain"
              priority // Mark as priority since it's likely above the fold
            />
          </Link>

          <div className="flex items-center space-x-4">
            <p className="text-sm text-gray-600"></p>
            <Link href="/cart">
              <Button variant="outline" className="relative bg-transparent">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Cart
                {state.itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                    {state.itemCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
