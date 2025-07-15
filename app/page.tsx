"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { useCart } from "@/lib/cart-context"
import { Plus, Eye } from "lucide-react"
import { ProductModal } from "@/components/product-modal"
import { getProductImage } from "@/lib/image-utils"
import { useToast } from "@/hooks/use-toast"
import { getProductsFromSheet } from "@/lib/google-sheets-api" // Import the new API function

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

export default function HomePage() {
  const { dispatch } = useCart()
  const [products, setProducts] = useState<Product[]>([]) // State to hold fetched products
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        const fetchedProducts = await getProductsFromSheet()
        setProducts(fetchedProducts)
      } catch (err) {
        console.error("Failed to fetch products:", err)
        setError("Failed to load products. Please check your Google Sheet configuration.")
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load products. Please check your Google Sheet configuration.",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [toast])

  const addToCart = (product: Product) => {
    // Check if product requires size or color selection
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
      // Show toast and automatically open modal
      const missingOptions = []
      if (requiresSize) missingOptions.push("size")
      if (requiresColor) missingOptions.push("color")

      toast({
        variant: "warning",
        title: "Options Required",
        description: `Please select ${missingOptions.join(" and ")} options first.`,
      })

      // Automatically open the product modal
      openProductModal(product)
      return
    }

    dispatch({ type: "ADD_ITEM", payload: { ...product, stock: product.stock } }) // Pass stock to cart item

    toast({
      variant: "success",
      title: "Added to Cart!",
      description: `${product.name} has been added to your cart.`,
    })
  }

  const openProductModal = (product: Product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const closeProductModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg text-gray-700">Loading products...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Products</h2>
        <p className="text-gray-700 text-center">{error}</p>
        <p className="text-gray-500 text-sm mt-2">
          Please ensure your Google Sheet is correctly set up and accessible.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Aachen Studio Collection</h2>
          <p className="text-gray-600">Authentic Indonesian-inspired apparel and accessories</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
              <CardHeader className="p-0 relative">
                <div className="relative w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  <img
                    src={getProductImage(product.image) || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = "none"
                      const parent = target.parentElement
                      if (parent) {
                        const iconDiv = document.createElement("div")
                        iconDiv.className = "flex items-center justify-center w-full h-full"
                        iconDiv.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="text-gray-400"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="M10 4v4"></path><path d="M2 8h20"></path><path d="M6 12h.01"></path><path d="M6 16h.01"></path><path d="M10 12h8"></path><path d="M10 16h8"></path></svg>`
                        parent.appendChild(iconDiv)
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => openProductModal(product)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>

                {product.images && product.images.length > 1 && (
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    +{product.images.length} photos
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle
                  className="text-lg mb-2 cursor-pointer hover:text-green-600 transition-colors"
                  onClick={() => openProductModal(product)}
                >
                  {product.name}
                </CardTitle>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

                {/* Show required options */}
                {((product.sizes && product.sizes.length > 0) || (product.colors && product.colors.length > 0)) && (
                  <div className="mb-3">
                    <p className="text-xs text-orange-600 font-medium">
                      {product.sizes && product.sizes.length > 0 && product.colors && product.colors.length > 0
                        ? "Size & Color selection required"
                        : product.sizes && product.sizes.length > 0
                          ? "Size selection required"
                          : "Color selection required"}
                    </p>
                  </div>
                )}

                <p className="text-2xl font-bold text-green-600">€{product.price.toFixed(2)}</p>
                <p className={`text-sm font-medium ${product.stock > 0 ? "text-gray-500" : "text-red-500"}`}>
                  Stock: {product.stock > 0 ? product.stock : "Out of Stock"}
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex gap-2">
                <Button onClick={() => addToCart(product)} className="flex-1" disabled={product.stock <= 0}>
                  <Plus className="h-4 w-4 mr-2" />
                  {product.stock <= 0
                    ? "Out of Stock"
                    : (product.sizes && product.sizes.length > 0) || (product.colors && product.colors.length > 0)
                      ? "Select Options"
                      : "Add to Cart"}
                </Button>
                <Button variant="outline" onClick={() => openProductModal(product)}>
                  <Eye className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-16 bg-white rounded-lg shadow-sm p-8">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">About Aachen Studio</h3>
            <p className="text-gray-600 leading-relaxed">
              Aachen Studio by PPI Aachen brings you authentic Indonesian culture through modern fashion. Our collection
              celebrates traditional Indonesian cuisine and heritage with contemporary designs that connect the
              Indonesian diaspora in Germany with their roots.
            </p>
          </div>
        </div>
      </main>

      <ProductModal product={selectedProduct} isOpen={isModalOpen} onClose={closeProductModal} />
    </div>
  )
}
