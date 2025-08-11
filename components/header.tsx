import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/lib/cart-context"

export default function Header() {
  const { cart } = useCart()
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white shadow-sm dark:bg-gray-800">
      <Link className="flex items-center gap-2" href="/">
        <Image
          src="/aachen-studio-logo.png" // Updated to new logo
          alt="Aachen Studio Logo"
          width={120}
          height={40}
          className="object-contain"
        />
      </Link>
      <nav className="flex items-center gap-4">
        <Link className="text-sm font-medium hover:underline" href="/pos">
          POS
        </Link>
        <Link className="text-sm font-medium hover:underline" href="/cart">
          Cart
        </Link>
        <Button className="relative" size="icon" variant="ghost" asChild>
          <Link href="/cart">
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
                {totalItems}
              </span>
            )}
            <span className="sr-only">View cart</span>
          </Link>
        </Button>
      </nav>
    </header>
  )
}
