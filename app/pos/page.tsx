"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { POSHeader } from "@/components/pos-header"
import { LoadingOverlay } from "@/components/loading-overlay"
import { Plus, Minus, Trash2, ShoppingCart, FileText, Check } from "lucide-react"
import { getProductImage } from "@/lib/image-utils"
import { useToast } from "@/hooks/use-toast"
import { getProductsFromGoogleSheet, submitPOSOrder } from "@/app/checkout/actions"

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
  discount?: number // NEW: Discount percentage
  variants?: ProductVariant[]
}

interface CartItem extends Product {
  quantity: number
  selectedSize?: string
  selectedColor?: string
  variantStock?: number
}

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [errorLoadingProducts, setErrorLoadingProducts] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [customerContact, setCustomerContact] = useState("")
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [proofOfPayment, setProofOfPayment] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [completedOrderId, setCompletedOrderId] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true)
      setErrorLoadingProducts(false)
      try {
        const fetchedProducts = await getProductsFromGoogleSheet()
        setProducts(fetchedProducts)
      } catch (error) {
        console.error("Could not fetch products from Google Sheet:", error)
        setErrorLoadingProducts(true)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load products from Google Sheet. Please check your configuration.",
        })
      } finally {
        setLoadingProducts(false)
      }
    }

    fetchProducts()
  }, [toast])

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const addToCart = (product: Product, selectedSize?: string, selectedColor?: string) => {
    // Calculate discounted price
    const originalPrice = product.price
    const discountedPrice =
      product.discount && product.discount > 0 ? originalPrice * (1 - product.discount / 100) : originalPrice

    const existingItemIndex = cart.findIndex(
      (item) => item.id === product.id && item.selectedSize === selectedSize && item.selectedColor === selectedColor,
    )

    if (existingItemIndex >= 0) {
      const updatedCart = [...cart]
      updatedCart[existingItemIndex].quantity += 1
      setCart(updatedCart)
    } else {
      const newItem: CartItem = {
        ...product,
        price: discountedPrice, // Use discounted price
        quantity: 1,
        selectedSize,
        selectedColor,
      }
      setCart([...cart, newItem])
    }

    toast({
      variant: "success",
      title: "Added to Cart",
      description: `${product.name} added to cart`,
    })
  }

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(index)
      return
    }

    const updatedCart = [...cart]
    updatedCart[index].quantity = newQuantity
    setCart(updatedCart)
  }

  const removeFromCart = (index: number) => {
    const updatedCart = cart.filter((_, i) => i !== index)
    setCart(updatedCart)
  }

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProofOfPayment(file)
    }
  }

  const handleSubmitOrder = async () => {
    if (!customerName || !customerContact || !deliveryAddress || !proofOfPayment || cart.length === 0) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all customer details, add items to cart, and upload proof of payment.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("customerName", customerName)
      formData.append("customerContact", customerContact)
      formData.append("deliveryAddress", deliveryAddress)
      formData.append("cartItems", JSON.stringify(cart))
      formData.append("totalAmount", calculateTotal().toString())
      formData.append("proofOfPayment", proofOfPayment)

      const result = await submitPOSOrder(formData)

      if (result.success) {
        toast({
          variant: "success",
          title: "Order Completed",
          description: result.message,
        })
        setOrderComplete(true)
        setCompletedOrderId(result.message.split(" ")[1]) // Extract order ID from message
        // Reset form
        setCart([])
        setCustomerName("")
        setCustomerContact("")
        setDeliveryAddress("")
        setProofOfPayment(null)
      } else {
        toast({
          variant: "destructive",
          title: "Order Failed",
          description: result.message,
        })
      }
    } catch (error) {
      console.error("Error submitting POS order:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit order. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const startNewOrder = () => {
    setOrderComplete(false)
    setCompletedOrderId("")
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50">
        <POSHeader />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <Card className="text-center p-8">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Completed Successfully!</h2>
              <p className="text-gray-600 mb-4">Order ID: {completedOrderId}</p>
              <p className="text-sm text-gray-500">
                The order has been recorded and the customer has been provided with their receipt.
              </p>
            </div>
            <Button onClick={startNewOrder} size="lg">
              Start New Order
            </Button>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <POSHeader />
      {isSubmitting && <LoadingOverlay message="Processing order..." />}

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Products Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {loadingProducts && <div className="text-center py-8 text-gray-600">Loading products...</div>}

                {errorLoadingProducts && (
                  <div className="text-center py-8 text-red-600">
                    Failed to load products. Please check your configuration.
                  </div>
                )}

                {!loadingProducts && !errorLoadingProducts && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                    {filteredProducts.map((product) => {
                      // Calculate discounted price for display
                      const originalPrice = product.price
                      const discountedPrice =
                        product.discount && product.discount > 0
                          ? originalPrice * (1 - product.discount / 100)
                          : originalPrice
                      const hasDiscount = product.discount && product.discount > 0

                      return (
                        <Card
                          key={product.id}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => addToCart(product)}
                        >
                          <CardContent className="p-4">
                            <div className="flex gap-3">
                              <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                  src={getProductImage(product.image) || "/placeholder.svg"}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.src = "/placeholder.svg"
                                  }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-sm mb-1 truncate">{product.name}</h3>
                                <p className="text-xs text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1">
                                    {hasDiscount ? (
                                      <>
                                        <span className="text-gray-500 text-xs line-through">
                                          €{originalPrice.toFixed(2)}
                                        </span>
                                        <span className="font-bold text-red-600 text-sm">
                                          €{discountedPrice.toFixed(2)}
                                        </span>
                                      </>
                                    ) : (
                                      <span className="font-bold text-green-600 text-sm">
                                        €{originalPrice.toFixed(2)}
                                      </span>
                                    )}
                                  </div>
                                  <Badge variant={product.stock > 0 ? "default" : "destructive"} className="text-xs">
                                    {product.stock > 0 ? "In Stock" : "Out"}
                                  </Badge>
                                </div>
                                {hasDiscount && (
                                  <Badge className="bg-red-100 text-red-800 text-xs mt-1">
                                    {product.discount}% OFF
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Cart and Customer Info Section */}
          <div className="space-y-6">
            {/* Cart */}
            <Card>
              <CardHeader>
                <CardTitle>Current Order</CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No items in cart</p>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item, index) => {
                      const hasDiscount = item.discount && item.discount > 0
                      const originalPrice = hasDiscount ? item.price / (1 - item.discount / 100) : item.price

                      return (
                        <div key={`${item.id}-${index}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                            <img
                              src={getProductImage(item.image) || "/placeholder.svg"}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = "/placeholder.svg"
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{item.name}</h4>
                            <div className="flex items-center gap-1">
                              {hasDiscount ? (
                                <>
                                  <span className="text-gray-500 text-xs line-through">
                                    €{originalPrice.toFixed(2)}
                                  </span>
                                  <span className="font-bold text-red-600 text-xs">€{item.price.toFixed(2)}</span>
                                </>
                              ) : (
                                <span className="font-bold text-green-600 text-xs">€{item.price.toFixed(2)}</span>
                              )}
                            </div>
                            {item.selectedSize && (
                              <Badge variant="outline" className="text-xs mt-1">
                                Size: {item.selectedSize}
                              </Badge>
                            )}
                            {item.selectedColor && (
                              <Badge variant="outline" className="text-xs mt-1 ml-1">
                                Color: {item.selectedColor}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(index, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(index, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                    <Separator />
                    <div className="flex justify-between items-center font-bold">
                      <span>Total:</span>
                      <span className="text-green-600">€{calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <Label htmlFor="customerContact">Contact (Email/Phone) *</Label>
                  <Input
                    id="customerContact"
                    value={customerContact}
                    onChange={(e) => setCustomerContact(e.target.value)}
                    placeholder="Enter email or phone"
                  />
                </div>
                <div>
                  <Label htmlFor="deliveryAddress">Delivery Address *</Label>
                  <Textarea
                    id="deliveryAddress"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter full delivery address"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Proof of Payment */}
            <Card>
              <CardHeader>
                <CardTitle>Proof of Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="proofOfPayment">Upload Receipt/Proof *</Label>
                    <Input
                      id="proofOfPayment"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="mt-1"
                    />
                  </div>
                  {proofOfPayment && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <FileText className="h-4 w-4" />
                      <span>{proofOfPayment.name}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Complete Order */}
            <Button
              onClick={handleSubmitOrder}
              disabled={
                !customerName ||
                !customerContact ||
                !deliveryAddress ||
                !proofOfPayment ||
                cart.length === 0 ||
                isSubmitting
              }
              className="w-full"
              size="lg"
            >
              {isSubmitting ? "Processing..." : `Complete Order - €${calculateTotal().toFixed(2)}`}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
