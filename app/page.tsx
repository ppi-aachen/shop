import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import ProductModal from "@/components/product-modal"

interface Product {
  id: number
  name: string
  price: number
  image: string
  description: string
  sizes?: string[]
  colors?: string[]
}

const products: Product[] = [
  {
    id: 1,
    name: "Batik Shirt 'Parang'",
    price: 35.0,
    image: "/placeholder.jpg",
    description: "Classic Batik shirt with Parang motif, symbolizing strength and continuity.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Blue", "Brown"],
  },
  {
    id: 2,
    name: "Wayang Kulit Keychain",
    price: 12.5,
    image: "/placeholder.jpg",
    description: "Handcrafted keychain featuring traditional Wayang Kulit (shadow puppet) characters.",
  },
  {
    id: 3,
    name: "Indonesian Coffee Beans",
    price: 20.0,
    image: "/placeholder.jpg",
    description: "Premium Arabica coffee beans from the highlands of Java, rich and aromatic.",
  },
  {
    id: 4,
    name: "Gamelan Miniature Set",
    price: 80.0,
    image: "/placeholder.jpg",
    description: "Decorative miniature set of traditional Javanese Gamelan instruments.",
  },
  {
    id: 5,
    name: "Tenun Scarf 'Sumba'",
    price: 28.0,
    image: "/placeholder.jpg",
    description: "Beautiful hand-woven Tenun scarf from Sumba, vibrant colors and unique patterns.",
    colors: ["Red", "Green", "Yellow"],
  },
  {
    id: 6,
    name: "Rendang Spice Mix",
    price: 8.0,
    image: "/placeholder.jpg",
    description: "Authentic Indonesian spice mix for making the famous Rendang beef curry.",
  },
]

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:py-12">
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Discover Authentic Indonesian Crafts
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          Support Indonesian culture through unique products by PPI Aachen.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="#products">
            <Button size="lg">Shop Now</Button>
          </Link>
          <Link href="https://instagram.com/aachen.studio" target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant="outline">
              Follow Us
            </Button>
          </Link>
        </div>
      </section>

      <section id="products" className="mb-12">
        <h2 className="mb-8 text-3xl font-bold text-center">Our Products</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <Card key={product.id} className="flex flex-col">
              <CardHeader className="p-0">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  width={400}
                  height={300}
                  className="aspect-[4/3] w-full rounded-t-lg object-cover"
                />
              </CardHeader>
              <CardContent className="flex-1 p-4">
                <CardTitle className="text-xl font-semibold">{product.name}</CardTitle>
                <CardDescription className="mt-2 text-gray-500 line-clamp-2">{product.description}</CardDescription>
                <p className="mt-3 text-lg font-bold">€{product.price.toFixed(2)}</p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <ProductModal product={product} />
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
