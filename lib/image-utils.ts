/**
 * Converts a Google Drive sharing link to a direct image URL
 * @param driveUrl Google Drive sharing URL
 * @returns Direct image URL that can be used in img tags
 */
export function getGoogleDriveImageUrl(driveUrl: string): string {
  console.log("Processing Google Drive URL:", driveUrl);
  
  if (!driveUrl || typeof driveUrl !== "string") {
    console.log("Invalid URL, returning placeholder");
    return "/placeholder.svg?height=200&width=200"
  }

  // Extract file ID from Google Drive URL
  const fileIdMatch = driveUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)
  if (!fileIdMatch || !fileIdMatch[1]) {
    console.log("Could not extract file ID from URL:", driveUrl);
    return "/placeholder.svg?height=200&width=200"
  }

  const fileId = fileIdMatch[1]
  console.log("Extracted file ID:", fileId);
  
  // Use the direct export URL format
  const directUrl = `https://drive.google.com/uc?export=view&id=${fileId}`
  console.log("Generated direct URL:", directUrl);
  
  return directUrl
}

/**
 * Gets a product image with fallback
 * @param imageSource Image source (URL, file ID, or identifier)
 * @returns Image URL with fallback
 */
export function getProductImage(imageSource: string): string {
  console.log("Processing image source:", imageSource);
  
  if (!imageSource) {
    console.log("No image source, returning placeholder");
    return "/placeholder.svg?height=200&width=200"
  }

  // Check if it's a blob URL (v0 environment)
  if (imageSource.startsWith("https://blob.v0.dev/")) {
    console.log("Blob URL detected, using as-is");
    return imageSource
  }

  // Check if it's a Google Drive URL
  if (imageSource.includes("drive.google.com")) {
    console.log("Google Drive URL detected, processing...");
    return getGoogleDriveImageUrl(imageSource)
  }

  // Check if it's a Google Drive file ID (without full URL)
  if (imageSource.match(/^[a-zA-Z0-9-_]{25,}$/)) {
    console.log("Google Drive file ID detected, generating URL...");
    const directUrl = `https://drive.google.com/uc?export=view&id=${imageSource}`
    console.log("Generated direct URL from file ID:", directUrl);
    return directUrl
  }

  // If it's already a direct URL
  if (imageSource.startsWith("http")) {
    console.log("Direct HTTP URL detected, using as-is");
    return imageSource
  }

  // Default placeholder
  console.log("No recognized format, returning placeholder");
  return "/placeholder.svg?height=200&width=200"
}

/**
 * Process multiple images for a product
 * @param images Array of image sources
 * @returns Array of processed image URLs
 */
export function getProductImages(images: string[]): string[] {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return ["/placeholder.svg?height=400&width=400"]
  }

  return images.map(getProductImage)
}
