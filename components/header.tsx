"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCartIcon } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import Image from "next/image"

export function Header() {
  // Changed to named export
  const { cart } = useCart()
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2" prefetch={false}>
          <Image src="/placeholder-logo.png" alt="Aachen Studio Logo" width={32} height={32} className="h-8 w-8" />
          <span className="text-lg font-bold">Aachen Studio</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/" className="text-sm font-medium hover:underline" prefetch={false}>
            Shop
          </Link>
          <Link href="/cart" className="relative" prefetch={false}>
            <Button variant="ghost" size="icon">
              <ShoppingCartIcon className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}
