"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { useCart } from "@/lib/cart-context"
import { Plus, Eye } from "lucide-react"
import { ProductModal } from "@/components/product-modal"
import { getProductImage } from "@/lib/image-utils"
import { useToast } from "@/hooks/use-toast"

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
}

const products: Product[] = [
  {
    id: 1,
    name: "Wayang Totebag",
    price: 8.0,
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/FB_IMG_1733827949972.jpg-zZZyriFl5aahPt82T5kyqSBvr6phmm.jpeg",
    images: [
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/FB_IMG_1733827949972.jpg-zZZyriFl5aahPt82T5kyqSBvr6phmm.jpeg",
      "/placeholder.svg?height=400&width=400&text=Wayang+Front+Design",
      "/placeholder.svg?height=400&width=400&text=Wayang+Back+Design",
      "/placeholder.svg?height=400&width=400&text=Wayang+Detail+View",
      "/placeholder.svg?height=400&width=400&text=Wayang+Pattern+Close-up",
    ],
    description: "Stylish canvas totebag featuring traditional Indonesian Wayang (shadow puppet) designs",
    detailedDescription:
      "Our premium Wayang totebag celebrates Indonesia's rich cultural heritage through traditional shadow puppet art. Each bag features authentic wayang motifs arranged in a beautiful grid pattern, combining centuries-old Indonesian storytelling tradition with modern functionality. Perfect for students, professionals, and anyone who appreciates cultural significance in their everyday accessories.",
    features: [
      "100% cotton canvas construction",
      "Authentic Indonesian Wayang shadow puppet designs",
      "Traditional cultural motifs in modern grid layout",
      "Reinforced handles for durability",
      "Spacious main compartment",
      "Perfect for daily use or cultural events",
      "Conversation starter with cultural significance",
    ],
    materials: ["100% Cotton Canvas", "Reinforced Stitching"],
    specifications: {
      Dimensions: "38cm x 42cm x 10cm",
      "Handle Length": "65cm",
      Weight: "200g",
      Capacity: "15L",
      "Design Theme": "Traditional Wayang (Shadow Puppet)",
    },
    careInstructions: ["Hand wash in cold water", "Air dry only", "Do not bleach", "Iron on low heat if needed"],
    colors: ["Natural", "Black"],
  },
  {
    id: 2,
    name: "Nasi Tumpeng Oversized T-Shirt",
    price: 12.0,
    image: "/placeholder.svg?height=200&width=200&text=Nasi+Tumpeng",
    images: [
      "/placeholder.svg?height=400&width=400&text=Nasi+Tumpeng+Front",
      "/placeholder.svg?height=400&width=400&text=Nasi+Tumpeng+Back",
      "/placeholder.svg?height=400&width=400&text=Nasi+Tumpeng+Detail",
    ],
    description: "Comfortable oversized t-shirt featuring traditional Indonesian Nasi Tumpeng design",
    detailedDescription:
      "Celebrate Indonesian culinary heritage with this unique oversized t-shirt featuring the iconic Nasi Tumpeng. This traditional cone-shaped rice dish symbolizes gratitude and celebration in Indonesian culture.",
    features: [
      "Premium cotton blend fabric",
      "Oversized relaxed fit",
      "Unique Nasi Tumpeng artwork",
      "Soft and breathable material",
      "Unisex design",
    ],
    materials: ["60% Cotton", "40% Polyester"],
    specifications: {
      Fit: "Oversized",
      "Fabric Weight": "180 GSM",
      "Print Method": "Screen Print",
      Collar: "Crew Neck",
    },
    careInstructions: ["Machine wash cold", "Tumble dry low", "Do not iron directly on print", "Wash inside out"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["White", "Cream", "Light Gray"],
  },
  {
    id: 3,
    name: "Aksara Oversized T-Shirt",
    price: 12.0,
    image: "/placeholder.svg?height=200&width=200&text=Aksara",
    images: [
      "/placeholder.svg?height=400&width=400&text=Aksara+Front",
      "/placeholder.svg?height=400&width=400&text=Aksara+Back",
      "/placeholder.svg?height=400&width=400&text=Aksara+Worn",
    ],
    description: "Modern oversized t-shirt with beautiful Indonesian script (Aksara) design",
    detailedDescription:
      "Showcase the beauty of Indonesian traditional script with this contemporary t-shirt. The Aksara design represents the rich literary and cultural heritage of Indonesia, making it a perfect conversation starter.",
    features: [
      "Premium cotton blend fabric",
      "Authentic Aksara script design",
      "Comfortable oversized fit",
      "Cultural significance",
      "Modern streetwear style",
    ],
    materials: ["60% Cotton", "40% Polyester"],
    specifications: {
      Fit: "Oversized",
      "Fabric Weight": "180 GSM",
      "Print Method": "Screen Print",
      Collar: "Crew Neck",
    },
    careInstructions: ["Machine wash cold", "Tumble dry low", "Do not iron directly on print", "Wash inside out"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Navy", "Forest Green"],
  },
  {
    id: 4,
    name: "Soto Lamongan Oversized T-Shirt",
    price: 12.0,
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/FB_IMG_1733780798687.jpg-hUgnf5lT5spgMrseBNfTouGlj9FdXu.jpeg",
    images: [
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/FB_IMG_1733780798687.jpg-hUgnf5lT5spgMrseBNfTouGlj9FdXu.jpeg",
      "1FzJrKLbrORg7pE1BYpVR_beHJR0bGhmy",
      "/placeholder.svg?height=400&width=400&text=Soto+Front+Design",
      "/placeholder.svg?height=400&width=400&text=Soto+Back+Design",
      "/placeholder.svg?height=400&width=400&text=Soto+Detail+View",
    ],
    description: "Trendy oversized t-shirt celebrating the famous Soto Lamongan dish",
    detailedDescription:
      "Pay homage to one of Indonesia's most beloved comfort foods with this stylish t-shirt. Soto Lamongan, a traditional soup from East Java, represents the warmth and richness of Indonesian culinary culture. This Chapter II design from Aachen Studio showcases authentic Indonesian street food culture with modern urban aesthetics.",
    features: [
      "Premium cotton blend fabric",
      "Vibrant Soto Lamongan illustration",
      "Comfortable oversized cut",
      "Food culture appreciation",
      "Perfect for food enthusiasts",
      "Authentic Indonesian street food design",
      "Urban lifestyle aesthetic",
    ],
    materials: ["60% Cotton", "40% Polyester"],
    specifications: {
      Fit: "Oversized",
      "Fabric Weight": "180 GSM",
      "Print Method": "Screen Print",
      Collar: "Crew Neck",
      Collection: "Chapter II",
    },
    careInstructions: ["Machine wash cold", "Tumble dry low", "Do not iron directly on print", "Wash inside out"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Navy"],
  },
]

export default function HomePage() {
  const { dispatch } = useCart()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { toast } = useToast()

  const addToCart = (product: Product) => {
    // Check if product requires size or color selection
    const requiresSize = product.sizes && product.sizes.length > 0
    const requiresColor = product.colors && product.colors.length > 0

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

    dispatch({ type: "ADD_ITEM", payload: product })

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

                {product.id === 4 && (
                  <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                    Chapter II
                  </div>
                )}

                {/* Options Required Badge */}
                {((product.sizes && product.sizes.length > 0) || (product.colors && product.colors.length > 0)) && (
                  <div className="absolute bottom-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                    Options Required
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
              </CardContent>
              <CardFooter className="p-4 pt-0 flex gap-2">
                <Button onClick={() => addToCart(product)} className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  {(product.sizes && product.sizes.length > 0) || (product.colors && product.colors.length > 0)
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
