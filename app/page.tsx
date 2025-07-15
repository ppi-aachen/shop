"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import ProductModal from "@/components/product-modal"
import { CartProvider } from "@/lib/cart-context"
import { Toaster } from "@/components/ui/toaster"
import { getProductsFromGoogleSheet } from "@/app/checkout/actions"

interface Product {
  id: number
  name: string
  price: number
  image: string
  images?: string[]
  description: string
  detailedDescription?: string
  features?: string[]
  specifications?: { [key: string]: string }
  materials?: string[]
  careInstructions?: string[]
  sizes?: string[]
  colors?: string[]
  stock?: number
}

export default async function Home() {
  const products = await getProductsFromGoogleSheet()

  return (
    <CartProvider>
      <div className="container mx-auto px-4 py-8 md:px-6 lg:py-12">
        <section className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">Welcome to Aachen Studio</h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Discover unique products inspired by Indonesian culture.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">Our Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="flex flex-col">
                <div className="relative w-full h-48">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    style={{ objectFit: "cover" }}
                    className="rounded-t-lg"
                  />
                </div>
                <CardHeader>
                  <CardTitle>{product.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold">€{product.price.toFixed(2)}</span>
                    {product.stock <= 5 && product.stock > 0 && (
                      <span className="text-sm text-orange-500">Only {product.stock} left!</span>
                    )}
                    {product.stock === 0 && <span className="text-sm text-red-500">Out of Stock</span>}
                  </div>
                  <ProductModal product={product} />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h2 className="text-3xl font-bold mb-4">About PPI Aachen</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            PPI Aachen is the Indonesian Student Association in Aachen, Germany. We aim to foster community among
            Indonesian students and promote Indonesian culture. Aachen Studio is our initiative to bring unique
            Indonesian-inspired products to you.
          </p>
          <Link href="https://ppiaachen.de" target="_blank" rel="noopener noreferrer">
            <Button variant="link" className="mt-6">
              Learn More About PPI Aachen
            </Button>
          </Link>
        </section>
      </div>
      <Toaster />
    </CartProvider>
  )
}
