"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface ImageGalleryProps {
  images: string[]
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(images[0])

  return (
    <div className="grid gap-4 md:grid-cols-[100px_1fr]">
      <div className="hidden md:flex flex-col gap-2">
        {images.map((image, index) => (
          <Image
            key={index}
            src={image || "/placeholder.svg"}
            alt={`Thumbnail ${index + 1}`}
            width={100}
            height={100}
            className={cn(
              "cursor-pointer rounded-md object-cover transition-all hover:opacity-80",
              selectedImage === image ? "border-2 border-primary" : "",
            )}
            onClick={() => setSelectedImage(image)}
          />
        ))}
      </div>
      <div className="relative overflow-hidden rounded-lg">
        <Image
          src={selectedImage || "/placeholder.svg"}
          alt="Product image"
          width={600}
          height={450}
          className="aspect-[4/3] w-full object-cover"
        />
      </div>
    </div>
  )
}
