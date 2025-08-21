"use client"

import { useState, useEffect, Suspense } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/cart-context"
import { Plus, Minus, Trash2, ShoppingCart, Search, Receipt, Store, Clock, X } from "lucide-react"
import { getProductImage } from "@/lib/image-utils"
import { useToast } from "@/hooks/use-toast"
import { getProductsFromGoogleSheet } from "@/app/checkout/actions"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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

export default function POSPage() {
  const { state, dispatch } = useCart()
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [errorLoadingProducts, setErrorLoadingProducts] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [quickAddId, setQuickAddId] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("card")
  const [cashReceived, setCashReceived] = useState("")
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)

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
      if (event.key === "Enter" && state.items.length > 0 && !showPaymentModal) {
        event.preventDefault()
        handleCheckout()
      }

      // Escape to close payment modal
      if (event.key === "Escape" && showPaymentModal) {
        setShowPaymentModal(false)
      }
    }

    document.addEventListener("keydown", handleKeyPress)
    return () => document.removeEventListener("keydown", handleKeyPress)
  }, [state.items.length, showPaymentModal])

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const addToCart = (product: Product) => {
    const requiresSize = product.sizes && product.sizes.length > 0
    const requiresColor = product.colors && product.colors.length > 0

    if (product.stock <= 0) {
      toast({
        variant: "destructive",
        title: "Out of Stock",
        description: `${product.name} is currently out of stock.`,
      })
      return
    }

    if (requiresSize || requiresColor) {
      const missingOptions = []
      if (requiresSize) missingOptions.push("size")
      if (requiresColor) missingOptions.push("color")

      toast({
        variant: "warning",
        title: "Options Required",
        description: `Please select ${missingOptions.join(" and ")} options first.`,
      })

      setSelectedProduct(product)
      return
    }

    dispatch({ type: "ADD_ITEM", payload: product })

    toast({
      variant: "success",
      title: "Added to Cart!",
      description: `${product.name} has been added to your cart.`,
    })
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
    setShowPaymentModal(true)
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

    addToCart(product)
    setQuickAddId("")
  }

  const processPayment = () => {
    if (paymentMethod === "cash" && Number.parseFloat(cashReceived) < state.total * 1.19) {
      toast({
        variant: "destructive",
        title: "Insufficient Payment",
        description: "Cash received is less than the total amount.",
      })
      return
    }

    // Generate receipt content
    const receiptContent = generateReceipt()

    // Simulate receipt printing
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(receiptContent)
      printWindow.document.close()
      printWindow.print()
      printWindow.close()
    }

    // Process the sale
    toast({
      variant: "success",
      title: "Sale Complete!",
      description: `Payment received: €${paymentMethod === "cash" ? cashReceived : (state.total * 1.19).toFixed(2)}`,
    })

    // Clear cart and reset payment modal
    dispatch({ type: "CLEAR_CART" })
    setShowPaymentModal(false)
    setCashReceived("")
    setPaymentMethod("card")
  }

  const generateReceipt = () => {
    const now = new Date()
    const receiptNumber = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, "0")

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt</title>
        <style>
          body { font-family: monospace; font-size: 12px; margin: 0; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .items { margin: 20px 0; }
          .item { display: flex; justify-content: space-between; margin: 5px 0; }
          .total { border-top: 1px solid #000; margin-top: 20px; padding-top: 10px; }
          .footer { text-align: center; margin-top: 30px; font-size: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>Aachen Studio</h2>
          <p>Receipt #${receiptNumber}</p>
          <p>${now.toLocaleDateString()} ${now.toLocaleTimeString()}</p>
        </div>
        
        <div class="items">
          ${state.items
            .map(
              (item) => `
            <div class="item">
              <span>${item.name}${item.selectedSize ? ` (${item.selectedSize})` : ""}${item.selectedColor ? ` (${item.selectedColor})` : ""} x${item.quantity}</span>
              <span>€${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          `,
            )
            .join("")}
        </div>
        
        <div class="total">
          <div class="item">
            <span>Subtotal</span>
            <span>€${state.total.toFixed(2)}</span>
          </div>
          <div class="item">
            <span>Tax (19%)</span>
            <span>€${(state.total * 0.19).toFixed(2)}</span>
          </div>
          <div class="border-t pt-2">
            <div class="item">
              <strong>Total</strong>
              <strong>€${(state.total * 1.19).toFixed(2)}</strong>
            </div>
          </div>
          <div class="item">
            <span>Payment Method</span>
            <span>${paymentMethod === "cash" ? "Cash" : "Card"}</span>
          </div>
          ${
            paymentMethod === "cash" && cashReceived
              ? `
            <div class="item">
              <span>Cash Received</span>
              <span>€${Number.parseFloat(cashReceived).toFixed(2)}</span>
            </div>
            <div class="item">
              <span>Change</span>
              <span>€${(Number.parseFloat(cashReceived) - state.total * 1.19).toFixed(2)}</span>
            </div>
          `
              : ""
          }
        </div>
        
        <div class="footer">
          <p>Thank you for your purchase!</p>
          <p>Aachen Studio by PPI Aachen</p>
        </div>
      </body>
      </html>
    `
  }

  const cashChange = paymentMethod === "cash" && cashReceived ? Number.parseFloat(cashReceived) - state.total * 1.19 : 0

  const handleAddToCart = (product: Product) => {
    const requiresSize = product.sizes && product.sizes.length > 0
    const requiresColor = product.colors && product.colors.length > 0

    if (product.stock <= 0) {
      toast({
        variant: "destructive",
        title: "Out of Stock",
        description: `${product.name} is currently out of stock.`,
      })
      return
    }

    if (requiresSize || requiresColor) {
      const missingOptions = []
      if (requiresSize) missingOptions.push("size")
      if (requiresColor) missingOptions.push("color")

      toast({
        variant: "warning",
        title: "Options Required",
        description: `Please select ${missingOptions.join(" and ")} options first.`,
      })

      setSelectedProduct(product)
      return
    }

    dispatch({ type: "ADD_ITEM", payload: product })

    toast({
      variant: "success",
      title: "Added to Cart!",
      description: `${product.name} has been added to your cart.`,
    })
  }

  const handleAddVariantToCart = () => {
    if (!selectedProduct) return

    const variantStock = selectedProduct.stock
    if (variantStock <= 0) {
      toast({
        variant: "destructive",
        title: "Out of Stock",
        description: `${selectedProduct.name} is currently out of stock.`,
      })
      return
    }

    dispatch({
      type: "ADD_ITEM",
      payload: {
        ...selectedProduct,
        selectedSize,
        selectedColor,
      },
    })

    toast({
      variant: "success",
      title: "Added to Cart!",
      description: `${selectedProduct.name} (${selectedSize ? `Size: ${selectedSize}` : ""}${selectedColor ? ` Color: ${selectedColor}` : ""}) has been added to your cart.`,
    })

    setSelectedProduct(null)
    setSelectedSize(null)
    setSelectedColor(null)
  }

  const currentVariantStock = selectedProduct ? selectedProduct.stock : 0

  return (
    <Suspense
      fallback={<div className="min-h-screen bg-gray-100 flex items-center justify-center">Loading POS System...</div>}
    >
      <div className="min-h-screen bg-gray-100">
        {/* POS Header */}
        <header className="bg-white shadow-lg border-b-4 border-green-600">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Store className="h-8 w-8 text-green-600" />
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Aachen Studio POS</h1>
                    <p className="text-gray-600">Point of Sale System</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Current Time</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{new Date().toLocaleTimeString()}</p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-600">Items in Cart</p>
                  <p className="text-lg font-semibold text-green-600">{state.itemCount}</p>
                </div>

                <Button
                  variant="outline"
                  onClick={clearCart}
                  disabled={state.items.length === 0}
                  className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 bg-transparent"
                >
                  <X className="h-5 w-5 mr-2" />
                  Clear Cart
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex h-[calc(100vh-120px)]">
          {/* Left Side - Products */}
          <div className="flex-1 p-6 overflow-hidden">
            {/* Search and Quick Add Bar */}
            <div className="mb-6 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search products... (Ctrl+K to focus)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-lg"
                />
              </div>

              {/* Quick Add by ID */}
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Quick add by Product ID"
                  value={quickAddId}
                  onChange={(e) => setQuickAddId(e.target.value)}
                  className="flex-1"
                  onKeyPress={(e) => e.key === "Enter" && quickAddById()}
                />
                <Button onClick={quickAddById} disabled={!quickAddId}>
                  <Plus className="h-4 w-4 mr-1" />
                  Quick Add
                </Button>
              </div>

              <div className="text-xs text-gray-500">
                💡 Keyboard shortcuts: Ctrl+K (search) | Enter (complete sale) | Esc (close modal)
              </div>
            </div>

            {/* Products Grid */}
            <div className="h-full overflow-y-auto">
              {loadingProducts && <div className="text-center text-gray-600 text-xl py-20">Loading products...</div>}

              {errorLoadingProducts && (
                <div className="text-center text-red-600 text-xl py-20">
                  Failed to load products. Please check your configuration.
                </div>
              )}

              {!loadingProducts && !errorLoadingProducts && filteredProducts.length === 0 && (
                <div className="text-center text-gray-600 text-xl py-20">
                  {searchTerm ? "No products found matching your search." : "No products available."}
                </div>
              )}

              {!loadingProducts && !errorLoadingProducts && filteredProducts.length > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredProducts.map((product) => (
                    <Card
                      key={product.id}
                      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => handleAddToCart(product)}
                    >
                      <CardHeader className="p-0 relative">
                        <div className="relative w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
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
                                iconDiv.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="text-gray-400"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="M10 4v4"></path><path d="M2 8h20"></path><path d="M6 12h.01"></path><path d="M6 16h.01"></path><path d="M10 12h8"></path><path d="M10 16h8"></path></svg>`
                                parent.appendChild(iconDiv)
                              }
                            }}
                          />
                          {product.stock === 0 && (
                            <div className="absolute inset-0 bg-red-600 bg-opacity-75 flex items-center justify-center">
                              <span className="text-white font-bold text-lg">OUT OF STOCK</span>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="p-3">
                        <CardTitle className="text-sm font-semibold mb-1 line-clamp-2">{product.name}</CardTitle>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-1">{product.description}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-base md:text-lg font-bold text-green-600">€{product.price.toFixed(2)}</p>
                          <Badge variant={product.stock > 0 ? "default" : "destructive"} className="text-xs">
                            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                          </Badge>
                        </div>
                      </CardContent>
                      <CardFooter className="p-3 pt-0">
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
          <div className="w-96 bg-white shadow-lg md:border-l flex flex-col">
            <div className="p-4 md:p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Current Sale</h2>
                <ShoppingCart className="h-5 w-5 md:h-6 w-6 text-green-600" />
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto space-y-3 mb-6">
                {state.items.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No items in cart</p>
                    <p className="text-sm">Click on products to add them</p>
                  </div>
                ) : (
                  state.items.map((item, index) => (
                    <Card key={`${item.id}-${item.selectedSize}-${item.selectedColor}-${index}`} className="border">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center border overflow-hidden shrink-0">
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
                <div className="flex justify-between text-base md:text-lg">
                  <span>Tax (19%)</span>
                  <span>€{(state.total * 0.19).toFixed(2)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-xl md:text-2xl font-bold">
                    <span>Total</span>
                    <span>€{(state.total * 1.19).toFixed(2)}</span>
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
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-2xl md:text-3xl font-bold text-green-600">€{selectedProduct.price.toFixed(2)}</p>
                    <p className="text-gray-600 mt-2">{selectedProduct.description}</p>
                  </div>

                  {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-base md:text-lg mb-2">Size</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.sizes.map((size) => (
                          <Button key={size} variant="outline" size="sm" onClick={() => setSelectedSize(size)}>
                            {size}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-base md:text-lg mb-2">Color</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.colors.map((color) => (
                          <Button
                            key={color}
                            variant={selectedColor === color ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedColor(color)}
                            disabled={currentVariantStock <= 0}
                          >
                            {color}
                          </Button>
                        ))}
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
      </div>
    </Suspense>
  )
}
