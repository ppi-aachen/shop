"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useCart } from "@/lib/cart-context"
import Image from "next/image"

export default function Header() {
  const { state } = useCart()

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/90 backdrop-blur-sm dark:bg-gray-950/90">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Image src="/placeholder-logo.svg" alt="Aachen Studio Logo" width={32} height={32} />
          Aachen Studio
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <Link href="/#products" className="hover:text-primary">
            Products
          </Link>
          <Link
            href="https://instagram.com/aachen.studio"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary"
          >
            Instagram
          </Link>
          <Link href="mailto:funding@ppiaachen.de" className="hover:text-primary">
            Contact
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {state.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {state.itemCount}
                </span>
              )}
              <span className="sr-only">View cart</span>
            </Button>
          </Link>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="grid gap-4 p-4">
                <Link href="/" className="font-semibold hover:text-primary">
                  Home
                </Link>
                <Link href="/#products" className="font-semibold hover:text-primary">
                  Products
                </Link>
                <Link
                  href="https://instagram.com/aachen.studio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold hover:text-primary"
                >
                  Instagram
                </Link>
                <Link href="mailto:funding@ppiaachen.de" className="font-semibold hover:text-primary">
                  Contact
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
