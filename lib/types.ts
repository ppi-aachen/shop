export interface Product {
  id: string // Changed to string to match sheet ID
  name: string
  price: number
  image: string
  images?: string[] // Array of image URLs
  description: string
  detailedDescription?: string
  features?: string[]
  specifications?: { [key: string]: string }
  materials?: string[]
  careInstructions?: string[]
  sizes?: string[]
  colors?: string[]
  stock: number
}

export interface CartItem {
  id: string // Changed to string to match sheet ID
  name: string
  price: number
  quantity: number
  image: string
  description?: string
  selectedSize?: string
  selectedColor?: string
  sizes?: string[]
  colors?: string[]
  stock: number
}

export interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  description?: string
  selectedSize?: string
  selectedColor?: string
  sizes?: string[]
  colors?: string[]
  stock: number
}
