"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus, Minus, X } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useToast } from "@/hooks/use-toast"
import { ImageGallery } from "@/components/image-gallery"

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
  stock: number // Added stock property
}

interface ProductModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [selectedColor, setSelectedColor] = useState<string>("")
  const { dispatch, state: cartState } = useCart() // Access cartState to check current quantity in cart
  const { toast } = useToast()
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (isOpen && product) {
      setQuantity(1) // Reset quantity when modal opens
      setSelectedSize(product.sizes && product.sizes.length > 0 ? product.sizes[0] : "")
      setSelectedColor(product.colors && product.colors.length > 0 ? product.colors[0] : "")
    }
  }, [isOpen, product])

  if (!product) return null

  // Find the item in the cart that matches the current product and selected options
  const currentCartItem = cartState.items.find(
    (item) => item.id === product.id && item.selectedSize === selectedSize && item.selectedColor === selectedColor,
  )
  const quantityInCart = currentCartItem ? currentCartItem.quantity : 0
  const availableStock = product.stock - quantityInCart

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      toast({
        variant: "destructive",
        title: "Out of Stock",
        description: `${product.name} is currently out of stock.`,
      })
      return
    }

    if (quantity > availableStock) {
      toast({
        variant: "destructive",
        title: "Insufficient Stock",
        description: `You can only add ${availableStock} more of ${product.name} to your cart.`,
      })
      return
    }

    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast({
        variant: "warning",
        title: "Size Required",
        description: "Please select a size for this product.",
      })
      return
    }
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast({
        variant: "warning",
        title: "Color Required",
        description: "Please select a color for this product.",
      })
      return
    }

    dispatch({
      type: "ADD_ITEM",
      payload: {
        ...product,
        quantity, // Pass the selected quantity
        selectedSize,
        selectedColor,
      },
    })
    toast({
      variant: "success",
      title: "Added to Cart!",
      description: `${quantity}x ${product.name} added to your cart.`,
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-6">
        <DialogHeader className="relative">
          <DialogTitle className="text-2xl font-bold">{product.name}</DialogTitle>
          <DialogDescription className="text-gray-600">{product.description}</DialogDescription>
          <Button variant="ghost" size="icon" className="absolute top-0 right-0" onClick={onClose}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-4">
          <div className="relative">
            <ImageGallery images={product.images || [product.image]} productName={product.name} />
          </div>

          <div>
            <p className="text-3xl font-bold text-green-600 mb-4">€{product.price.toFixed(2)}</p>

            <p className={`text-sm font-medium mb-4 ${product.stock > 0 ? "text-gray-500" : "text-red-500"}`}>
              Stock: {product.stock > 0 ? product.stock : "Out of Stock"}
            </p>

            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Size:</h4>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      onClick={() => setSelectedSize(size)}
                      className="min-w-[60px]"
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {product.colors && product.colors.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Color:</h4>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <Button
                      key={color}
                      variant={selectedColor === color ? "default" : "outline"}
                      onClick={() => setSelectedColor(color)}
                      className="min-w-[80px]"
                    >
                      {color}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4">
              <h4 className="font-semibold mb-2">Quantity:</h4>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={quantity <= 1 || product.stock <= 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity((prev) => Math.min(prev + 1, availableStock))}
                  disabled={quantity >= availableStock || product.stock <= 0}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {quantityInCart > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  ({quantityInCart} already in cart, {availableStock} available)
                </p>
              )}
            </div>

            <Button
              className="w-full py-3 text-lg"
              onClick={handleAddToCart}
              disabled={
                product.stock <= 0 ||
                quantity > availableStock ||
                (product.sizes && product.sizes.length > 0 && !selectedSize) ||
                (product.colors && product.colors.length > 0 && !selectedColor)
              }
            >
              {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
            </Button>

            <div className="mt-6">
              <h3 className="text-xl font-bold mb-2">Product Details</h3>
              <p className="text-gray-700 mb-4">{product.detailedDescription || product.description}</p>

              {product.features && product.features.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Features:</h4>
                  <ul className="list-disc list-inside text-gray-700">
                    {product.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}

              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Specifications:</h4>
                  <ul className="list-disc list-inside text-gray-700">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <li key={key}>
                        <strong>{key}:</strong> {value}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {product.materials && product.materials.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Materials:</h4>
                  <p className="text-gray-700">{product.materials.join(", ")}</p>
                </div>
              )}

              {product.careInstructions && product.careInstructions.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Care Instructions:</h4>
                  <ul className="list-disc list-inside text-gray-700">
                    {product.careInstructions.map((instruction, index) => (
                      <li key={index}>{instruction}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
