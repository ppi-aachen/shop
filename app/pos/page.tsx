"use client"

import type React from "react"

import { useState, useEffect, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ProductModal } from "@/components/product-modal"
import { useCart, type CartItem } from "@/lib/cart-context"
import { Package, Minus, Plus, Trash2, Search, X, ShoppingBag, MapPin, Truck } from "lucide-react"
import { getProductImage } from "@/lib/image-utils"
import { submitPOSOrder } from "@/app/checkout/actions"
import { useToast } from "@/hooks/use-toast"
import { LoadingOverlay } from "@/components/loading-overlay" // Corrected import
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// Mock product data (replace with actual data fetching)
const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "Vintage Leather Jacket",
    description: "Classic leather jacket with a distressed finish.",
    price: 120.0,
    image: "/vintage-leather-jacket.png",
    images: [
      "/vintage-leather-jacket-front.png",
      "/vintage-leather-jacket-back.png",
      "/vintage-leather-jacket-detail.png",
    ],
    stock: 10,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Brown"],
    variants: [
      { id: "1-S-Black", size: "S", color: "Black", stock: 3 },
      { id: "1-M-Black", size: "M", color: "Black", stock: 2 },
      { id: "1-L-Black", size: "L", color: "Black", stock: 1 },
      { id: "1-XL-Black", size: "XL", color: "Black", stock: 0 }, // Out of stock
      { id: "1-S-Brown", size: "S", color: "Brown", stock: 2 },
      { id: "1-M-Brown", size: "M", color: "Brown", stock: 1 },
      { id: "1-L-Brown", size: "L", color: "Brown", stock: 1 },
      { id: "1-XL-Brown", size: "XL", color: "Brown", stock: 0 }, // Out of stock
    ],
  },
  {
    id: 2,
    name: "Cozy Knit Sweater",
    description: "Soft and warm sweater, perfect for winter.",
    price: 55.0,
    image: "/cozy-knit-sweater.png",
    images: ["/cozy-knit-sweater-front.png", "/cozy-knit-sweater.png"],
    stock: 15,
    sizes: ["XS", "S", "M", "L"],
    colors: ["Cream", "Grey", "Navy"],
    variants: [
      { id: "2-XS-Cream", size: "XS", color: "Cream", stock: 4 },
      { id: "2-S-Cream", size: "S", color: "Cream", stock: 3 },
      { id: "2-M-Cream", size: "M", color: "Cream", stock: 2 },
      { id: "2-L-Cream", size: "L", color: "Cream", stock: 1 },
      { id: "2-XS-Grey", size: "XS", color: "Grey", stock: 3 },
      { id: "2-S-Grey", size: "S", color: "Grey", stock: 2 },
      { id: "2-M-Grey", size: "M", color: "Grey", stock: 1 },
      { id: "2-L-Grey", size: "L", color: "Grey", stock: 0 },
      { id: "2-XS-Navy", size: "XS", color: "Navy", stock: 2 },
      { id: "2-S-Navy", size: "S", color: "Navy", stock: 1 },
      { id: "2-M-Navy", size: "M", color: "Navy", stock: 0 },
      { id: "2-L-Navy", size: "L", color: "Navy", stock: 0 },
    ],
  },
  {
    id: 3,
    name: "Denim Jeans",
    description: "Comfortable slim-fit denim jeans.",
    price: 75.0,
    image: "/denim-jeans.png",
    images: ["/denim-jeans-front.png", "/denim-jeans-back.png"],
    stock: 20,
    sizes: ["28", "30", "32", "34", "36"],
    colors: ["Blue", "Black"],
    variants: [
      { id: "3-28-Blue", size: "28", color: "Blue", stock: 5 },
      { id: "3-30-Blue", size: "30", color: "Blue", stock: 4 },
      { id: "3-32-Blue", size: "32", color: "Blue", stock: 3 },
      { id: "3-34-Blue", size: "34", color: "Blue", stock: 2 },
      { id: "3-36-Blue", size: "36", color: "Blue", stock: 1 },
      { id: "3-28-Black", size: "28", color: "Black", stock: 3 },
      { id: "3-30-Black", size: "30", color: "Black", stock: 2 },
      { id: "3-32-Black", size: "32", color: "Black", stock: 1 },
      { id: "3-34-Black", size: "34", color: "Black", stock: 0 },
      { id: "3-36-Black", size: "36", color: "Black", stock: 0 },
    ],
  },
  {
    id: 4,
    name: "Running Shoes",
    description: "Lightweight and breathable running shoes.",
    price: 90.0,
    image: "/running-shoes-on-track.png",
    images: ["/running-shoes-side.png", "/running-shoes-top.png"],
    stock: 8,
    sizes: ["US 7", "US 8", "US 9", "US 10", "US 11"],
    colors: ["White", "Black", "Red"],
    variants: [
      { id: "4-US 7-White", size: "US 7", color: "White", stock: 2 },
      { id: "4-US 8-White", size: "US 8", color: "White", stock: 1 },
      { id: "4-US 9-White", size: "US 9", color: "White", stock: 1 },
      { id: "4-US 10-White", size: "US 10", color: "White", stock: 0 },
      { id: "4-US 11-White", size: "US 11", color: "White", stock: 0 },
      { id: "4-US 7-Black", size: "US 7", color: "Black", stock: 1 },
      { id: "4-US 8-Black", size: "US 8", color: "Black", stock: 1 },
      { id: "4-US 9-Black", size: "US 9", color: "Black", stock: 1 },
      { id: "4-US 10-Black", size: "US 10", color: "Black", stock: 0 },
      { id: "4-US 11-Black", size: "US 11", color: "Black", stock: 0 },
      { id: "4-US 7-Red", size: "US 7", color: "Red", stock: 1 },
      { id: "4-US 8-Red", size: "US 8", color: "Red", stock: 0 },
      { id: "4-US 9-Red", size: "US 9", color: "Red", stock: 0 },
      { id: "4-US 10-Red", size: "US 10", color: "Red", stock: 0 },
      { id: "4-US 11-Red", size: "US 11", color: "Red", stock: 0 },
    ],
  },
  {
    id: 5,
    name: "Classic T-Shirt",
    description: "Soft cotton t-shirt for everyday wear.",
    price: 25.0,
    image: "/placeholder-ludvj.png",
    images: ["/classic-t-shirt-front.png", "/folded-classic-tee.png"],
    stock: 30,
    sizes: ["S", "M", "L", "XL"],
    colors: ["White", "Black", "Grey", "Blue"],
    variants: [
      { id: "5-S-White", size: "S", color: "White", stock: 8 },
      { id: "5-M-White", size: "M", color: "White", stock: 7 },
      { id: "5-L-White", size: "L", color: "White", stock: 6 },
      { id: "5-XL-White", size: "XL", color: "White", stock: 5 },
      { id: "5-S-Black", size: "S", color: "Black", stock: 7 },
      { id: "5-M-Black", color: "Black", stock: 6 },
      { id: "5-L-Black", size: "L", color: "Black", stock: 5 },
      { id: "5-XL-Black", size: "XL", color: "Black", stock: 4 },
      { id: "5-S-Grey", size: "S", color: "Grey", stock: 6 },
      { id: "5-M-Grey", size: "M", color: "Grey", stock: 5 },
      { id: "5-L-Grey", size: "L", color: "Grey", stock: 4 },
      { id: "5-XL-Grey", size: "XL", color: "Grey", stock: 3 },
      { id: "5-S-Blue", size: "S", color: "Blue", stock: 5 },
      { id: "5-M-Blue", size: "M", color: "Blue", stock: 4 },
      { id: "5-L-Blue", size: "L", color: "Blue", stock: 3 },
      { id: "5-XL-Blue", size: "XL", color: "Blue", stock: 2 },
    ],
  },
]

// Wrap the main component with Suspense to handle useSearchParams
export default function POSPageWrapper() {
  return (
    <Suspense fallback={<LoadingOverlay message="Loading POS..." />}>
      <POSPage />
    </Suspense>
  )
}

function POSPage() {
  const { state: cartState, dispatch: cartDispatch } = useCart()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customerName, setCustomerName] = useState("")
  const [customerContact, setCustomerContact] = useState("")
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [proofOfPayment, setProofOfPayment] = useState<File | null>(null)
  const [proofOfPaymentPreview, setProofOfPaymentPreview] = useState<string | null>(null)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const { toast } = useToast()
  const searchParams = useSearchParams()

  useEffect(() => {
    const productId = searchParams.get("productId")
    if (productId) {
      const product = MOCK_PRODUCTS.find((p) => p.id === Number(productId))
      if (product) {
        setSelectedProduct(product)
        setIsProductModalOpen(true)
      }
    }
  }, [searchParams])

  const filteredProducts = useMemo(() => {
    if (!searchTerm) {
      return MOCK_PRODUCTS
    }
    return MOCK_PRODUCTS.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [searchTerm])

  const handleProductClick = (product: any) => {
    setSelectedProduct(product)
    setIsProductModalOpen(true)
  }

  const handleAddToCart = (item: CartItem) => {
    cartDispatch({ type: "ADD_ITEM", payload: item })
    setIsProductModalOpen(false)
    toast({
      title: "Added to Cart",
      description: `${item.name} added to the POS cart.`,
    })
  }

  const updateQuantity = (index: number, quantity: number) => {
    cartDispatch({ type: "UPDATE_QUANTITY", payload: { id: index, quantity } })
  }

  const removeItem = (index: number) => {
    cartDispatch({ type: "REMOVE_ITEM", payload: index })
    toast({
      title: "Item Removed",
      description: "Product removed from the POS cart.",
      variant: "destructive",
    })
  }

  const handleProofOfPaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProofOfPayment(file)
      setProofOfPaymentPreview(URL.createObjectURL(file))
      setPaymentError(null)
    } else {
      setProofOfPayment(null)
      setProofOfPaymentPreview(null)
    }
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()

    if (cartState.items.length === 0) {
      toast({
        title: "Cart Empty",
        description: "Please add items to the cart before submitting an order.",
        variant: "destructive",
      })
      return
    }

    if (!proofOfPayment) {
      setPaymentError("Proof of payment is required.")
      return
    }

    setIsSubmitting(true)
    setPaymentError(null)

    try {
      const formData = new FormData()
      formData.append("customerName", customerName)
      formData.append("customerContact", customerContact)
      formData.append("deliveryAddress", deliveryAddress)
      formData.append("proofOfPayment", proofOfPayment)
      formData.append("cartItems", JSON.stringify(cartState.items))
      formData.append("totalAmount", cartState.finalTotal.toFixed(2))
      formData.append("deliveryMethod", cartState.deliveryMethod)
      formData.append("shippingCost", cartState.shippingCost.toFixed(2))
      formData.append("itemCount", cartState.itemCount.toString())

      const result = await submitPOSOrder(formData)

      if (result.success) {
        toast({
          title: "Order Submitted",
          description: "The order has been successfully submitted and proof of payment uploaded.",
        })
        cartDispatch({ type: "CLEAR_CART" })
        setCustomerName("")
        setCustomerContact("")
        setDeliveryAddress("")
        setProofOfPayment(null)
        setProofOfPaymentPreview(null)
      } else {
        toast({
          title: "Submission Failed",
          description: result.error || "There was an error submitting the order.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting POS order:", error)
      toast({
        title: "Submission Error",
        description: "An unexpected error occurred during order submission.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const setDeliveryMethod = (method: "pickup" | "delivery") => {
    cartDispatch({ type: "SET_DELIVERY_METHOD", payload: method })
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {isSubmitting && <LoadingOverlay message="Submitting Order..." />}
      <header className="bg-white border-b p-4 flex items-center justify-between shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">POS System</h1>
        <Button variant="outline" onClick={() => cartDispatch({ type: "CLEAR_CART" })}>
          <Trash2 className="h-4 w-4 mr-2" />
          Clear Cart
        </Button>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Product List */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-4 flex flex-col">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search products..."
              className="pl-10 pr-4 py-2 w-full rounded-md border"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:bg-gray-100"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 overflow-y-auto flex-1 pr-2">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500">No products found.</div>
            ) : (
              filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="cursor-pointer hover:shadow-md transition-shadow flex flex-col"
                  onClick={() => handleProductClick(product)}
                >
                  <CardContent className="p-3 flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center mb-2 overflow-hidden">
                      <img
                        src={getProductImage(product.image) || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = "none"
                          const parent = target.parentElement
                          if (parent) {
                            const iconDiv = document.createElement("div")
                            iconDiv.className = "flex items-center justify-center w-full h-full"
                            iconDiv.innerHTML =
                              '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="text-gray-400"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="M10 4v4"></path><path d="M2 8h20"></path><path d="M6 12h.01"></path><path d="M6 16h.01"></path><path d="M10 12h8"></path><path d="M10 16h8"></path></svg>'
                            parent.appendChild(iconDiv)
                          }
                        }}
                      />
                    </div>
                    <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
                    <p className="text-green-600 font-bold mt-1">€{product.price.toFixed(2)}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Cart and Checkout */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-sm p-4 flex flex-col">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-xl font-bold">Current Order</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-y-auto pr-2">
            {cartState.items.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingBag className="h-12 w-12 mx-auto mb-2" />
                <p>Cart is empty</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cartState.items.map((item, index) => (
                  <div
                    key={`${item.id}-${item.selectedSize}-${item.selectedColor}-${index}`}
                    className="flex items-center gap-3 border-b pb-3 last:border-b-0"
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center border overflow-hidden shrink-0">
                      {item.image ? (
                        <img
                          src={getProductImage(item.image) || "/placeholder.svg"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = "none"
                            const parent = target.parentElement
                            if (parent) {
                              const iconDiv = document.createElement("div")
                              iconDiv.className = "flex items-center justify-center w-full h-full"
                              iconDiv.innerHTML =
                                '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="text-gray-400"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="M10 4v4"></path><path d="M2 8h20"></path><path d="M6 12h.01"></path><path d="M6 16h.01"></path><path d="M10 12h8"></path><path d="M10 16h8"></path></svg>'
                              parent.appendChild(iconDiv)
                            }
                          }}
                        />
                      ) : (
                        <Package className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{item.name}</h3>
                      <p className="text-xs text-gray-600">
                        {item.selectedSize && `Size: ${item.selectedSize}`}
                        {item.selectedColor && ` Color: ${item.selectedColor}`}
                      </p>
                      <p className="font-semibold text-green-600">€{item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6 bg-transparent"
                        onClick={() => updateQuantity(index, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(index, Number.parseInt(e.target.value) || 0)}
                        className="w-10 h-6 text-center text-xs p-0"
                        min="0"
                        max={item.variantStock ?? item.stock}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6 bg-transparent"
                        onClick={() => updateQuantity(index, item.quantity + 1)}
                        disabled={item.quantity >= (item.variantStock ?? item.stock)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-500"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>

          <div className="border-t pt-4 mt-4">
            <form onSubmit={handleSubmitOrder} className="space-y-4">
              {/* Delivery Method Selection */}
              <div>
                <Label className="text-base font-medium">Delivery Method</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="pos-pickup"
                      name="pos-delivery"
                      checked={cartState.deliveryMethod === "pickup"}
                      onChange={() => setDeliveryMethod("pickup")}
                      className="text-green-600"
                    />
                    <label htmlFor="pos-pickup" className="flex items-center gap-2 cursor-pointer">
                      <MapPin className="h-4 w-4" />
                      <span>Pickup in Aachen (Free)</span>
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="pos-delivery"
                      name="pos-delivery"
                      checked={cartState.deliveryMethod === "delivery"}
                      onChange={() => setDeliveryMethod("delivery")}
                      className="text-green-600"
                    />
                    <label htmlFor="pos-delivery" className="flex items-center gap-2 cursor-pointer">
                      <Truck className="h-4 w-4" />
                      <span>Delivery</span>
                    </label>
                  </div>
                </div>

                {cartState.deliveryMethod === "delivery" && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm">
                    <p className="font-medium text-blue-900">Delivery Pricing:</p>
                    <p className="text-blue-800">1-3 items: €6.19</p>
                    <p className="text-blue-800">4-7 items: €7.69</p>
                    <p className="text-blue-800">8+ items: €10.49</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Items ({cartState.itemCount})</span>
                  <span>€{cartState.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{cartState.deliveryMethod === "pickup" ? "Pickup" : "Delivery"}</span>
                  <span>€{cartState.shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>€{cartState.finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <h3 className="text-lg font-semibold mt-6 mb-4">Customer Details</h3>
              <Input
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
              <Input
                type="email"
                placeholder="Customer Contact (Email or Phone)"
                value={customerContact}
                onChange={(e) => setCustomerContact(e.target.value)}
                required
              />
              <Textarea
                placeholder="Delivery Address (if applicable)"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                rows={3}
              />

              <h3 className="text-lg font-semibold mt-6 mb-4">Proof of Payment</h3>
              <Input type="file" accept="image/*,application/pdf" onChange={handleProofOfPaymentChange} required />
              {proofOfPaymentPreview && (
                <div className="mt-2">
                  {proofOfPayment?.type.startsWith("image/") ? (
                    <img
                      src={proofOfPaymentPreview || "/placeholder.svg"}
                      alt="Proof of Payment Preview"
                      className="max-w-full h-auto max-h-48 object-contain border rounded-md"
                    />
                  ) : (
                    <p className="text-sm text-gray-600">PDF selected: {proofOfPayment.name}</p>
                  )}
                </div>
              )}
              {paymentError && <p className="text-red-500 text-sm mt-1">{paymentError}</p>}

              <Button
                type="submit"
                className="w-full mt-4"
                size="lg"
                disabled={isSubmitting || cartState.items.length === 0 || !proofOfPayment}
              >
                {isSubmitting ? "Submitting Order..." : "Submit Order"}
              </Button>
            </form>
          </div>
        </div>
      </main>

      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent className="sm:max-w-[600px] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Product Details</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <ProductModal
              product={selectedProduct}
              onAddToCart={handleAddToCart}
              onClose={() => setIsProductModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
