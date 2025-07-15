"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Minus, ShoppingCart } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { getProductImage } from "@/lib/image-utils"
import { useToast } from "@/hooks/use-toast"

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
  stock: number // Ensure stock is part of the Product interface
}

interface ProductModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const { dispatch, state: cartState } = useCart()
  const { toast } = useToast()
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined)
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (product) {
      setQuantity(1) // Reset quantity when product changes
      setSelectedSize(product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined)
      setSelectedColor(product.colors && product.colors.length > 0 ? product.colors[0] : undefined)
    }
  }, [product])

  const handleAddToCart = () => {
    if (!product) return

    const currentCartItem = cartState.items.find(
      (item) => item.id === product.id && item.selectedSize === selectedSize && item.selectedColor === selectedColor,
    )
    const quantityInCart = currentCartItem ? currentCartItem.quantity : 0
    const totalQuantityAttempted = quantityInCart + quantity

    if (totalQuantityAttempted > product.stock) {
      toast({
        variant: "destructive",
        title: "Insufficient Stock",
        description: `Only ${product.stock} of this item are available. You have ${quantityInCart} in your cart.`,
      })
      return
    }

    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast({
        variant: "warning",
        title: "Size Required",
        description: "Please select a size before adding to cart.",
      })
      return
    }
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast({
        variant: "warning",
        title: "Color Required",
        description: "Please select a color before adding to cart.",
      })
      return
    }

    dispatch({
      type: "ADD_ITEM",
      payload: {
        ...product,
        quantity: quantity, // Pass the selected quantity
        selectedSize,
        selectedColor,
        stock: product.stock, // Pass stock to cart item
      },
    })

    toast({
      variant: "success",
      title: "Added to Cart!",
      description: `${quantity} x ${product.name} added to your cart.`,
    })
    onClose()
  }

  if (!product) return null

  const maxQuantity = product.stock
  const isOutOfStock = product.stock <= 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] p-0">
        <div className="grid md:grid-cols-2 gap-6 p-6">
          <div className="relative">
            <Carousel className="w-full max-w-md mx-auto">
              <CarouselContent>
                {(product.images || [product.image]).map((img, index) => (
                  <CarouselItem key={index}>
                    <img
                      src={getProductImage(img) || "/placeholder.svg"}
                      alt={`${product.name} image ${index + 1}`}
                      className="w-full h-auto object-cover rounded-lg"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
            {product.images && product.images.length > 1 && (
              <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                +{product.images.length} photos
              </div>
            )}
          </div>
          <div className="flex flex-col justify-between">
            <div>
              <DialogHeader>
                <DialogTitle className="text-3xl font-bold">{product.name}</DialogTitle>
                <DialogDescription className="text-gray-600 mt-2">{product.description}</DialogDescription>
              </DialogHeader>
              <div className="mt-4">
                <p className="text-4xl font-bold text-green-600">€{product.price.toFixed(2)}</p>
                <p className={`text-sm font-medium mt-1 ${isOutOfStock ? "text-red-500" : "text-gray-500"}`}>
                  Stock: {isOutOfStock ? "Out of Stock" : product.stock}
                </p>
              </div>

              {product.sizes && product.sizes.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Size:</h4>
                  <div className="flex gap-2 flex-wrap">
                    {product.sizes.map((size) => (
                      <Button
                        key={size}
                        variant={selectedSize === size ? "default" : "outline"}
                        onClick={() => setSelectedSize(size)}
                        size="sm"
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {product.colors && product.colors.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Color:</h4>
                  <div className="flex gap-2 flex-wrap">
                    {product.colors.map((color) => (
                      <Button
                        key={color}
                        variant={selectedColor === color ? "default" : "outline"}
                        onClick={() => setSelectedColor(color)}
                        size="sm"
                      >
                        {color}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex items-center gap-4">
                <div className="flex items-center border rounded-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity((prev) => Math.min(maxQuantity, prev + 1))}
                    disabled={quantity >= maxQuantity || isOutOfStock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button className="flex-1" onClick={handleAddToCart} disabled={isOutOfStock}>
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                </Button>
              </div>
            </div>

            <Tabs defaultValue="details" className="w-full mt-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="care">Care & Materials</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="mt-4 text-gray-700 text-sm leading-relaxed">
                <h4 className="font-semibold mb-2">Product Description:</h4>
                <p>{product.detailedDescription || product.description}</p>
                {product.features && product.features.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Features:</h4>
                    <ul className="list-disc list-inside">
                      {product.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {product.specifications && Object.keys(product.specifications).length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Specifications:</h4>
                    <ul className="list-disc list-inside">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <li key={key}>
                          <strong>{key}:</strong> {value}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="care" className="mt-4 text-gray-700 text-sm leading-relaxed">
                {product.materials && product.materials.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Materials:</h4>
                    <ul className="list-disc list-inside">
                      {product.materials.map((material, index) => (
                        <li key={index}>{material}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {product.careInstructions && product.careInstructions.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Care Instructions:</h4>
                    <ul className="list-disc list-inside">
                      {product.careInstructions.map((instruction, index) => (
                        <li key={index}>{instruction}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {(!product.materials || product.materials.length === 0) &&
                  (!product.careInstructions || product.careInstructions.length === 0) && (
                    <p>No specific care or material information available.</p>
                  )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
