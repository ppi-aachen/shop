import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import dynamic from "next/dynamic" // Add this import
import "./globals.css"
import { CartProvider } from "@/lib/cart-context"
// import { Toaster } from "@/components/toaster" // This line is removed

// Dynamically import Toaster with ssr: false
const DynamicToaster = dynamic(() => import("@/components/toaster").then((mod) => mod.Toaster), {
  ssr: false, // This ensures the Toaster component is not rendered on the server
})

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Simple Shop - Proof of Payment",
  description: "Shop with proof of payment system",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          {children}
          <DynamicToaster /> {/* Use the dynamically imported component */}
        </CartProvider>
      </body>
    </html>
  )
}
