"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus, Minus, ShoppingCart } from "lucide-react"
import { ImageGallery } from "@/components/image-gallery"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"
import type { Product } from "@/lib/types"

interface ProductModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onAddToCart: (product: Product, quantity: number, selectedSize?: string, selectedColor?: string) => void
}

export function ProductModal({ product, isOpen, onClose, onAddToCart }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined)
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined)
  const { toast } = useToast()

  useEffect(() => {
    if (product) {
      setQuantity(1)
      // Reset selected options when product changes or modal opens
      setSelectedSize(product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined)
      setSelectedColor(product.colors && product.colors.length > 0 ? product.colors[0] : undefined)
    }
  }, [product])

  if (!product) return null

  const handleQuantityChange = (amount: number) => {
    setQuantity((prev) => {
      const newQty = prev + amount
      if (newQty < 1) return 1
      if (newQty > product.stock) {
        toast({
          variant: "destructive",
          title: "Out of Stock",
          description: `Only ${product.stock} available.`,
        })
        return product.stock
      }
      return newQty
    })
  }

  const handleAddToCartClick = () => {
    if (product.stock === 0) {
      toast({
        variant: "destructive",
        title: "Out of Stock",
        description: `${product.name} is currently out of stock.`,
      })
      return
    }

    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast({
        variant: "destructive",
        title: "Missing Option",
        description: "Please select a size.",
      })
      return
    }

    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast({
        variant: "destructive",
        title: "Missing Option",
        description: "Please select a color.",
      })
      return
    }

    onAddToCart(product, quantity, selectedSize, selectedColor)
  }

  const displayPrice = product.price * quantity

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">{product.name}</DialogTitle>
          <DialogDescription className="text-lg text-gray-600">{product.description}</DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-8 mt-4">
          {/* Image Gallery */}
          <div>
            <ImageGallery images={product.images || [product.image]} productName={product.name} />
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <p className="text-4xl font-extrabold text-green-700">{formatCurrency(displayPrice)}</p>
              <p className={`text-sm mt-1 ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                Stock: {product.stock > 0 ? `${product.stock} in stock` : "Out of Stock"}
              </p>
            </div>

            {/* Options */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h4 className="font-semibold text-lg mb-2">Size</h4>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      onClick={() => setSelectedSize(size)}
                      className={selectedSize === size ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {product.colors && product.colors.length > 0 && (
              <div>
                <h4 className="font-semibold text-lg mb-2">Color</h4>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <Button
                      key={color}
                      variant={selectedColor === color ? "default" : "outline"}
                      onClick={() => setSelectedColor(color)}
                      className={selectedColor === color ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                    >
                      {color}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={() => handleQuantityChange(-1)}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-xl font-semibold w-8 text-center">{quantity}</span>
              <Button variant="outline" size="icon" onClick={() => handleQuantityChange(1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Add to Cart Button */}
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6"
              onClick={handleAddToCartClick}
              disabled={
                product.stock === 0 ||
                (product.sizes && product.sizes.length > 0 && !selectedSize) ||
                (product.colors && product.colors.length > 0 && !selectedColor)
              }
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>

            <Separator />

            {/* Detailed Description */}
            {product.detailedDescription && (
              <div>
                <h4 className="font-semibold text-lg mb-2">Description</h4>
                <p className="text-gray-700 text-sm leading-relaxed">{product.detailedDescription}</p>
              </div>
            )}

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div>
                <h4 className="font-semibold text-lg mb-2">Features</h4>
                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div>
                <h4 className="font-semibold text-lg mb-2">Specifications</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-700 text-sm">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="font-medium">{key}:</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Materials */}
            {product.materials && product.materials.length > 0 && (
              <div>
                <h4 className="font-semibold text-lg mb-2">Materials</h4>
                <div className="flex flex-wrap gap-2">
                  {product.materials.map((material, index) => (
                    <Badge key={index} variant="secondary">
                      {material}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Care Instructions */}
            {product.careInstructions && product.careInstructions.length > 0 && (
              <div>
                <h4 className="font-semibold text-lg mb-2">Care Instructions</h4>
                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                  {product.careInstructions.map((instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
