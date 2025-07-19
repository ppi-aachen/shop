"use client"

import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Eye } from "lucide-react"
import { getProductImage } from "@/lib/image-utils"
import type { Product } from "@/lib/types"

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product, quantity: number, selectedSize?: string, selectedColor?: string) => void
  setSelectedProduct: (product: Product) => void
}

export function ProductCard({ product, onAddToCart, setSelectedProduct }: ProductCardProps) {
  const requiresOptions = (product.sizes && product.sizes.length > 0) || (product.colors && product.colors.length > 0)

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <CardHeader className="p-0 relative">
        <div className="relative w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          <Image
            src={getProductImage(product.image) || "/placeholder.svg"}
            alt={product.name}
            layout="fill"
            objectFit="cover"
            className="transition-transform group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = "none"
              const parent = target.parentElement
              if (parent) {
                const iconDiv = document.createElement("div")
                iconDiv.className = "flex items-center justify-center w-full h-full"
                iconDiv.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="text-gray-400"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="M10 4v4"></path><path d="M2 8h20"></path><path d="M6 12h.01"></path><path d="M6 16h.01"></path><path d="M10 12h8"></path><path d="M10 16h8"></path></svg>`
                parent.appendChild(iconDiv)
              }
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
            <Button
              variant="secondary"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setSelectedProduct(product)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </div>
        </div>

        {product.images && product.images.length > 1 && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
            +{product.images.length} photos
          </div>
        )}

        {product.stock === 0 && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">Out of Stock</div>
        )}
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle
          className="text-lg mb-2 cursor-pointer hover:text-green-600 transition-colors"
          onClick={() => setSelectedProduct(product)}
        >
          {product.name}
        </CardTitle>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

        {requiresOptions && (
          <div className="mb-3">
            <p className="text-xs text-orange-600 font-medium">
              {product.sizes && product.sizes.length > 0 && product.colors && product.colors.length > 0
                ? "Size & Color selection required"
                : product.sizes && product.sizes.length > 0
                  ? "Size selection required"
                  : "Color selection required"}
            </p>
          </div>
        )}

        <p className="text-2xl font-bold text-green-600">€{product.price.toFixed(2)}</p>
        {product.stock <= 0 && <p className="text-red-500 font-semibold">Out of Stock</p>}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button onClick={() => onAddToCart(product, 1)} className="flex-1" disabled={product.stock <= 0}>
          <Plus className="h-4 w-4 mr-2" />
          {requiresOptions ? "Select Options" : "Add to Cart"}
        </Button>
        <Button variant="outline" onClick={() => setSelectedProduct(product)}>
          <Eye className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
