"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/lib/cart-context"
import { ImageGallery } from "@/components/image-gallery"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

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
  stock: number
}

interface ProductModalProps {
  product: Product
}

export default function ProductModal({ product }: ProductModalProps) {
  const { dispatch } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string | undefined>(product.sizes?.[0])
  const [selectedColor, setSelectedColor] = useState<string | undefined>(product.colors?.[0])
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleAddToCart = () => {
    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity,
        selectedSize,
        selectedColor,
        sizes: product.sizes, // Pass available sizes
        colors: product.colors, // Pass available colors
      },
    })
    setIsModalOpen(false) // Close modal after adding to cart
  }

  const isAddToCartDisabled =
    product.stock === 0 ||
    (product.sizes && product.sizes.length > 0 && !selectedSize) ||
    (product.colors && product.colors.length > 0 && !selectedColor)

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full bg-transparent" disabled={product.stock === 0}>
          {product.stock === 0 ? "Out of Stock" : "View Details"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>€{product.price.toFixed(2)}</DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-6 py-4">
          <ImageGallery images={product.images && product.images.length > 0 ? product.images : [product.image]} />
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Description</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{product.description}</p>
              {product.detailedDescription && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{product.detailedDescription}</p>
              )}
            </div>

            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="size">Size</Label>
                <RadioGroup value={selectedSize} onValueChange={setSelectedSize} className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <Label
                      key={size}
                      htmlFor={`size-${size}`}
                      className={cn(
                        "flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium cursor-pointer",
                        selectedSize === size
                          ? "bg-primary text-primary-foreground"
                          : "bg-background hover:bg-accent hover:text-accent-foreground",
                      )}
                    >
                      <RadioGroupItem id={`size-${size}`} value={size} className="sr-only" />
                      {size}
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            )}

            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <RadioGroup value={selectedColor} onValueChange={setSelectedColor} className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <Label
                      key={color}
                      htmlFor={`color-${color}`}
                      className={cn(
                        "flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium cursor-pointer",
                        selectedColor === color
                          ? "bg-primary text-primary-foreground"
                          : "bg-background hover:bg-accent hover:text-accent-foreground",
                      )}
                    >
                      <RadioGroupItem id={`color-${color}`} value={color} className="sr-only" />
                      {color}
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            )}

            {product.features && product.features.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold">Features</h3>
                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold">Specifications</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <li key={key}>
                      <strong>{key}:</strong> {value}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.materials && product.materials.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold">Materials</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{product.materials.join(", ")}</p>
              </div>
            )}

            {product.careInstructions && product.careInstructions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold">Care Instructions</h3>
                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                  {product.careInstructions.map((instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ul>
              </div>
            )}

            <Separator />

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  -
                </Button>
                <span className="w-8 text-center">{quantity}</span>
                <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
                  +
                </Button>
              </div>
              <Button className="flex-1" onClick={handleAddToCart} disabled={isAddToCartDisabled}>
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </Button>
            </div>
            {product.stock <= 5 && product.stock > 0 && (
              <p className="text-sm text-orange-500 text-center">Only {product.stock} left in stock!</p>
            )}
            {product.stock === 0 && (
              <p className="text-sm text-red-500 text-center">This item is currently out of stock.</p>
            )}
            {isAddToCartDisabled && product.stock > 0 && (product.sizes?.length || product.colors?.length) && (
              <p className="text-sm text-red-500 text-center">Please select all required options.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
