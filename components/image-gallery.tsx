"use client"

import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface ImageGalleryProps {
  images: string[]
  alt: string
}

export function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0)
  const [isViewerOpen, setIsViewerOpen] = React.useState(false)

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index)
  }

  const handlePrevClick = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1))
  }

  const handleNextClick = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1))
  }

  const openViewer = (index: number) => {
    setCurrentImageIndex(index)
    setIsViewerOpen(true)
  }

  const closeViewer = () => {
    setIsViewerOpen(false)
  }

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isViewerOpen) return
      if (event.key === "ArrowLeft") {
        handlePrevClick()
      } else if (event.key === "ArrowRight") {
        handleNextClick()
      } else if (event.key === "Escape") {
        closeViewer()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isViewerOpen])

  return (
    <div className="grid gap-4">
      <div className="relative overflow-hidden rounded-lg">
        <Image
          src={images[currentImageIndex] || "/placeholder.svg"}
          alt={alt}
          width={600}
          height={400}
          className="w-full h-auto object-cover aspect-[3/2] cursor-pointer"
          onClick={() => openViewer(currentImageIndex)}
          priority
        />
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/50 hover:bg-white"
              onClick={handlePrevClick}
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/50 hover:bg-white"
              onClick={handleNextClick}
            >
              <ChevronRightIcon className="h-6 w-6" />
            </Button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <div
              key={index}
              className={cn(
                "relative cursor-pointer overflow-hidden rounded-lg border-2",
                index === currentImageIndex ? "border-primary" : "border-transparent",
              )}
              onClick={() => handleThumbnailClick(index)}
            >
              <Image
                src={image || "/placeholder.svg"}
                alt={`${alt} thumbnail ${index + 1}`}
                width={100}
                height={75}
                className="w-full h-auto object-cover aspect-[4/3]"
              />
            </div>
          ))}
        </div>
      )}

      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="max-w-5xl p-0 bg-transparent border-none shadow-none">
          <div className="relative flex items-center justify-center">
            <Image
              src={images[currentImageIndex] || "/placeholder.svg"}
              alt={alt}
              width={1200}
              height={800}
              className="max-w-full max-h-[90vh] object-contain"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20"
              onClick={closeViewer}
            >
              <XIcon className="h-6 w-6" />
            </Button>
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={handlePrevClick}
                >
                  <ChevronLeftIcon className="h-8 w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={handleNextClick}
                >
                  <ChevronRightIcon className="h-8 w-8" />
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
