export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  image: string
  images?: string[] // Optional array of additional image URLs
  specifications?: {
    sizes?: string[]
    colors?: string[]
    [key: string]: string[] | undefined // Allow other string array properties
  }
}

export interface CartItem {
  id: string
  name: string
  price: number
  image?: string
  quantity: number
  selectedSize?: string
  selectedColor?: string
}

export interface OrderData {
  orderId: string
  date: string
  time: string
  customerName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  deliveryMethod: string
  totalItems: number
  subtotal: number
  shippingCost: number
  totalAmount: number
  notes: string
}

export interface OrderItem {
  productName: string
  price: number
  quantity: number
  subtotal: number
  selectedSize?: string
  selectedColor?: string
}
