"use client"

import type React from "react"
import { createContext, useReducer, useContext, type ReactNode } from "react"
import type { Product } from "./types"

interface CartItem {
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

interface CartState {
  items: CartItem[]
  itemCount: number
  totalAmount: number
}

type CartAction =
  | { type: "ADD_ITEM"; payload: Product; quantity?: number; selectedSize?: string; selectedColor?: string }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }

const initialState: CartState = {
  items: [],
  itemCount: 0,
  totalAmount: 0,
}

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const { payload: product, quantity = 1, selectedSize, selectedColor } = action
      const existingItemIndex = state.items.findIndex(
        (item) => item.id === product.id && item.selectedSize === selectedSize && item.selectedColor === selectedColor,
      )

      let updatedItems: CartItem[]
      if (existingItemIndex > -1) {
        updatedItems = [...state.items]
        const existingItem = updatedItems[existingItemIndex]
        const newQuantity = existingItem.quantity + quantity
        if (newQuantity > product.stock) {
          // Prevent adding more than available stock
          console.warn(`Cannot add more than available stock for ${product.name}. Max: ${product.stock}`)
          return state // Return current state if stock limit is reached
        }
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity,
        }
      } else {
        if (quantity > product.stock) {
          console.warn(`Cannot add more than available stock for ${product.name}. Max: ${product.stock}`)
          return state // Return current state if initial add exceeds stock
        }
        updatedItems = [
          ...state.items,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity,
            image: product.image,
            description: product.description,
            selectedSize,
            selectedColor,
            sizes: product.sizes,
            colors: product.colors,
            stock: product.stock,
          },
        ]
      }
      return calculateTotals(updatedItems)
    }
    case "REMOVE_ITEM": {
      const updatedItems = state.items.filter((item) => item.id !== action.payload)
      return calculateTotals(updatedItems)
    }
    case "UPDATE_QUANTITY": {
      const { id, quantity } = action.payload
      const updatedItems = state.items.map((item) => (item.id === id ? { ...item, quantity } : item))
      return calculateTotals(updatedItems)
    }
    case "CLEAR_CART":
      return initialState
    default:
      return state
  }
}

const calculateTotals = (items: CartItem[]): CartState => {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  return { items, itemCount, totalAmount }
}

interface CartContextType {
  state: CartState
  dispatch: React.Dispatch<CartAction>
  addToCart: (product: Product, quantity?: number, selectedSize?: string, selectedColor?: string) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  const addToCart = (product: Product, quantity?: number, selectedSize?: string, selectedColor?: string) => {
    dispatch({ type: "ADD_ITEM", payload: product, quantity, selectedSize, selectedColor })
  }

  return <CartContext.Provider value={{ state, dispatch, addToCart }}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
