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
  stock: number // Added stock property
}

const products: Product[] = [
  {
    id: 1,
    name: "Jarik Batik",
    price: 11.0,
    image: "https://drive.google.com/file/d/1fW0-P7dU5mimR0V5rq6K30uAMDquyoMH/view?usp=sharing",
    images: [
      "https://drive.google.com/file/d/1fW0-P7dU5mimR0V5rq6K30uAMDquyoMH/view?usp=sharing",
      "https://drive.google.com/file/d/10Qr4IuPWWuyu9k0O7btMlrz7ezyTNib9/view?usp=sharing",
      "https://drive.google.com/file/d/1lLSvTnbfY2p9M-9IhJkRsr3YazZ8HqKv/view?usp=sharing",
      "https://drive.google.com/file/d/1OMOJ7Eqb1vsXpq5ogEH-lGUbUtpCvhPc/view?usp=sharing",
      "https://drive.google.com/file/d/1uvemzAknWqSwJoQyPOTC8h3pOuVoNp3a/view?usp=sharing",
      "https://drive.google.com/file/d/1835MmxUWaengsiL3sWlrAra3CqbqckzX/view?usp=sharing",
      "https://drive.google.com/file/d/1YJp6fwnI6x2Q1AM9iMUbqIWzDsWZUtX9/view?usp=sharing",
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
    colors: ["Ambonia", "Atjeh", "Bandoeng", "Borneo", "Djogjakarta"],
    stock: 10, // Example stock
  },
  {
    id: 2,
    name: "Batik Outer",
    price: 14.0,
    image: "https://drive.google.com/file/d/1la8WgRt1RruPnMZ2qZEbisXrTIGJ2Cpo/view?usp=drive_link",
    images: [
      "https://drive.google.com/file/d/1la8WgRt1RruPnMZ2qZEbisXrTIGJ2Cpo/view?usp=drive_link",
      "https://drive.google.com/file/d/1soJYVejgJqEuqCmu4RC4gSU-SbEPaAF6/view?usp=drive_link",
      "https://drive.google.com/file/d/1SLCn73UsltCxj8FyW-Ub-fAdDCU5lc9y/view?usp=drive_link",
      "https://drive.google.com/file/d/19pS8ZHjdw0-v3kB-zA_jyEg2fyEJHUpg/view?usp=drive_link",
      "https://drive.google.com/file/d/1mBUiUM1LDXvGLO6Dy-GIgbGkUTbRYC3B/view?usp=drive_link",
      "https://drive.google.com/file/d/1iI41Yw9_eAyNqqcG2jnMOVltmqXNj5Ie/view?usp=drive_link",
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
    colors: ["Kembang Legi", "Luruh Praja", "Parang Ayu", "Rahayu", "Sekar Tirta"],
    stock: 5, // Example stock
  },
  {
    id: 3,
    name: "Aksara Oversized T-Shirt",
    price: 12.0,
    image: "https://drive.google.com/file/d/1FzJrKLbrORg7pE1BYpVR_beHJR0bGhmy/view?usp=sharing",
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
    stock: 15, // Example stock
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
    },
    careInstructions: ["Machine wash cold", "Tumble dry low", "Do not iron directly on print", "Wash inside out"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Navy"],
    stock: 20, // Example stock
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

    dispatch({ type: "ADD_ITEM", payload: { ...product, quantity: 1 } }) // Add quantity: 1 for direct add

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

                {product.stock === 0 && (
                  <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                    Out of Stock
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
                {product.stock <= 0 && <p className="text-red-500 font-semibold">Out of Stock</p>}
              </CardContent>
              <CardFooter className="p-4 pt-0 flex gap-2">
                <Button onClick={() => addToCart(product)} className="flex-1" disabled={product.stock <= 0}>
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
