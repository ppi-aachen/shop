"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { ProductModal } from "./product-modal"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Card className="overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
        <div className="relative w-full h-48">
          <Image
            src={product.image || "/placeholder.svg?height=300&width=300&text=Product"}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false} // Set to false for lazy loading
          />
        </div>
        <CardContent className="p-4 flex flex-col flex-grow">
          <h3 className="text-lg font-semibold mb-1">{product.name}</h3>
          <p className="text-gray-700 font-bold mb-2">{formatCurrency(product.price)}</p>
          <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">{product.description}</p>
          <Button className="w-full mt-auto" onClick={() => setIsModalOpen(true)}>
            View Details
          </Button>
        </CardContent>
      </Card>

      <ProductModal product={product} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
