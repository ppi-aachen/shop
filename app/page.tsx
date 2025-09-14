"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { ProductModal } from "@/components/product-modal"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useCart } from "@/lib/cart-context"
import { Plus, Search, Package, Filter, X } from "lucide-react"
import { getProductImage } from "@/lib/image-utils"
import { useToast } from "@/hooks/use-toast"
import { getProductsFromGoogleSheet } from "@/app/checkout/actions"
import { DatabaseStatus } from "@/components/database-status"
import { CountryRestriction } from "@/components/country-restriction"

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

export default function HomePage() {
  const { dispatch } = useCart()
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [errorLoadingProducts, setErrorLoadingProducts] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true)
      setErrorLoadingProducts(false)
      try {
        const fetchedProducts = await getProductsFromGoogleSheet()
        setProducts(fetchedProducts)
        setFilteredProducts(fetchedProducts)

        // Set price range based on actual product prices
        if (fetchedProducts.length > 0) {
          const prices = fetchedProducts.map((p) => {
            // Use discounted price if available
            return p.discount && p.discount > 0 ? p.price * (1 - p.discount / 100) : p.price
          })
          const minPrice = Math.floor(Math.min(...prices))
          const maxPrice = Math.ceil(Math.max(...prices))
          setPriceRange([minPrice, maxPrice])
        }
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

  // Filter products based on search term, category, and price range
  useEffect(() => {
    let filtered = products

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Price filter (using discounted price if available)
    filtered = filtered.filter((product) => {
      const effectivePrice =
        product.discount && product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price
      return effectivePrice >= priceRange[0] && effectivePrice <= priceRange[1]
    })

    setFilteredProducts(filtered)
  }, [products, searchTerm, selectedCategory, priceRange])

  const openProductModal = (product: Product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const closeProductModal = () => {
    setSelectedProduct(null)
    setIsModalOpen(false)
  }

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

      openProductModal(product)
      return
    }

    dispatch({ type: "ADD_ITEM", payload: product })

    toast({
      variant: "success",
      title: "Added to Cart!",
      description: `${product.name} has been added to your cart.`,
    })
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategory("all")
    if (products.length > 0) {
      const prices = products.map((p) => {
        return p.discount && p.discount > 0 ? p.price * (1 - p.discount / 100) : p.price
      })
      const minPrice = Math.floor(Math.min(...prices))
      const maxPrice = Math.ceil(Math.max(...prices))
      setPriceRange([minPrice, maxPrice])
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <CountryRestriction />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">Aachen Studio</h1>
          <p className="text-xl text-gray-600 mb-8">Discover authentic Indonesian culture through modern design</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-600 rounded-full" />
              Free pickup in Aachen
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-600 rounded-full" />
              Delivery available
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-600 rounded-full" />
              Quality guarantee
            </span>
          </div>
        </div>

        {/* Database Status */}
        <DatabaseStatus />

        {/* Search and Filter Bar */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {(searchTerm || selectedCategory !== "all") && (
                <Badge variant="secondary" className="ml-2">
                  Active
                </Badge>
              )}
            </Button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <Card className="p-4">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range: €{priceRange[0]} - €{priceRange[1]}
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value) || 0, priceRange[1]])}
                      className="w-24"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value) || 1000])}
                      className="w-24"
                    />
                  </div>
                </div>
                <Button variant="ghost" onClick={clearFilters} className="flex items-center gap-2">
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
              </div>
            </Card>
          )}

          {/* Results Summary */}
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              Showing {filteredProducts.length} of {products.length} products
            </span>
            {(searchTerm || selectedCategory !== "all") && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all filters
              </Button>
            )}
          </div>
        </div>

        {/* Products Grid */}
        {loadingProducts && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading products...</p>
          </div>
        )}

        {errorLoadingProducts && (
          <div className="text-center py-20">
            <Package className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Products</h3>
            <p className="text-gray-600 mb-4">
              There was an error loading products from the database. Please check your configuration.
            </p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        )}

        {!loadingProducts && !errorLoadingProducts && filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCategory !== "all"
                ? "Try adjusting your search or filters to find what you're looking for."
                : "No products are currently available."}
            </p>
            {(searchTerm || selectedCategory !== "all") && <Button onClick={clearFilters}>Clear Filters</Button>}
          </div>
        )}

        {!loadingProducts && !errorLoadingProducts && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              // Calculate discounted price for display
              const originalPrice = product.price
              const discountedPrice =
                product.discount && product.discount > 0 ? originalPrice * (1 - product.discount / 100) : originalPrice
              const hasDiscount = product.discount && product.discount > 0

              return (
                <Card
                  key={product.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => openProductModal(product)}
                >
                  <CardHeader className="p-0 relative">
                    <div className="relative w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                      <img
                        src={getProductImage(product.image) || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                      {hasDiscount && (
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-red-600 text-white">{product.discount}% OFF</Badge>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-lg font-semibold mb-2 line-clamp-2">{product.name}</CardTitle>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {hasDiscount ? (
                          <>
                            <span className="text-gray-500 text-sm line-through mr-2">€{originalPrice.toFixed(2)}</span>
                            <span className="text-xl font-bold text-red-600">€{discountedPrice.toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="text-xl font-bold text-green-600">€{originalPrice.toFixed(2)}</span>
                        )}
                      </div>
                      <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                        {product.stock > 0 ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button
                      className="w-full"
                      disabled={product.stock <= 0}
                      onClick={(e) => {
                        e.stopPropagation()
                        addToCart(product)
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {product.stock > 0 ? `Add to Cart - €${discountedPrice.toFixed(2)}` : "Out of Stock"}
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}
      </main>

      {/* Product Modal */}
      <ProductModal product={selectedProduct} isOpen={isModalOpen} onClose={closeProductModal} />
    </div>
  )
}
