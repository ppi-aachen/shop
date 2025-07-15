"use client"

import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface ImageGalleryProps {
  images: string[]
  className?: string
}

export function ImageGallery({ images, className }: ImageGalleryProps) {
  const [mainImage, setMainImage] = React.useState(images[0])
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [modalImageIndex, setModalImageIndex] = React.useState(0)

  const openModal = (index: number) => {
    setModalImageIndex(index)
    setIsModalOpen(true)
  }

  const navigateModal = (direction: "prev" | "next") => {
    setModalImageIndex((prevIndex) => {
      if (direction === "next") {
        return (prevIndex + 1) % images.length
      } else {
        return (prevIndex - 1 + images.length) % images.length
      }
    })
  }

  return (
    <div className={cn("grid gap-4", className)}>
      <div className="relative w-full h-80 rounded-lg overflow-hidden">
        <Image
          src={mainImage || "/placeholder.svg"}
          alt="Main product image"
          fill
          style={{ objectFit: "cover" }}
          className="cursor-pointer"
          onClick={() => openModal(images.indexOf(mainImage))}
          priority
        />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {images.map((image, index) => (
          <div
            key={index}
            className={cn(
              "relative w-full h-20 rounded-md overflow-hidden cursor-pointer border-2",
              mainImage === image ? "border-primary" : "border-transparent",
            )}
            onClick={() => setMainImage(image)}
          >
            <Image
              src={image || "/placeholder.svg"}
              alt={`Thumbnail ${index + 1}`}
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl h-[90vh] p-0 flex flex-col">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 text-white hover:bg-white/20"
            onClick={() => setIsModalOpen(false)}
          >
            <X className="h-6 w-6" />
          </Button>
          <div className="relative flex-grow flex items-center justify-center bg-black">
            <Image
              src={images[modalImageIndex] || "/placeholder.svg"}
              alt={`Full screen image ${modalImageIndex + 1}`}
              fill
              style={{ objectFit: "contain" }}
              className="max-h-full max-w-full"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
              onClick={() => navigateModal("prev")}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
              onClick={() => navigateModal("next")}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </div>
          <div className="flex justify-center gap-2 p-2 bg-black">
            {images.map((image, index) => (
              <div
                key={index}
                className={cn(
                  "relative w-16 h-16 rounded-md overflow-hidden cursor-pointer border-2",
                  modalImageIndex === index ? "border-primary" : "border-transparent",
                )}
                onClick={() => setModalImageIndex(index)}
              >
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`Modal thumbnail ${index + 1}`}
                  fill
                  style={{ objectFit: "cover" }}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
