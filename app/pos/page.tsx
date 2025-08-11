"use client"

import type React from "react"

import { useState, useEffect, Suspense, useRef } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/cart-context"
import { Plus, Minus, Trash2, ShoppingCart, Search, Receipt, X, Upload, User, Phone, MapPin } from "lucide-react"
import { getProductImage } from "@/lib/image-utils"
import { useToast } from "@/hooks/use-toast"
import { getProductsFromGoogleSheet, submitPOSOrder } from "@/app/checkout/actions" // Changed import for POS action
import { formatStockDisplay } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

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
  variants?: {
    productId: number
    size?: string
    color?: string
    stock: number
    variantId: string
  }[]
}

export default function POSPage() {
  const { state, dispatch } = useCart()
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [errorLoadingProducts, setErrorLoadingProducts] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [quickAddId, setQuickAddId] = useState("")
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)

  // Customer details for checkout
  const [customerName, setCustomerName] = useState("")
  const [customerContact, setCustomerContact] = useState("")
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [proofOfPaymentFile, setProofOfPaymentFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)

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

  // Keyboard shortcuts for POS efficiency
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus search
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault()
        const searchInput = document.querySelector('input[placeholder*="Search products"]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        }
      }

      // Enter to complete sale when cart has items
      if (event.key === "Enter" && state.items.length > 0 && !showCheckoutModal) {
        event.preventDefault()
        handleCheckout()
      }

      // Escape to close modals
      if (event.key === "Escape" && (showCheckoutModal || selectedProduct)) {
        setShowCheckoutModal(false)
        setSelectedProduct(null)
        setSelectedSize(null)
        setSelectedColor(null)
      }
    }

    document.addEventListener("keydown", handleKeyPress)
    return () => document.removeEventListener("keydown", handleKeyPress)
  }, [state.items.length, showCheckoutModal, selectedProduct])

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id.toString().includes(searchTerm),
  )

  const getVariantStock = (product: Product, size: string | null, color: string | null) => {
    if (!product.variants || product.variants.length === 0) {
      return product.stock
    }

    // If both size and color are selected, find exact match
    if (size && color) {
      const exactMatch = product.variants.find((variant) => variant.size === size && variant.color === color)
      return exactMatch ? exactMatch.stock : 0
    }
    // If only size is selected, sum stock of all colors for that size
    else if (size) {
      return product.variants
        .filter((variant) => variant.size === size)
        .reduce((sum, variant) => sum + variant.stock, 0)
    }
    // If only color is selected, sum stock of all sizes for that color
    else if (color) {
      return product.variants
        .filter((variant) => variant.color === color)
        .reduce((sum, variant) => sum + variant.stock, 0)
    }
    // If no options selected, sum all variant stock or use base product stock
    return product.variants.reduce((sum, variant) => sum + variant.stock, 0)
  }

  const handleAddToCart = (product: Product) => {
    const requiresSize = product.sizes && product.sizes.length > 0
    const requiresColor = product.colors && product.colors.length > 0

    if (product.stock <= 0 && (!product.variants || product.variants.every((v) => v.stock <= 0))) {
      toast({
        variant: "destructive",
        title: "Out of Stock",
        description: `${product.name} is currently out of stock.`,
      })
      return
    }

    if (requiresSize || requiresColor) {
      setSelectedProduct(product)
      setSelectedSize(null)
      setSelectedColor(null)
      return // Open modal for options
    }

    // Add simple product directly
    dispatch({ type: "ADD_ITEM", payload: product })
    toast({
      variant: "success",
      title: "Added to Cart!",
      description: `${product.name} has been added to your cart.`,
    })
  }

  const handleAddVariantToCart = () => {
    if (!selectedProduct) return

    const requiresSize = selectedProduct.sizes && selectedProduct.sizes.length > 0
    const requiresColor = selectedProduct.colors && selectedProduct.colors.length > 0

    if (requiresSize && !selectedSize) {
      toast({
        variant: "warning",
        title: "Option Required",
        description: "Please select a size.",
      })
      return
    }
    if (requiresColor && !selectedColor) {
      toast({
        variant: "warning",
        title: "Option Required",
        description: "Please select a color.",
      })
      return
    }

    const variantStock = getVariantStock(selectedProduct, selectedSize, selectedColor)
    if (variantStock <= 0) {
      toast({
        variant: "destructive",
        title: "Out of Stock",
        description: `The selected variant is out of stock.`,
      })
      return
    }

    const variantId = `${selectedProduct.id}-${selectedSize || "no-size"}-${selectedColor || "no-color"}`

    dispatch({
      type: "ADD_ITEM",
      payload: {
        ...selectedProduct,
        selectedSize: selectedSize || undefined,
        selectedColor: selectedColor || undefined,
        variantStock: variantStock,
        variantId: variantId,
      },
    })
    toast({
      variant: "success",
      title: "Added to Cart!",
      description: `${selectedProduct.name} (${selectedSize || ""} ${selectedColor || ""}) has been added to your cart.`,
    })
    setSelectedProduct(null) // Close modal
    setSelectedSize(null)
    setSelectedColor(null)
  }

  const updateQuantity = (index: number, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id: index, quantity } })
  }

  const removeItem = (index: number) => {
    dispatch({ type: "REMOVE_ITEM", payload: index })
  }

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" })
    toast({
      variant: "success",
      title: "Cart Cleared",
      description: "All items have been removed from the cart.",
    })
  }

  const handleCheckout = () => {
    if (state.items.length === 0) {
      toast({
        variant: "destructive",
        title: "Empty Cart",
        description: "Please add items to the cart before checkout.",
      })
      return
    }
    setShowCheckoutModal(true)
  }

  const quickAddById = () => {
    const productId = Number.parseInt(quickAddId)
    if (isNaN(productId)) {
      toast({
        variant: "destructive",
        title: "Invalid ID",
        description: "Please enter a valid product ID.",
      })
      return
    }

    const product = products.find((p) => p.id === productId)
    if (!product) {
      toast({
        variant: "destructive",
        title: "Product Not Found",
        description: `No product found with ID ${productId}.`,
      })
      return
    }

    handleAddToCart(product)
    setQuickAddId("")
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setProofOfPaymentFile(event.target.files[0])
    } else {
      setProofOfPaymentFile(null)
    }
  }

  const handleSubmitOrder = async () => {
    if (!proofOfPaymentFile) {
      toast({
        variant: "destructive",
        title: "Proof of Payment Required",
        description: "Please upload a proof of payment image or PDF.",
      })
      return
    }

    if (!customerName || !customerContact || !deliveryAddress) {
      toast({
        variant: "destructive",
        title: "Customer Details Required",
        description: "Please fill in all customer details.",
      })
      return
    }

    setIsSubmittingOrder(true)
    try {
      const formData = new FormData()
      formData.append("proofOfPayment", proofOfPaymentFile)
      formData.append("customerName", customerName)
      formData.append("customerContact", customerContact)
      formData.append("deliveryAddress", deliveryAddress)
      formData.append("cartItems", JSON.stringify(state.items))
      formData.append("totalAmount", state.total.toFixed(2)) // Pass subtotal as total, no tax

      const result = await submitPOSOrder(formData) // Call the new POS specific action

      if (result.success) {
        toast({
          variant: "success",
          title: "Order Submitted!",
          description: result.message,
        })
        clearCart()
        setShowCheckoutModal(false)
        setCustomerName("")
        setCustomerContact("")
        setDeliveryAddress("")
        setProofOfPaymentFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = "" // Clear file input
        }
      } else {
        toast({
          variant: "destructive",
          title: "Order Submission Failed",
          description: result.message || "An unknown error occurred.",
        })
      }
    } catch (error) {
      console.error("Error submitting order:", error)
      toast({
        variant: "destructive",
        title: "Order Submission Failed",
        description: "An unexpected error occurred while submitting the order.",
      })
    } finally {
      setIsSubmittingOrder(false)
    }
  }

  const currentVariantStock = selectedProduct ? getVariantStock(selectedProduct, selectedSize, selectedColor) : 0

  return (
    <Suspense
      fallback={<div className="min-h-screen bg-gray-100 flex items-center justify-center">Loading POS System...</div>}
    >
      <div className="min-h-screen bg-gray-100 flex flex-col">
        {/* POS Header */}
        <header className="bg-white shadow-lg border-b-4 border-green-600 p-4 md:p-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-4 mb-4 md:mb-0">
              <img src="/placeholder-logo.svg" alt="Aachen Studio Logo" className="h-10 w-10 md:h-12 md:w-12" />
              <div>
                <h1 className="text-xl md:text-3xl font-bold text-gray-900">Aachen Studio POS</h1>
                <p className="text-sm md:text-base text-gray-600">Point of Sale System</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 md:space-x-6">
              <div className="text-right">
                <p className="text-xs md:text-sm text-gray-600">Items in Cart</p>
                <p className="text-lg md:text-xl font-semibold text-green-600">{state.itemCount}</p>
              </div>

              <Button
                variant="outline"
                onClick={clearCart}
                disabled={state.items.length === 0}
                className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 text-sm md:text-base px-3 py-2 md:px-4 md:py-2 bg-transparent"
              >
                <X className="h-4 w-4 mr-1 md:mr-2" />
                Clear Cart
              </Button>
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
          {/* Left Side - Products */}
          <div className="flex-1 p-4 md:p-6 overflow-hidden flex flex-col">
            {/* Search and Quick Add Bar */}
            <div className="mb-4 md:mb-6 space-y-2 md:space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 md:h-5 md:w-5" />
                <Input
                  type="text"
                  placeholder="Search products... (Ctrl+K)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 md:pl-10 h-10 md:h-12 text-sm md:text-lg"
                />
              </div>

              {/* Quick Add by ID */}
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Quick add by ID"
                  value={quickAddId}
                  onChange={(e) => setQuickAddId(e.target.value)}
                  className="flex-1 text-sm md:text-base"
                  onKeyPress={(e) => e.key === "Enter" && quickAddById()}
                />
                <Button
                  onClick={quickAddById}
                  disabled={!quickAddId}
                  className="text-sm md:text-base px-3 py-2 md:px-4 md:py-2"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>

              <div className="text-xs text-gray-500">
                💡 Shortcuts: Ctrl+K (search) | Enter (checkout) | Esc (close modal)
              </div>
            </div>

            {/* Products Grid */}
            <div className="flex-1 overflow-y-auto pb-4 md:pb-0">
              {loadingProducts && (
                <div className="text-center text-gray-600 text-base md:text-xl py-10 md:py-20">Loading products...</div>
              )}

              {errorLoadingProducts && (
                <div className="text-center text-red-600 text-base md:text-xl py-10 md:py-20">
                  Failed to load products. Please check your configuration.
                </div>
              )}

              {!loadingProducts && !errorLoadingProducts && filteredProducts.length === 0 && (
                <div className="text-center text-gray-600 text-base md:text-xl py-10 md:py-20">
                  {searchTerm ? "No products found matching your search." : "No products available."}
                </div>
              )}

              {!loadingProducts && !errorLoadingProducts && filteredProducts.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                  {filteredProducts.map((product) => (
                    <Card
                      key={product.id}
                      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => handleAddToCart(product)}
                    >
                      <CardHeader className="p-0 relative">
                        <div className="relative w-full h-24 sm:h-32 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
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
                                iconDiv.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="text-gray-400"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="M10 4v4"></path><path d="M2 8h20"></path><path d="M6 12h.01"></path><path d="M6 16h.01"></path><path d="M10 12h8"></path><path d="M10 16h8"></path></svg>`
                                parent.appendChild(iconDiv)
                              }
                            }}
                          />
                          {product.stock === 0 &&
                            (!product.variants || product.variants.every((v) => v.stock <= 0)) && (
                              <div className="absolute inset-0 bg-red-600 bg-opacity-75 flex items-center justify-center">
                                <span className="text-white font-bold text-sm md:text-lg">OUT OF STOCK</span>
                              </div>
                            )}
                        </div>
                      </CardHeader>
                      <CardContent className="p-2 md:p-3">
                        <CardTitle className="text-xs md:text-sm font-semibold mb-1 line-clamp-2">
                          {product.name}
                        </CardTitle>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-1">{product.description}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-base md:text-lg font-bold text-green-600">€{product.price.toFixed(2)}</p>
                          <Badge variant={product.stock > 0 ? "default" : "destructive"} className="text-xs">
                            {formatStockDisplay(product.stock)}
                          </Badge>
                        </div>
                      </CardContent>
                      <CardFooter className="p-2 pt-0 md:p-3 md:pt-0">
                        <Button
                          className="w-full text-xs md:text-sm"
                          size="sm"
                          disabled={
                            product.stock <= 0 && (!product.variants || product.variants.every((v) => v.stock <= 0))
                          }
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAddToCart(product)
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Cart */}
          <div className="w-full md:w-96 bg-white shadow-lg md:border-l flex flex-col">
            <div className="p-4 md:p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Current Sale</h2>
                <ShoppingCart className="h-5 w-5 md:h-6 w-6 text-green-600" />
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto space-y-3 mb-4 md:mb-6">
                {state.items.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <ShoppingCart className="h-10 w-10 md:h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm md:text-base">No items in cart</p>
                    <p className="text-xs md:text-sm">Click on products to add them</p>
                  </div>
                ) : (
                  state.items.map((item, index) => (
                    <Card key={`${item.id}-${item.selectedSize}-${item.selectedColor}-${index}`} className="border">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 md:w-12 h-12 bg-gray-100 rounded flex items-center justify-center border overflow-hidden shrink-0">
                            <img
                              src={getProductImage(item.image) || "/placeholder.svg"}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                            <div className="flex gap-1 mt-1">
                              {item.selectedSize && (
                                <Badge variant="secondary" className="text-xs">
                                  Size: {item.selectedSize}
                                </Badge>
                              )}
                              {item.selectedColor && (
                                <Badge variant="secondary" className="text-xs">
                                  Color: {item.selectedColor}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs md:text-sm text-gray-600">€{item.price.toFixed(2)} each</p>
                          </div>
                          <div className="flex items-center gap-1 md:gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(index, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="h-7 w-7 md:h-8 w-8"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-base md:text-lg font-semibold min-w-[1.5rem] text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(index, item.quantity + 1)}
                              disabled={item.quantity >= (item.variantStock ?? item.stock)}
                              className="h-7 w-7 md:h-8 w-8"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-700 h-7 w-7 md:h-8 w-8"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-2 text-right">
                          <p className="font-bold text-base md:text-lg">€{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-base md:text-lg">
                  <span>Subtotal ({state.itemCount} items)</span>
                  <span>€{state.total.toFixed(2)}</span>
                </div>
                {/* Removed Tax Line */}
                <div className="border-t pt-2">
                  <div className="flex justify-between text-xl md:text-2xl font-bold">
                    <span>Total</span>
                    <span>€{state.total.toFixed(2)}</span> {/* Total is now just subtotal */}
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                onClick={handleCheckout}
                className="w-full mt-6 h-12 md:h-14 text-base md:text-lg font-semibold"
                disabled={state.items.length === 0}
              >
                <Receipt className="h-4 w-4 md:h-5 w-5 mr-2" />
                Complete Sale
              </Button>
            </div>
          </div>
        </div>

        {/* Product Details Modal */}
        {selectedProduct && (
          <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
            <DialogContent className="sm:max-w-[425px] md:max-w-2xl p-6">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">{selectedProduct.name}</DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div>
                  <img
                    src={getProductImage(selectedProduct.image) || "/placeholder.svg"}
                    alt={selectedProduct.name}
                    className="w-full h-48 md:h-64 object-cover rounded-lg"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-2xl md:text-3xl font-bold text-green-600">€{selectedProduct.price.toFixed(2)}</p>
                    <p className="text-gray-600 mt-2 text-sm md:text-base">{selectedProduct.description}</p>
                  </div>

                  {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-base md:text-lg mb-2">Size</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.sizes.map((size) => {
                          const stock = getVariantStock(selectedProduct, size, selectedColor)
                          return (
                            <Button
                              key={size}
                              variant={selectedSize === size ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedSize(size)}
                              disabled={stock <= 0}
                            >
                              {size} {stock > 0 && selectedSize === size && `(${formatStockDisplay(stock)})`}
                            </Button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-base md:text-lg mb-2">Color</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.colors.map((color) => {
                          const stock = getVariantStock(selectedProduct, selectedSize, color)
                          return (
                            <Button
                              key={color}
                              variant={selectedColor === color ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedColor(color)}
                              disabled={stock <= 0}
                            >
                              {color}
                            </Button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <div className="pt-4">
                    <Button
                      onClick={handleAddVariantToCart}
                      className="w-full h-10 md:h-12 text-base md:text-lg"
                      disabled={
                        currentVariantStock <= 0 ||
                        (selectedProduct.sizes?.length > 0 && !selectedSize) ||
                        (selectedProduct.colors?.length > 0 && !selectedColor)
                      }
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {currentVariantStock > 0 ? `Add to Cart - €${selectedProduct.price.toFixed(2)}` : "Out of Stock"}
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Checkout Modal */}
        <Dialog open={showCheckoutModal} onOpenChange={() => setShowCheckoutModal(false)}>
          <DialogContent className="sm:max-w-[425px] p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Complete Sale</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="customerName" className="text-base font-medium flex items-center gap-2 mb-1">
                  <User className="h-4 w-4" /> Customer Name
                </Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer's full name"
                />
              </div>
              <div>
                <Label htmlFor="customerContact" className="text-base font-medium flex items-center gap-2 mb-1">
                  <Phone className="h-4 w-4" /> Contact Data (Email/Phone)
                </Label>
                <Input
                  id="customerContact"
                  value={customerContact}
                  onChange={(e) => setCustomerContact(e.target.value)}
                  placeholder="e.g., email@example.com or +1234567890"
                />
              </div>
              <div>
                <Label htmlFor="deliveryAddress" className="text-base font-medium flex items-center gap-2 mb-1">
                  <MapPin className="h-4 w-4" /> Delivery Address
                </Label>
                <Textarea
                  id="deliveryAddress"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Street, City, Postal Code, Country"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="proofOfPayment" className="text-base font-medium flex items-center gap-2 mb-1">
                  <Upload className="h-4 w-4" /> Proof of Payment (Image/PDF)
                </Label>
                <Input
                  id="proofOfPayment"
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="file:text-primary file:bg-primary-foreground file:border-0 file:rounded-md file:px-3 file:py-1 file:text-sm file:font-medium"
                />
                {proofOfPaymentFile && (
                  <p className="text-sm text-gray-500 mt-2">Selected file: {proofOfPaymentFile.name}</p>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total Due</span>
                  <span>€{state.total.toFixed(2)}</span> {/* Total is now just subtotal */}
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowCheckoutModal(false)}
                className="flex-1"
                disabled={isSubmittingOrder}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitOrder}
                className="flex-1"
                disabled={
                  isSubmittingOrder || !customerName || !customerContact || !deliveryAddress || !proofOfPaymentFile
                }
              >
                {isSubmittingOrder ? "Submitting..." : "Submit Order"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Suspense>
  )
}
