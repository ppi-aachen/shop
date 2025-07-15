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
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/lib/cart-context"
import { ImageGallery } from "./image-gallery"
import { useToast } from "@/components/ui/use-toast"

interface Product {
  id: number
  name: string
  price: number
  image: string
  description: string
  sizes?: string[]
  colors?: string[]
}

interface ProductModalProps {
  product: Product
}

export default function ProductModal({ product }: ProductModalProps) {
  const { dispatch } = useCart()
  const { toast } = useToast()
  const [selectedSize, setSelectedSize] = useState<string | undefined>(product.sizes?.[0])
  const [selectedColor, setSelectedColor] = useState<string | undefined>(product.colors?.[0])
  const [quantity, setQuantity] = useState(1)
  const [isOpen, setIsOpen] = useState(false)

  const handleAddToCart = () => {
    if (product.sizes && !selectedSize) {
      toast({
        title: "Missing Option",
        description: "Please select a size.",
        variant: "destructive",
      })
      return
    }
    if (product.colors && !selectedColor) {
      toast({
        title: "Missing Option",
        description: "Please select a color.",
        variant: "destructive",
      })
      return
    }

    dispatch({
      type: "ADD_TO_CART",
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity,
        selectedSize,
        selectedColor,
        sizes: product.sizes, // Pass available sizes for validation in checkout
        colors: product.colors, // Pass available colors for validation in checkout
      },
    })
    toast({
      title: "Added to cart!",
      description: `${quantity} x ${product.name} added to your cart.`,
    })
    setIsOpen(false) // Close modal on add to cart
    setQuantity(1) // Reset quantity
  }

  const images = product.image ? [product.image, "/placeholder.jpg", "/placeholder.jpg"] : ["/placeholder.svg"]

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">View Details</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{product.name}</DialogTitle>
          <DialogDescription className="text-gray-500">{product.description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 md:grid-cols-2">
          <ImageGallery images={images} />
          <div className="space-y-6">
            <p className="text-3xl font-bold">€{product.price.toFixed(2)}</p>

            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="size">Size</Label>
                <RadioGroup id="size" value={selectedSize} onValueChange={setSelectedSize} className="flex gap-2">
                  {product.sizes.map((size) => (
                    <Label
                      key={size}
                      htmlFor={`size-${size}`}
                      className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-2 px-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
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
                <RadioGroup id="color" value={selectedColor} onValueChange={setSelectedColor} className="flex gap-2">
                  {product.colors.map((color) => (
                    <Label
                      key={color}
                      htmlFor={`color-${color}`}
                      className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-2 px-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                    >
                      <RadioGroupItem id={`color-${color}`} value={color} className="sr-only" />
                      {color}
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}>
                  -
                </Button>
                <span className="w-8 text-center">{quantity}</span>
                <Button variant="outline" size="icon" onClick={() => setQuantity((prev) => prev + 1)}>
                  +
                </Button>
              </div>
            </div>

            <Separator />

            <Button onClick={handleAddToCart} className="w-full">
              Add to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
