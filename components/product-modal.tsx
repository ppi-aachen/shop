"use client"

import { Input } from "@/components/ui/input"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/lib/cart-context"
import { MinusIcon, PlusIcon } from "lucide-react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

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
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined,
  )
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product.colors && product.colors.length > 0 ? product.colors[0] : undefined,
  )
  const [isOpen, setIsOpen] = useState(false)

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      description: product.description,
      selectedSize,
      selectedColor,
      sizes: product.sizes,
      colors: product.colors,
      stock: product.stock, // Pass stock to cart item for potential future validation
    })
    setIsOpen(false) // Close modal after adding to cart
  }

  const isOutOfStock = product.stock === 0
  const isAddButtonDisabled = isOutOfStock || quantity > product.stock

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full bg-transparent" disabled={isOutOfStock}>
          {isOutOfStock ? "Out of Stock" : "View Details"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] p-0">
        <div className="grid md:grid-cols-2 gap-6 p-6">
          <div className="flex flex-col items-center justify-center">
            {product.images && product.images.length > 0 ? (
              <Carousel className="w-full max-w-md">
                <CarouselContent>
                  {product.images.map((img, index) => (
                    <CarouselItem key={index}>
                      <Image
                        alt={`${product.name} image ${index + 1}`}
                        className="aspect-square object-cover border border-gray-200 w-full rounded-lg overflow-hidden dark:border-gray-800"
                        height={400}
                        src={img || "/placeholder.svg"}
                        width={400}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            ) : (
              <Image
                alt={product.name}
                className="aspect-square object-cover border border-gray-200 w-full rounded-lg overflow-hidden dark:border-gray-800"
                height={400}
                src={product.image || "/placeholder.svg"}
                width={400}
              />
            )}
          </div>
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold">{product.name}</DialogTitle>
              <DialogDescription className="text-lg text-gray-700">€{product.price.toFixed(2)}</DialogDescription>
            </DialogHeader>
            <p className="text-gray-600">{product.description}</p>

            {product.detailedDescription && (
              <>
                <Separator />
                <h4 className="font-semibold">Details:</h4>
                <p className="text-gray-600 text-sm">{product.detailedDescription}</p>
              </>
            )}

            {product.features && product.features.length > 0 && (
              <>
                <Separator />
                <h4 className="font-semibold">Features:</h4>
                <ul className="list-disc list-inside text-gray-600 text-sm">
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </>
            )}

            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <>
                <Separator />
                <h4 className="font-semibold">Specifications:</h4>
                <ul className="list-disc list-inside text-gray-600 text-sm">
                  {Object.entries(product.specifications).map(([key, value], index) => (
                    <li key={index}>
                      <strong>{key}:</strong> {value}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {product.materials && product.materials.length > 0 && (
              <>
                <Separator />
                <h4 className="font-semibold">Materials:</h4>
                <p className="text-gray-600 text-sm">{product.materials.join(", ")}</p>
              </>
            )}

            {product.careInstructions && product.careInstructions.length > 0 && (
              <>
                <Separator />
                <h4 className="font-semibold">Care Instructions:</h4>
                <ul className="list-disc list-inside text-gray-600 text-sm">
                  {product.careInstructions.map((instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ul>
              </>
            )}

            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="size">Size</Label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger id="size">
                    <SelectValue placeholder="Select a size" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.sizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Select value={selectedColor} onValueChange={setSelectedColor}>
                  <SelectTrigger id="color">
                    <SelectValue placeholder="Select a color" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.colors.map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <MinusIcon className="h-4 w-4" />
                </Button>
                <Input id="quantity" type="number" value={quantity} className="w-16 text-center" readOnly />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={quantity >= product.stock} // Disable if quantity reaches stock limit
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
              {product.stock <= 5 && product.stock > 0 && (
                <p className="text-sm text-orange-500">Only {product.stock} left in stock!</p>
              )}
              {product.stock === 0 && <p className="text-sm text-red-500 font-semibold">Out of Stock</p>}
              {quantity > product.stock && product.stock > 0 && (
                <p className="text-sm text-red-500">Cannot add more than available stock ({product.stock}).</p>
              )}
            </div>
          </div>
        </div>
        <DialogFooter className="p-6 pt-0">
          <Button onClick={handleAddToCart} className="w-full" disabled={isAddButtonDisabled}>
            {isAddButtonDisabled ? "Out of Stock" : "Add to Cart"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
