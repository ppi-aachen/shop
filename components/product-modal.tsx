"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Truck, Shield, RotateCcw, AlertTriangle } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { ImageGallery } from "@/components/image-gallery"
import { getProductImages } from "@/lib/image-utils"
import { useToast } from "@/hooks/use-toast"

interface ProductVariant {
  productId: number
  size?: string
  color?: string
  stock: number
  variantId: string
}

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
  variants?: ProductVariant[]
}

interface ProductModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [selectedColor, setSelectedColor] = useState<string>("")
  const { dispatch } = useCart()
  const { toast } = useToast()

  if (!product) return null

  const addToCart = () => {
    // Check for required options
    const requiresSize = product.sizes && product.sizes.length > 0
    const requiresColor = product.colors && product.colors.length > 0

    // Validate required selections
    if (requiresSize && !selectedSize) {
      toast({
        variant: "warning",
        title: "Size Required",
        description: "Please select a size before adding to cart.",
      })
      return
    }

    if (requiresColor && !selectedColor) {
      toast({
        variant: "warning",
        title: "Color Required",
        description: "Please select a color before adding to cart.",
      })
      return
    }

    // Check if the specific variant is in stock
    const variantStock = product.variants 
      ? product.variants.find((v: ProductVariant) => {
          // Handle both cases: when size/color are selected and when they're not
          const sizeMatch = requiresSize ? v.size === selectedSize : (v.size === undefined || v.size === null || v.size === "")
          const colorMatch = requiresColor ? v.color === selectedColor : (v.color === undefined || v.color === null || v.color === "")
          return sizeMatch && colorMatch
        })?.stock || 0
      : product.stock

    if (variantStock <= 0) {
      toast({
        variant: "destructive",
        title: "Out of Stock",
        description: `This variant (${selectedSize || 'No size'}${selectedColor ? `, ${selectedColor}` : ''}) is currently out of stock.`,
      })
      return
    }

    dispatch({
      type: "ADD_ITEM",
      payload: {
        ...product,
        selectedSize,
        selectedColor,
      },
    })

    toast({
      variant: "success",
      title: "Added to Cart!",
      description: `${product.name}${selectedSize ? ` (Size: ${selectedSize})` : ""}${selectedColor ? ` (Color: ${selectedColor})` : ""} has been added to your cart.`,
    })

    // Reset selections and close modal
    setSelectedSize("")
    setSelectedColor("")
    onClose()
  }

  // Use multiple images if available, otherwise fall back to single image
  const productImages =
    product.images && product.images.length > 0 ? getProductImages(product.images) : getProductImages([product.image])

  // Check if all required options are selected
  const requiresSize = product.sizes && product.sizes.length > 0
  const requiresColor = product.colors && product.colors.length > 0
  const canAddToCart = (!requiresSize || selectedSize) && (!requiresColor || selectedColor) && product.stock > 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{product.name}</DialogTitle>
          <Button variant="ghost" size="sm" className="absolute right-4 top-4" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image Gallery */}
          <div className="space-y-4">
            <ImageGallery images={productImages} productName={product.name} className="lg:sticky lg:top-4" />
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <p className="text-3xl font-bold text-green-600">€{product.price.toFixed(2)}</p>
              <p className="text-gray-600 mt-2">{product.description}</p>
            </div>

            {/* Detailed Description */}
            {product.detailedDescription && (
              <div>
                <h3 className="font-semibold text-lg mb-2">About This Product</h3>
                <p className="text-gray-700 leading-relaxed">{product.detailedDescription}</p>
              </div>
            )}

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Features</h3>
                <ul className="space-y-1">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-gray-700">
                      <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Size Selection */}
            {requiresSize && (
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Size <span className="text-red-500">*</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes!.map((size) => {
                    const sizeStock = product.variants 
                      ? product.variants.find((v: ProductVariant) => {
                          // Handle both cases: when color is selected and when it's not
                          if (requiresColor && selectedColor) {
                            // Color is required and selected - match both size and color
                            return v.size === size && v.color === selectedColor
                          } else {
                            // No color required or not selected - match only size (color should be undefined/null)
                            return v.size === size && (v.color === undefined || v.color === null || v.color === "")
                          }
                        })?.stock || 0
                      : product.stock
                    const isOutOfStock = sizeStock <= 0
                    
                    return (
                      <Button
                        key={size}
                        variant={selectedSize === size ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedSize(size)}
                        className={`${selectedSize === size ? "bg-green-600 hover:bg-green-700" : ""} ${isOutOfStock ? "opacity-50 cursor-not-allowed" : ""}`}
                        disabled={isOutOfStock}
                      >
                        {size}
                        {product.variants && (
                          <span className="ml-1 text-xs">
                            ({sizeStock})
                          </span>
                        )}
                      </Button>
                    )
                  })}
                </div>
                {!selectedSize && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <p className="text-sm text-red-700 font-medium">Please select a size to continue</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Color Selection */}
            {requiresColor && (
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Color <span className="text-red-500">*</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors!.map((color) => {
                    const colorStock = product.variants 
                      ? product.variants.find((v: ProductVariant) => {
                          // Handle both cases: when size is selected and when it's not
                          if (requiresSize && selectedSize) {
                            // Size is required and selected - match both size and color
                            return v.size === selectedSize && v.color === color
                          } else {
                            // No size required or not selected - match only color (size should be undefined/null)
                            return (v.size === undefined || v.size === null || v.size === "") && v.color === color
                          }
                        })?.stock || 0
                      : product.stock
                    const isOutOfStock = colorStock <= 0
                    
                    return (
                      <Button
                        key={color}
                        variant={selectedColor === color ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedColor(color)}
                        className={`${selectedColor === color ? "bg-green-600 hover:bg-green-700" : ""} ${isOutOfStock ? "opacity-50 cursor-not-allowed" : ""}`}
                        disabled={isOutOfStock}
                      >
                        {color}
                        {product.variants && (
                          <span className="ml-1 text-xs">
                            ({colorStock})
                          </span>
                        )}
                      </Button>
                    )
                  })}
                </div>
                {!selectedColor && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <p className="text-sm text-red-700 font-medium">Please select a color to continue</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Stock Information */}
            {product.variants && ((requiresSize && selectedSize) || !requiresSize) && ((requiresColor && selectedColor) || !requiresColor) && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  <p className="text-sm text-blue-700 font-medium">
                    Stock: {product.variants.find((v: ProductVariant) => {
                      // Handle both cases: when size/color are selected and when they're not
                      const sizeMatch = requiresSize ? v.size === selectedSize : (v.size === undefined || v.size === null || v.size === "")
                      const colorMatch = requiresColor ? v.color === selectedColor : (v.color === undefined || v.color === null || v.color === "")
                      return sizeMatch && colorMatch
                    })?.stock || 0} available
                  </p>
                </div>
              </div>
            )}

            {/* Materials */}
            {product.materials && product.materials.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Materials</h3>
                <div className="flex flex-wrap gap-2">
                  {product.materials.map((material, index) => (
                    <Badge key={index} variant="secondary">
                      {material}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Specifications</h3>
                <div className="space-y-2">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600">{key}:</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Care Instructions */}
            {product.careInstructions && product.careInstructions.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Care Instructions</h3>
                <ul className="space-y-1">
                  {product.careInstructions.map((instruction, index) => (
                    <li key={index} className="flex items-center gap-2 text-gray-700 text-sm">
                      <div className="w-1 h-1 bg-gray-400 rounded-full" />
                      {instruction}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Product Benefits */}
            <div className="grid grid-cols-1 gap-3 pt-4 border-t">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Truck className="h-4 w-4 text-green-600" />
                <span>Free pickup in Aachen or delivery available</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Quality guarantee</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <RotateCcw className="h-4 w-4 text-green-600" />
                <span>30-day return policy</span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button onClick={addToCart} className="w-full" size="lg" disabled={!canAddToCart || product.stock === 0}>
              <Plus className="h-4 w-4 mr-2" />
              {product.stock > 0 ? `Add to Cart - €${product.price.toFixed(2)}` : "Out of Stock"}
            </Button>
          </div>
        </div>
        <div className="h-4" />
        <div className="h-4" />
      </DialogContent>
    </Dialog>
  )
}
