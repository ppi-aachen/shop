"use client"

import type React from "react"
import { createContext, useReducer, useContext, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

interface Product {
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
  stock: number // Ensure stock is part of the Product interface
}

interface CartItem extends Product {
  quantity: number
  selectedSize?: string
  selectedColor?: string
}

interface CartState {
  cartItems: CartItem[]
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: { id: number; selectedSize?: string; selectedColor?: string } }
  | {
      type: "UPDATE_QUANTITY"
      payload: { id: number; quantity: number; selectedSize?: string; selectedColor?: string }
    }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartItem[] }

const CartContext = createContext<{
  cartState: CartState
  dispatch: React.Dispatch<CartAction>
  totalItems: number
  subtotal: number
  shippingCost: number
  totalAmount: number
}>({
  cartState: { cartItems: [] },
  dispatch: () => null,
  totalItems: 0,
  subtotal: 0,
  shippingCost: 0,
  totalAmount: 0,
})

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const newItem = action.payload
      const existingItemIndex = state.cartItems.findIndex(
        (item) =>
          item.id === newItem.id &&
          item.selectedSize === newItem.selectedSize &&
          item.selectedColor === newItem.selectedColor,
      )

      if (existingItemIndex > -1) {
        const existingItem = state.cartItems[existingItemIndex]
        const newQuantity = existingItem.quantity + newItem.quantity

        // Check against product's total stock
        if (newQuantity > existingItem.stock) {
          // This case should ideally be caught by the UI before dispatching ADD_ITEM
          // but as a fallback, prevent adding more than stock
          console.warn(`Attempted to add ${newQuantity} of ${newItem.name}, but only ${existingItem.stock} available.`)
          return state // Do not update state if stock is exceeded
        }

        const updatedItems = [...state.cartItems]
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity,
        }
        return { ...state, cartItems: updatedItems }
      } else {
        // Check against product's total stock for new item
        if (newItem.quantity > newItem.stock) {
          console.warn(`Attempted to add ${newItem.quantity} of ${newItem.name}, but only ${newItem.stock} available.`)
          return state // Do not add if initial quantity exceeds stock
        }
        return { ...state, cartItems: [...state.cartItems, newItem] }
      }
    }
    case "REMOVE_ITEM": {
      return {
        ...state,
        cartItems: state.cartItems.filter(
          (item) =>
            !(
              item.id === action.payload.id &&
              item.selectedSize === action.payload.selectedSize &&
              item.selectedColor === action.payload.selectedColor
            ),
        ),
      }
    }
    case "UPDATE_QUANTITY": {
      const { id, quantity, selectedSize, selectedColor } = action.payload
      const itemIndex = state.cartItems.findIndex(
        (item) => item.id === id && item.selectedSize === selectedSize && item.selectedColor === selectedColor,
      )

      if (itemIndex > -1) {
        const existingItem = state.cartItems[itemIndex]
        // Check against product's total stock
        if (quantity > existingItem.stock) {
          console.warn(
            `Attempted to set quantity to ${quantity} for ${existingItem.name}, but only ${existingItem.stock} available.`,
          )
          return state // Do not update if quantity exceeds stock
        }

        if (quantity <= 0) {
          return {
            ...state,
            cartItems: state.cartItems.filter(
              (item) => !(item.id === id && item.selectedSize === selectedSize && item.selectedColor === selectedColor),
            ),
          }
        } else {
          const updatedItems = [...state.cartItems]
          updatedItems[itemIndex] = { ...existingItem, quantity }
          return { ...state, cartItems: updatedItems }
        }
      }
      return state
    }
    case "CLEAR_CART":
      return { ...state, cartItems: [] }
    case "LOAD_CART":
      return { ...state, cartItems: action.payload }
    default:
      return state
  }
}

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartState, dispatch] = useReducer(cartReducer, { cartItems: [] })
  const { toast } = useToast()

  // Load cart from localStorage on initial render
  useEffect(() => {
    const storedCart = localStorage.getItem("aachen_studio_cart")
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart)
        // Basic validation to ensure it's an array of objects
        if (Array.isArray(parsedCart) && parsedCart.every((item) => typeof item === "object" && item !== null)) {
          dispatch({ type: "LOAD_CART", payload: parsedCart })
        } else {
          console.error("Invalid cart data in localStorage, clearing.")
          localStorage.removeItem("aachen_studio_cart")
        }
      } catch (e) {
        console.error("Failed to parse cart from localStorage, clearing.", e)
        localStorage.removeItem("aachen_studio_cart")
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("aachen_studio_cart", JSON.stringify(cartState.cartItems))
  }, [cartState.cartItems])

  const totalItems = cartState.cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = cartState.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Shipping cost logic (example: 5 EUR for delivery, 0 for pickup)
  // This will be determined at checkout, so for now, let's assume a default or calculate based on a simple rule
  // For simplicity, let's assume a flat rate for now, or 0 if cart is empty
  const shippingCost = subtotal > 0 ? 5.0 : 0.0 // Example: 5 EUR flat shipping if there are items

  const totalAmount = subtotal + shippingCost

  return (
    <CartContext.Provider value={{ cartState, dispatch, totalItems, subtotal, shippingCost, totalAmount }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
