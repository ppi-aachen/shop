"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { useCart } from "@/lib/cart-context"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ImageGallery } from "./image-gallery"

interface ProductModalProps {
  product: Product
  isOpen: boolean
  onClose: () => void
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const { addToCart } = useCart()
  const [selectedSize, setSelectedSize] = useState<string | undefined>(product.specifications?.sizes?.[0] || undefined)
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product.specifications?.colors?.[0] || undefined,
  )

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      selectedSize,
      selectedColor,
    })
    toast.success(`${product.name} added to cart!`)
    onClose()
  }

  const availableImages =
    product.images && product.images.length > 0
      ? product.images
      : [product.image || "/placeholder.svg?height=600&width=400&text=Product"]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          <div className="md:col-span-1">
            <ImageGallery images={availableImages} alt={product.name} />
          </div>
          <div className="md:col-span-1 flex flex-col justify-between">
            <div>
              <DialogHeader className="text-left">
                <DialogTitle className="text-3xl font-bold">{product.name}</DialogTitle>
                <DialogDescription className="text-xl font-semibold text-gray-800">
                  {formatCurrency(product.price)}
                </DialogDescription>
              </DialogHeader>
              <p className="mt-4 text-gray-600 text-sm leading-relaxed">{product.description}</p>

              {product.specifications?.sizes && product.specifications.sizes.length > 0 && (
                <div className="mt-4">
                  <Label htmlFor="size-select" className="mb-2 block">
                    Size
                  </Label>
                  <Select onValueChange={setSelectedSize} defaultValue={selectedSize}>
                    <SelectTrigger id="size-select" className="w-[180px]">
                      <SelectValue placeholder="Select a size" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.specifications.sizes.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {product.specifications?.colors && product.specifications.colors.length > 0 && (
                <div className="mt-4">
                  <Label htmlFor="color-select" className="mb-2 block">
                    Color
                  </Label>
                  <Select onValueChange={setSelectedColor} defaultValue={selectedColor}>
                    <SelectTrigger id="color-select" className="w-[180px]">
                      <SelectValue placeholder="Select a color" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.specifications.colors.map((color) => (
                        <SelectItem key={color} value={color}>
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div className="mt-6">
              <Button className="w-full" onClick={handleAddToCart}>
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
