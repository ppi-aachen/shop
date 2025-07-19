"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import ProductModal from "@/components/product-modal"
import { useCart } from "@/lib/cart-context"
import { useToast } from "@/components/ui/use-toast"
import { Loader2Icon, ShoppingCartIcon } from "lucide-react"

interface Product {
  ID: string
  Name: string
  Price: string
  Image: string
  "Images (JSON)": string
  Description: string
  "Detailed Description": string
  "Features (JSON)": string
  "Specifications (JSON)": string
  "Materials (JSON)": string
  "Care Instructions (JSON)": string
  "Sizes (JSON)": string
  "Colors (JSON)": string
  Stock: string
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const { addToCart } = useCart()
  const { toast } = useToast()

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        const response = await fetch("/api/products")
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Failed to fetch products")
        }
        const data: Product[] = await response.json()
        setProducts(data)
      } catch (err) {
        setError((err as Error).message)
        toast({
          title: "Error fetching products",
          description: (err as Error).message,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [toast])

  const handleAddToCart = (product: Product, quantity: number, selectedSize?: string, selectedColor?: string) => {
    const price = Number.parseFloat(product.Price)
    if (isNaN(price)) {
      toast({
        title: "Error",
        description: `Invalid price for ${product.Name}.`,
        variant: "destructive",
      })
      return
    }

    const stock = Number.parseInt(product.Stock)
    if (isNaN(stock) || stock < quantity) {
      toast({
        title: "Out of Stock",
        description: `Not enough stock for ${product.Name}. Available: ${stock}`,
        variant: "destructive",
      })
      return
    }

    addToCart({
      id: product.ID,
      name: product.Name,
      price: price,
      quantity,
      image: product.Image,
      description: product.Description,
      selectedSize,
      selectedColor,
      sizes: product["Sizes (JSON)"] ? JSON.parse(product["Sizes (JSON)"]) : [],
      colors: product["Colors (JSON)"] ? JSON.parse(product["Colors (JSON)"]) : [],
      stock: stock,
    })
    toast({
      title: "Added to cart!",
      description: `${quantity} x ${product.Name} added to your cart.`,
    })
    setSelectedProduct(null) // Close modal after adding to cart
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-lg">Loading products...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center text-center text-red-600">
        <XCircleIcon className="h-12 w-12 mb-4" />
        <h2 className="text-xl font-semibold">Error Loading Products</h2>
        <p className="text-sm">{error}</p>
        <p className="text-sm mt-2">Please ensure your Google Sheet is correctly configured and accessible.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:py-12">
      <h1 className="mb-8 text-4xl font-bold text-center">Our Products</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <Card key={product.ID} className="flex flex-col overflow-hidden rounded-lg shadow-lg">
            <div className="relative h-48 w-full">
              <Image
                src={product.Image || "/placeholder.svg?height=200&width=200"}
                alt={product.Name}
                layout="fill"
                objectFit="cover"
                className="transition-transform duration-300 hover:scale-105"
              />
            </div>
            <CardContent className="flex-grow p-4">
              <h2 className="text-xl font-semibold">{product.Name}</h2>
              <p className="text-gray-600 line-clamp-2">{product.Description}</p>
              <p className="mt-2 text-lg font-bold">€{Number.parseFloat(product.Price).toFixed(2)}</p>
              <p className={`text-sm ${Number.parseInt(product.Stock) > 0 ? "text-green-600" : "text-red-600"}`}>
                Stock: {Number.parseInt(product.Stock) > 0 ? product.Stock : "Out of Stock"}
              </p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button
                className="w-full"
                onClick={() => setSelectedProduct(product)}
                disabled={Number.parseInt(product.Stock) <= 0}
              >
                <ShoppingCartIcon className="mr-2 h-4 w-4" />
                {Number.parseInt(product.Stock) > 0 ? "View Details" : "Sold Out"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}
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
