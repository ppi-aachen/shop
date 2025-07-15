import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, DollarSign, CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getProductsFromGoogleSheet } from "@/app/checkout/actions"
import ProductModal from "@/components/product-modal"

export const dynamic = "force-dynamic"

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

export default async function HomePage() {
  const products: Product[] = await getProductsFromGoogleSheet()

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_500px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Aachen Studio: Connecting Indonesian Heritage with Modern Style
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                    Discover unique products that blend traditional Indonesian craftsmanship with contemporary design.
                    Support PPI Aachen&apos;s mission with every purchase.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link
                    className="inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-8 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
                    href="#products"
                  >
                    Shop Now
                  </Link>
                  <Link
                    className="inline-flex h-10 items-center justify-center rounded-md border border-gray-200 bg-white px-8 text-sm font-medium shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus-visible:ring-gray-300"
                    href="#how-it-works"
                  >
                    How it Works
                  </Link>
                </div>
              </div>
              <Image
                alt="Hero"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
                height="400"
                src="/placeholder.svg?height=400&width=400"
                width="400"
              />
            </div>
          </div>
        </section>

        <section id="products" className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Our Products</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Handpicked items that celebrate Indonesian culture and support our community.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              {products.map((product) => (
                <Card key={product.id} className="flex flex-col h-full">
                  <CardHeader>
                    <Image
                      alt={product.name}
                      className="aspect-square object-cover border border-gray-200 w-full rounded-lg overflow-hidden dark:border-gray-800"
                      height={300}
                      src={product.image || "/placeholder.svg"}
                      width={300}
                    />
                  </CardHeader>
                  <CardContent className="grid gap-2 flex-grow">
                    <CardTitle>{product.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                    <div className="font-semibold text-lg">€{product.price.toFixed(2)}</div>
                    {product.stock <= 5 && product.stock > 0 && (
                      <p className="text-sm text-orange-500">Only {product.stock} left in stock!</p>
                    )}
                    {product.stock === 0 && <p className="text-sm text-red-500 font-semibold">Out of Stock</p>}
                  </CardContent>
                  <CardFooter>
                    <ProductModal product={product} />
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">How It Works</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Simple steps to get your unique Indonesian-inspired products.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 py-12 sm:grid-cols-2 lg:grid-cols-3">
              <div className="grid gap-1">
                <div className="flex items-center justify-center rounded-full bg-gray-900 p-3 text-gray-50 dark:bg-gray-50 dark:text-gray-900 w-12 h-12 mx-auto mb-4">
                  <ShoppingCart className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-center">1. Browse & Add to Cart</h3>
                <p className="text-gray-500 text-center dark:text-gray-400">
                  Explore our collection and add your favorite items to your shopping cart.
                </p>
              </div>
              <div className="grid gap-1">
                <div className="flex items-center justify-center rounded-full bg-gray-900 p-3 text-gray-50 dark:bg-gray-50 dark:text-gray-900 w-12 h-12 mx-auto mb-4">
                  <DollarSign className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-center">2. Upload Proof of Payment</h3>
                <p className="text-gray-500 text-center dark:text-gray-400">
                  Instead of direct payment, upload a screenshot or PDF of your bank transfer.
                </p>
              </div>
              <div className="grid gap-1">
                <div className="flex items-center justify-center rounded-full bg-gray-900 p-3 text-gray-50 dark:bg-gray-50 dark:text-gray-900 w-12 h-12 mx-auto mb-4">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-center">3. Confirmation & Delivery</h3>
                <p className="text-gray-500 text-center dark:text-gray-400">
                  Receive an order confirmation and await delivery or pickup arrangements.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
