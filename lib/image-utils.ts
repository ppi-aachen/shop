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

  // Extract file ID from Google Drive URL - try multiple patterns
  let fileId = null;
  
  // Pattern 1: /file/d/FILE_ID/view
  const pattern1 = driveUrl.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
  if (pattern1 && pattern1[1]) {
    fileId = pattern1[1];
  }
  
  // Pattern 2: /d/FILE_ID/
  const pattern2 = driveUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (!fileId && pattern2 && pattern2[1]) {
    fileId = pattern2[1];
  }
  
  // Pattern 3: Just the file ID itself
  const pattern3 = driveUrl.match(/^([a-zA-Z0-9-_]{25,})$/);
  if (!fileId && pattern3 && pattern3[1]) {
    fileId = pattern3[1];
  }

  if (!fileId) {
    console.log("Could not extract file ID from URL:", driveUrl);
    return "/placeholder.svg?height=200&width=200"
  }

  console.log("Extracted file ID:", fileId);
  
  // Use the thumbnail format which is more reliable for img tags
  const directUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  console.log("Generated thumbnail URL:", directUrl);
  
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
    console.log("Google Drive file ID detected, generating thumbnail URL...");
    const directUrl = `https://drive.google.com/thumbnail?id=${imageSource}&sz=w1000`;
    console.log("Generated thumbnail URL from file ID:", directUrl);
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
