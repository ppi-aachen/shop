"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/cart-context"
import { getProductImage, getProductVariants, getVariantStock, getVariantId } from "@/lib/utils"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { LoadingOverlay } from "@/components/loading-overlay" // Corrected import

interface Product {
  id: string
  name: string
  price: number
  image: string
  variants: {
    [key: string]: {
      [key: string]: {
        id: string
        stock: number
      }
    }
  }
}

const products: Product[] = [
  {
    id: "1",
    name: "Vintage Leather Jacket",
    price: 120.0,
    image: "/vintage-leather-jacket.png",
    variants: {
      color: {
        Black: { id: "1-black", stock: 5 },
        Brown: { id: "1-brown", stock: 3 },
      },
      size: {
        M: { id: "1-M", stock: 4 },
        L: { id: "1-L", stock: 2 },
      },
    },
  },
  {
    id: "2",
    name: "Cozy Knit Sweater",
    price: 65.0,
    image: "/cozy-knit-sweater.png",
    variants: {
      color: {
        Red: { id: "2-red", stock: 8 },
        Blue: { id: "2-blue", stock: 6 },
      },
      size: {
        S: { id: "2-S", stock: 7 },
        M: { id: "2-M", stock: 5 },
      },
    },
  },
  {
    id: "3",
    name: "Denim Jeans",
    price: 80.0,
    image: "/denim-jeans.png",
    variants: {
      waist: {
        "30": { id: "3-30", stock: 10 },
        "32": { id: "3-32", stock: 9 },
      },
      length: {
        "30": { id: "3-L30", stock: 8 },
        "32": { id: "3-L32", stock: 7 },
      },
    },
  },
  {
    id: "4",
    name: "Running Shoes",
    price: 95.0,
    image: "/running-shoes-on-track.png",
    variants: {
      color: {
        White: { id: "4-white", stock: 12 },
        Black: { id: "4-black", stock: 10 },
      },
      size: {
        "9": { id: "4-9", stock: 11 },
        "10": { id: "4-10", stock: 9 },
      },
    },
  },
  {
    id: "5",
    name: "Classic T-Shirt",
    price: 25.0,
    image: "/classic-t-shirt-front.png",
    variants: {
      color: {
        White: { id: "5-white", stock: 20 },
        Grey: { id: "5-grey", stock: 18 },
      },
      size: {
        S: { id: "5-S", stock: 15 },
        M: { id: "5-M", stock: 17 },
        L: { id: "5-L", stock: 16 },
      },
    },
  },
]

function POSPageContent() {
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart } = useCart()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: string }>({})
  const [quantity, setQuantity] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const productId = searchParams.get("product")
    if (productId) {
      const product = products.find((p) => p.id === productId)
      if (product) {
        setSelectedProduct(product)
        setIsModalOpen(true)
      }
    }
  }, [searchParams])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [searchTerm])

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
    setSelectedVariants({})
    setQuantity(1)
    setIsModalOpen(true)
  }

  const handleVariantSelect = (type: string, value: string) => {
    setSelectedVariants((prev) => ({ ...prev, [type]: value }))
  }

  const handleAddToCart = () => {
    if (!selectedProduct) return

    const productVariants = getProductVariants(selectedProduct)
    const allVariantsSelected = Object.keys(productVariants).every((type) => selectedVariants[type])

    if (!allVariantsSelected && Object.keys(productVariants).length > 0) {
      alert("Please select all variants.")
      return
    }

    const variantId = getVariantId(selectedProduct, selectedVariants)
    const stock = getVariantStock(selectedProduct, selectedVariants)

    if (stock !== null && quantity > stock) {
      alert(`Not enough stock. Only ${stock} available.`)
      return
    }

    addToCart({
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      image: selectedProduct.image,
      quantity,
      selectedVariants,
      variantId: variantId || selectedProduct.id,
    })
    setIsModalOpen(false)
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 0 ? 5.0 : 0.0 // Example shipping
  const total = subtotal + shipping // Tax removed

  const handleProceedToCheckout = () => {
    router.push("/checkout")
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="flex items-center justify-between px-4 py-3 bg-white shadow-sm dark:bg-gray-800">
        <h1 className="text-xl font-bold">POS System</h1>
        <Input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
      </header>
      <main className="flex flex-1">
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleProductClick(product)}
              >
                <CardContent className="p-4">
                  <Image
                    src={getProductImage(product.image) || "/placeholder.svg"}
                    alt={product.name}
                    width={200}
                    height={200}
                    className="object-cover w-full h-48 mb-4 rounded-md"
                  />
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400">${product.price.toFixed(2)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <Card className="w-full max-w-md p-4 border-l dark:border-gray-700">
          <CardHeader>
            <CardTitle>Current Order</CardTitle>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">Cart is empty.</p>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.variantId} className="flex items-center gap-4">
                    <Image
                      src={getProductImage(item.image) || "/placeholder.svg"}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      {Object.entries(item.selectedVariants).map(([type, value]) => (
                        <Badge key={type} variant="secondary" className="mr-1">
                          {type}: {value}
                        </Badge>
                      ))}
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ${item.price.toFixed(2)} x {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </Button>
                      <span>{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      >
                        +
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => removeFromCart(item.variantId)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="pt-4 mt-4 border-t dark:border-gray-700">
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Shipping:</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-xl font-bold mt-2">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button className="flex-1" onClick={handleProceedToCheckout} disabled={cart.length === 0}>
                Proceed to Checkout
              </Button>
              <Button
                className="flex-1 bg-transparent"
                variant="outline"
                onClick={clearCart}
                disabled={cart.length === 0}
              >
                Clear Cart
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {selectedProduct && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{selectedProduct.name}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Image
                src={getProductImage(selectedProduct.image) || "/placeholder.svg"}
                alt={selectedProduct.name}
                width={300}
                height={300}
                className="object-cover w-full h-64 rounded-md"
              />
              <p className="text-2xl font-bold">${selectedProduct.price.toFixed(2)}</p>
              {Object.entries(getProductVariants(selectedProduct)).map(([type, values]) => (
                <div key={type}>
                  <Label className="capitalize">{type}:</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Object.keys(values).map((value) => {
                      const variantId = getVariantId(selectedProduct, { ...selectedVariants, [type]: value })
                      const stock = getVariantStock(selectedProduct, { ...selectedVariants, [type]: value })
                      const isSelected = selectedVariants[type] === value
                      const isDisabled = stock !== null && stock === 0

                      return (
                        <Button
                          key={value}
                          variant={isSelected ? "default" : "outline"}
                          onClick={() => handleVariantSelect(type, value)}
                          disabled={isDisabled}
                        >
                          {value}
                        </Button>
                      )
                    })}
                  </div>
                </div>
              ))}
              <div>
                <Label htmlFor="quantity">Quantity:</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number.parseInt(e.target.value))}
                  className="w-24 mt-2"
                />
              </div>
            </div>
            <Button onClick={handleAddToCart}>Add to Cart</Button>
          </DialogContent>
        </Dialog>
      )}
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
