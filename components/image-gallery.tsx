"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ImageGalleryProps {
  images: string[]
  productName: string
  className?: string
}

export function ImageGallery({ images, productName, className }: ImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({})

  const handleImageError = (index: number) => {
    console.log(`Image failed to load at index ${index}:`, images[index]);
    console.log(`Image type: ${images[index]?.includes('drive.google.com') ? 'Google Drive' : 'Other'}`);
    console.log(`Full error details for image ${index}:`, images[index]);
    setImageErrors((prev) => ({ ...prev, [index]: true }))
  }

  const goToPrevious = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const currentImage = images[selectedImageIndex]
  const hasMultipleImages = images.length > 1

  // Check if the current image is a Google Drive URL
  const isGoogleDriveImage = currentImage && currentImage.includes('drive.google.com')

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Image Display */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden group">
        {!imageErrors[selectedImageIndex] ? (
          <img
            src={currentImage || "/placeholder.svg"}
            alt={`${productName} - Image ${selectedImageIndex + 1}`}
            className="w-full h-full object-cover"
            onError={() => handleImageError(selectedImageIndex)}
            onLoad={() => console.log(`Image loaded successfully at index ${selectedImageIndex}:`, currentImage)}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Package className="h-24 w-24 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-500 font-medium">{productName}</p>
              <p className="text-sm text-gray-400 mt-2">Image {selectedImageIndex + 1}</p>
              {isGoogleDriveImage && (
                <p className="text-xs text-red-400 mt-1">Google Drive image failed to load</p>
              )}
            </div>
          </div>
        )}

        {/* Navigation Arrows - Only show if multiple images */}
        {hasMultipleImages && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={goToNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Image Counter */}
        {hasMultipleImages && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
            {selectedImageIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Navigation - Only show if multiple images */}
      {hasMultipleImages && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={cn(
                "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                selectedImageIndex === index
                  ? "border-green-600 ring-2 ring-green-200"
                  : "border-gray-200 hover:border-gray-300",
              )}
            >
              {!imageErrors[index] ? (
                <img
                  src={image || "/placeholder.svg"}
                  alt={`${productName} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(index)}
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <Package className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
