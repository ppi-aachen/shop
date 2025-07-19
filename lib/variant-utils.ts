// Utility functions for managing product variants and stock

export interface ProductVariant {
  productId: number
  size?: string
  color?: string
  stock: number
  variantId: string
}

export interface ProductData {
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
  stock: number // Total stock (sum of all variants)
  variants?: ProductVariant[] // Individual variant stock levels
}

/**
 * Generate a unique variant ID for a product variant
 * Handles spaces and special characters by using URL-safe encoding
 */
export function generateVariantId(productId: number, size?: string, color?: string): string {
  const sizePart = size || 'null'
  const colorPart = color || 'null'
  
  // Encode spaces and special characters for URL-safe variant IDs
  const encodedSize = encodeURIComponent(sizePart)
  const encodedColor = encodeURIComponent(colorPart)
  
  return `${productId}-${encodedSize}-${encodedColor}`
}

/**
 * Parse variant ID to extract product ID, size, and color
 * Handles URL-encoded values properly
 */
export function parseVariantId(variantId: string): { productId: number; size?: string; color?: string } {
  const parts = variantId.split('-')
  if (parts.length < 3) {
    throw new Error(`Invalid variant ID format: ${variantId}`)
  }
  
  const productId = parseInt(parts[0])
  
  // Handle the case where size or color might contain encoded dashes
  // We need to reconstruct the full encoded parts
  const encodedSize = parts[1]
  const encodedColor = parts.slice(2).join('-') // Rejoin in case color had dashes
  
  const size = encodedSize === 'null' ? undefined : decodeURIComponent(encodedSize)
  const color = encodedColor === 'null' ? undefined : decodeURIComponent(encodedColor)
  
  return { productId, size, color }
}

/**
 * Generate all possible variants for a product based on its sizes and colors
 */
export function generateProductVariants(product: Omit<ProductData, 'variants' | 'stock'>): ProductVariant[] {
  const variants: ProductVariant[] = []
  
  // If no sizes or colors, create a single variant
  if ((!product.sizes || product.sizes.length === 0) && (!product.colors || product.colors.length === 0)) {
    variants.push({
      productId: product.id,
      stock: 0, // Will be set by the user
      variantId: generateVariantId(product.id)
    })
    return variants
  }
  
  // If only sizes, create variants for each size
  if (product.sizes && product.sizes.length > 0 && (!product.colors || product.colors.length === 0)) {
    for (const size of product.sizes) {
      variants.push({
        productId: product.id,
        size,
        stock: 0, // Will be set by the user
        variantId: generateVariantId(product.id, size)
      })
    }
    return variants
  }
  
  // If only colors, create variants for each color
  if (product.colors && product.colors.length > 0 && (!product.sizes || product.sizes.length === 0)) {
    for (const color of product.colors) {
      variants.push({
        productId: product.id,
        color,
        stock: 0, // Will be set by the user
        variantId: generateVariantId(product.id, undefined, color)
      })
    }
    return variants
  }
  
  // If both sizes and colors, create variants for each combination
  if (product.sizes && product.sizes.length > 0 && product.colors && product.colors.length > 0) {
    for (const size of product.sizes) {
      for (const color of product.colors) {
        variants.push({
          productId: product.id,
          size,
          color,
          stock: 0, // Will be set by the user
          variantId: generateVariantId(product.id, size, color)
        })
      }
    }
    return variants
  }
  
  return variants
}

/**
 * Get the total stock for a product (sum of all variants)
 */
export function getTotalStock(variants: ProductVariant[]): number {
  return variants.reduce((total, variant) => total + variant.stock, 0)
}

/**
 * Get stock for a specific variant
 */
export function getVariantStock(variants: ProductVariant[], size?: string, color?: string): number {
  const variantId = generateVariantId(0, size, color) // productId doesn't matter for comparison
  const variant = variants.find(v => {
    const vId = generateVariantId(v.productId, v.size, v.color)
    return vId === variantId
  })
  return variant?.stock || 0
}

/**
 * Check if a specific variant is in stock
 */
export function isVariantInStock(variants: ProductVariant[], size?: string, color?: string): boolean {
  return getVariantStock(variants, size, color) > 0
}

/**
 * Check if any variant of a product is in stock
 */
export function isProductInStock(variants: ProductVariant[]): boolean {
  return variants.some(variant => variant.stock > 0)
}

/**
 * Get available variants (those with stock > 0)
 */
export function getAvailableVariants(variants: ProductVariant[]): ProductVariant[] {
  return variants.filter(variant => variant.stock > 0)
}

/**
 * Get low stock variants (stock <= 2)
 */
export function getLowStockVariants(variants: ProductVariant[]): ProductVariant[] {
  return variants.filter(variant => variant.stock > 0 && variant.stock <= 2)
}

/**
 * Create a cart item with variant information
 */
export function createCartItemWithVariant(
  product: ProductData,
  selectedSize?: string,
  selectedColor?: string,
  quantity: number = 1
) {
  const variantId = generateVariantId(product.id, selectedSize, selectedColor)
  const variantStock = product.variants 
    ? getVariantStock(product.variants, selectedSize, selectedColor)
    : product.stock // Fallback to total stock if no variants

  return {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    images: product.images,
    description: product.description,
    quantity,
    selectedSize,
    selectedColor,
    sizes: product.sizes,
    colors: product.colors,
    stock: product.stock,
    variantStock,
    variantId
  }
} 