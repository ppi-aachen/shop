"use client"

import type React from "react"

import { useState, useEffect, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/cart-context"
import { getProductImage, getProductStock } from "@/lib/utils"
import { submitPOSOrder } from "@/app/checkout/actions"
import { useToast } from "@/hooks/use-toast"
import { LoadingOverlay } from "@/components/loading-overlay" // Corrected import

// Mock product data (replace with actual data fetching)
const products = [
  {
    id: "1",
    name: "Vintage Leather Jacket",
    description: "A classic leather jacket with a timeless design.",
    price: 120.0,
    images: [
      "/vintage-leather-jacket.png",
      "/vintage-leather-jacket-front.png",
      "/vintage-leather-jacket-back.png",
      "/vintage-leather-jacket-detail.png",
    ],
    variants: [
      { id: "1-S-Black", size: "S", color: "Black", stock: 5 },
      { id: "1-M-Black", size: "M", color: "Black", stock: 8 },
      { id: "1-L-Black", size: "L", color: "Black", stock: 3 },
      { id: "1-S-Brown", size: "S", color: "Brown", stock: 2 },
      { id: "1-M-Brown", size: "M", color: "Brown", stock: 6 },
    ],
  },
  {
    id: "2",
    name: "Cozy Knit Sweater",
    description: "Soft and warm, perfect for chilly evenings.",
    price: 65.0,
    images: ["/cozy-knit-sweater.png", "/cozy-knit-sweater-front.png"],
    variants: [
      { id: "2-S-Red", size: "S", color: "Red", stock: 10 },
      { id: "2-M-Red", size: "M", color: "Red", stock: 12 },
      { id: "2-L-Red", size: "L", color: "Red", stock: 7 },
      { id: "2-S-Blue", size: "S", color: "Blue", stock: 5 },
      { id: "2-M-Blue", size: "M", color: "Blue", stock: 8 },
    ],
  },
  {
    id: "3",
    name: "Denim Jeans",
    description: "Durable and stylish, a wardrobe essential.",
    price: 80.0,
    images: ["/denim-jeans.png", "/denim-jeans-front.png", "/denim-jeans-back.png"],
    variants: [
      { id: "3-30-Blue", size: "30", color: "Blue", stock: 15 },
      { id: "3-32-Blue", size: "32", color: "Blue", stock: 20 },
      { id: "3-34-Blue", size: "34", color: "Blue", stock: 10 },
      { id: "3-30-Black", size: "30", color: "Black", stock: 8 },
      { id: "3-32-Black", size: "32", color: "Black", stock: 12 },
    ],
  },
  {
    id: "4",
    name: "Running Shoes",
    description: "Lightweight and comfortable for your daily runs.",
    price: 95.0,
    images: ["/running-shoes-on-track.png", "/running-shoes-side.png", "/running-shoes-top.png"],
    variants: [
      { id: "4-7-White", size: "7", color: "White", stock: 6 },
      { id: "4-8-White", size: "8", color: "White", stock: 9 },
      { id: "4-9-White", size: "9", color: "White", stock: 4 },
      { id: "4-7-Black", size: "7", color: "Black", stock: 3 },
      { id: "4-8-Black", color: "Black", stock: 7 },
    ],
  },
  {
    id: "5",
    name: "Classic T-Shirt",
    description: "A soft cotton t-shirt for everyday wear.",
    price: 25.0,
    images: ["/classic-t-shirt-front.png", "/folded-classic-tee.png"],
    variants: [
      { id: "5-S-White", size: "S", color: "White", stock: 20 },
      { id: "5-M-White", size: "M", color: "White", stock: 25 },
      { id: "5-L-White", size: "L", color: "White", stock: 18 },
      { id: "5-S-Black", size: "S", color: "Black", stock: 15 },
      { id: "5-M-Black", size: "M", color: "Black", stock: 22 },
    ],
  },
]

interface Product {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  variants: { id: string; size?: string; color?: string; stock: number }[]
}

interface CartItem {
  productId: string
  productName: string
  variantId: string
  size?: string
  color?: string
  price: number
  quantity: number
  image: string
}

function POSPageContent() {
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart } = useCart()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined)
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined)
  const [quantity, setQuantity] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [proofOfPayment, setProofOfPayment] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const searchParams = useSearchParams()
  const initialProductId = searchParams.get("productId")

  useEffect(() => {
    if (initialProductId) {
      const product = products.find((p) => p.id === initialProductId)
      if (product) {
        setSelectedProduct(product)
        setIsModalOpen(true)
      }
    }
  }, [initialProductId])

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [cart])

  const shippingCost = 5.0 // Example fixed shipping cost

  const total = useMemo(() => {
    return subtotal + shippingCost
  }, [subtotal, shippingCost])

  const handleAddToCart = () => {
    if (!selectedProduct) return

    const variant = selectedProduct.variants.find(
      (v) => (v.size === selectedSize || !v.size) && (v.color === selectedColor || !v.color),
    )

    if (!variant || variant.stock < quantity) {
      toast({
        title: "Error",
        description: "Selected variant is out of stock or quantity exceeds available stock.",
        variant: "destructive",
      })
      return
    }

    const itemToAdd: CartItem = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      variantId: variant.id,
      size: selectedSize,
      color: selectedColor,
      price: selectedProduct.price,
      quantity: quantity,
      image: getProductImage(selectedProduct.id),
    }
    addToCart(itemToAdd)
    setIsModalOpen(false)
    setSelectedSize(undefined)
    setSelectedColor(undefined)
    setQuantity(1)
    toast({
      title: "Success",
      description: `${quantity} x ${selectedProduct.name} added to cart.`,
    })
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setProofOfPayment(event.target.files[0])
    }
  }

  const handleSubmitOrder = async (event: React.FormEvent) => {
    event.preventDefault()
    if (cart.length === 0) {
      toast({
        title: "Error",
        description: "Your cart is empty.",
        variant: "destructive",
      })
      return
    }
    if (!proofOfPayment) {
      toast({
        title: "Error",
        description: "Please upload proof of payment.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("customerName", customerName)
      formData.append("customerEmail", customerEmail)
      formData.append("customerPhone", customerPhone)
      formData.append("deliveryAddress", deliveryAddress)
      formData.append("proofOfPayment", proofOfPayment)
      formData.append("cartItems", JSON.stringify(cart))
      formData.append("totalAmount", total.toFixed(2))

      const result = await submitPOSOrder(formData)

      if (result.success) {
        toast({
          title: "Order Submitted",
          description: "Your order has been successfully placed and proof of payment uploaded.",
        })
        clearCart()
        setCustomerName("")
        setCustomerEmail("")
        setCustomerPhone("")
        setDeliveryAddress("")
        setProofOfPayment(null)
      } else {
        toast({
          title: "Submission Failed",
          description: result.error || "There was an error submitting your order.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting order:", error)
      toast({
        title: "Submission Failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const availableSizes = useMemo(() => {
    if (!selectedProduct) return []
    const sizes = new Set<string>()
    selectedProduct.variants.forEach((v) => {
      if (v.size) sizes.add(v.size)
    })
    return Array.from(sizes)
  }, [selectedProduct])

  const availableColors = useMemo(() => {
    if (!selectedProduct) return []
    const colors = new Set<string>()
    selectedProduct.variants.forEach((v) => {
      if (v.color) colors.add(v.color)
    })
    return Array.from(colors)
  }, [selectedProduct])

  const currentStock = useMemo(() => {
    if (!selectedProduct) return 0
    return getProductStock(selectedProduct, selectedSize, selectedColor)
  }, [selectedProduct, selectedSize, selectedColor])

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100 p-4 gap-4">
      {isSubmitting && <LoadingOverlay />}

      {/* Product List */}
      <Card className="flex-1 p-4">
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <Card key={product.id} className="flex flex-col items-center text-center p-4">
              <Image
                src={getProductImage(product.id) || "/placeholder.svg"}
                alt={product.name}
                width={150}
                height={150}
                className="object-cover mb-2 rounded-md"
              />
              <h3 className="font-semibold text-lg">{product.name}</h3>
              <p className="text-gray-600">${product.price.toFixed(2)}</p>
              <Dialog open={isModalOpen && selectedProduct?.id === product.id} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="mt-2"
                    onClick={() => {
                      setSelectedProduct(product)
                      setSelectedSize(undefined)
                      setSelectedColor(undefined)
                      setQuantity(1)
                      setIsModalOpen(true)
                    }}
                  >
                    Select
                  </Button>
                </DialogTrigger>
                {selectedProduct && (
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>{selectedProduct.name}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Image
                        src={getProductImage(selectedProduct.id) || "/placeholder.svg"}
                        alt={selectedProduct.name}
                        width={200}
                        height={200}
                        className="object-cover mx-auto rounded-md"
                      />
                      <p className="text-gray-700">{selectedProduct.description}</p>
                      <p className="text-2xl font-bold">${selectedProduct.price.toFixed(2)}</p>

                      {availableSizes.length > 0 && (
                        <div>
                          <Label htmlFor="size">Size</Label>
                          <div className="flex gap-2 mt-1">
                            {availableSizes.map((size) => (
                              <Badge
                                key={size}
                                variant={selectedSize === size ? "default" : "outline"}
                                onClick={() => setSelectedSize(size)}
                                className="cursor-pointer"
                              >
                                {size}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {availableColors.length > 0 && (
                        <div>
                          <Label htmlFor="color">Color</Label>
                          <div className="flex gap-2 mt-1">
                            {availableColors.map((color) => (
                              <Badge
                                key={color}
                                variant={selectedColor === color ? "default" : "outline"}
                                onClick={() => setSelectedColor(color)}
                                className="cursor-pointer"
                              >
                                {color}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <Label htmlFor="quantity">Quantity (Stock: {currentStock})</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          max={currentStock}
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, Math.min(currentStock, Number(e.target.value))))}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <Button onClick={handleAddToCart} disabled={currentStock === 0 || quantity === 0}>
                      Add to Cart
                    </Button>
                  </DialogContent>
                )}
              </Dialog>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Cart and Checkout */}
      <Card className="w-full lg:w-1/3 p-4 flex flex-col">
        <CardHeader>
          <CardTitle>Cart</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto">
          {cart.length === 0 ? (
            <p className="text-gray-500">Cart is empty.</p>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.variantId} className="flex items-center gap-4 border-b pb-2">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.productName}
                    width={60}
                    height={60}
                    className="object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">{item.productName}</h4>
                    <p className="text-sm text-gray-600">
                      {item.size && `Size: ${item.size}`} {item.color && `Color: ${item.color}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      ${item.price.toFixed(2)} x {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </Button>
                    <span>{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                    >
                      +
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => removeFromCart(item.variantId)}>
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        <div className="mt-4 border-t pt-4">
          <div className="flex justify-between text-lg font-semibold">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold">
            <span>Shipping:</span>
            <span>${shippingCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold mt-2">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmitOrder} className="mt-4 space-y-4">
          <div>
            <Label htmlFor="customerName">Customer Name</Label>
            <Input id="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="customerEmail">Customer Email</Label>
            <Input
              id="customerEmail"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="customerPhone">Customer Phone</Label>
            <Input
              id="customerPhone"
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="deliveryAddress">Delivery Address</Label>
            <Textarea
              id="deliveryAddress"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="proofOfPayment">Proof of Payment (Image/PDF)</Label>
            <Input
              id="proofOfPayment"
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              required
            />
            {proofOfPayment && <p className="text-sm text-gray-500 mt-1">File selected: {proofOfPayment.name}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting || cart.length === 0 || !proofOfPayment}>
            {isSubmitting ? "Submitting Order..." : "Complete POS Order"}
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default function POSPage() {
  return (
    <Suspense fallback={<LoadingOverlay />}>
      <POSPageContent />
    </Suspense>
  )
}
