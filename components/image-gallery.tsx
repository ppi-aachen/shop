"use client"

import Image from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface ImageGalleryProps {
  images: string[]
  alt: string
}

export function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [mainImage, setMainImage] = useState(images[0])

  if (!images || images.length === 0) {
    return (
      <div className="relative h-96 w-full overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
        <Image
          src="/placeholder.svg?height=400&width=400"
          alt="Placeholder"
          layout="fill"
          objectFit="cover"
          className="object-center"
        />
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-[100px_1fr]">
      <div className="hidden md:flex flex-col gap-2 overflow-y-auto max-h-[500px]">
        {images.map((image, index) => (
          <div
            key={index}
            className={cn(
              "relative h-24 w-24 cursor-pointer overflow-hidden rounded-md border-2",
              mainImage === image ? "border-primary" : "border-transparent",
            )}
            onClick={() => setMainImage(image)}
          >
            <Image
              src={image || "/placeholder.svg"}
              alt={`${alt} thumbnail ${index + 1}`}
              layout="fill"
              objectFit="cover"
              className="object-center"
            />
          </div>
        ))}
      </div>
      <div className="relative h-96 w-full overflow-hidden rounded-lg">
        <Image
          src={mainImage || "/placeholder.svg"}
          alt={alt}
          layout="fill"
          objectFit="contain" // Use contain to ensure the whole image is visible
          className="object-center"
        />
      </div>
    </div>
  )
}
