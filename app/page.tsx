"use client"

import type React from "react"
import { useState } from "react"
import ProductModal from "@/components/product-modal"
import { useCart } from "@/lib/cart-context"
import { useToast } from "@/components/ui/use-toast"
import { getProductsFromSheet } from "@/lib/google-sheets-api"
import type { Product } from "@/lib/types"
import { ProductCard } from "@/components/product-card"

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

export default async function Home() {
  const products: Product[] = await getProductsFromSheet()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const { addToCart } = useCart()
  const { toast } = useToast()

  const handleAddToCart = (product: Product, quantity: number, selectedSize?: string, selectedColor?: string) => {
    const price = Number.parseFloat(product.price.toString())
    if (isNaN(price)) {
      toast({
        title: "Error",
        description: `Invalid price for ${product.name}.`,
        variant: "destructive",
      })
      return
    }

    const stock = Number.parseInt(product.stock.toString())
    if (isNaN(stock) || stock < quantity) {
      toast({
        title: "Out of Stock",
        description: `Not enough stock for ${product.name}. Available: ${stock}`,
        variant: "destructive",
      })
      return
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: price,
      quantity,
      image: product.image,
      description: product.description,
      selectedSize,
      selectedColor,
      sizes: product.sizes || [],
      colors: product.colors || [],
      stock: stock,
    })
    toast({
      title: "Added to cart!",
      description: `${quantity} x ${product.name} added to your cart.`,
    })
    setSelectedProduct(null) // Close modal after adding to cart
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <section className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Discover Authentic Indonesian-Inspired Items
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Explore our unique collection of handcrafted goods, fashion, and more, brought to you by PPI Aachen.
        </p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={handleAddToCart}
            setSelectedProduct={setSelectedProduct}
          />
        ))}
      </section>

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
