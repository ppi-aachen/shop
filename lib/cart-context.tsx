"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"

export interface CartItem {
  id: number
  name: string
  price: number
  image: string
  images?: string[]
  description: string
  quantity: number
  selectedSize?: string
  selectedColor?: string
  sizes?: string[]
  colors?: string[]
  stock: number // Added stock to CartItem interface
}

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
  deliveryMethod: "pickup" | "delivery"
  shippingCost: number
  finalTotal: number
}

type CartAction =
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "quantity"> & { quantity?: number } } // Allow quantity to be optional for single add
  | { type: "REMOVE_ITEM"; payload: number }
  | { type: "UPDATE_QUANTITY"; payload: { id: number; quantity: number } }
  | { type: "SET_DELIVERY_METHOD"; payload: "pickup" | "delivery" }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartItem[] }

const CartContext = createContext<{
  state: CartState
  dispatch: React.Dispatch<CartAction>
} | null>(null)

function calculateShippingCost(itemCount: number, deliveryMethod: "pickup" | "delivery"): number {
  if (deliveryMethod === "pickup") return 0

  if (itemCount >= 1 && itemCount <= 3) return 6.19
  if (itemCount >= 4 && itemCount <= 7) return 7.69
  return 10.49
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const { id, selectedSize, selectedColor, stock, quantity: addQuantity = 1 } = action.payload
      const existingItemIndex = state.items.findIndex(
        (item) => item.id === id && item.selectedSize === selectedSize && item.selectedColor === selectedColor,
      )

      let newItems: CartItem[]
      if (existingItemIndex >= 0) {
        const existingItem = state.items[existingItemIndex]
        const newQuantity = existingItem.quantity + addQuantity
        if (newQuantity > stock) {
          // Prevent adding if it exceeds stock
          console.warn(
            `Cannot add ${addQuantity} of ${action.payload.name}. Total quantity (${newQuantity}) exceeds stock (${stock}).`,
          )
          return state // Return current state without modification
        }
        newItems = state.items.map((item, index) =>
          index === existingItemIndex ? { ...item, quantity: newQuantity } : item,
        )
      } else {
        if (addQuantity > stock) {
          // Prevent adding if initial quantity exceeds stock
          console.warn(
            `Cannot add ${addQuantity} of ${action.payload.name}. Initial quantity exceeds stock (${stock}).`,
          )
          return state // Return current state without modification
        }
        newItems = [
          ...state.items,
          {
            ...action.payload,
            quantity: addQuantity,
            sizes: action.payload.sizes || [],
            colors: action.payload.colors || [],
            stock: stock, // Store the stock at the time of adding
          },
        ]
      }

      const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
      const shippingCost = calculateShippingCost(itemCount, state.deliveryMethod)
      const finalTotal = total + shippingCost

      return { ...state, items: newItems, total, itemCount, shippingCost, finalTotal }
    }

    case "REMOVE_ITEM": {
      const newItems = state.items.filter((item, index) => index !== action.payload)
      const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
      const shippingCost = calculateShippingCost(itemCount, state.deliveryMethod)
      const finalTotal = total + shippingCost

      return { ...state, items: newItems, total, itemCount, shippingCost, finalTotal }
    }

    case "UPDATE_QUANTITY": {
      const { id: itemIndex, quantity: newQuantity } = action.payload
      const itemToUpdate = state.items[itemIndex]

      if (!itemToUpdate) return state // Item not found

      if (newQuantity > itemToUpdate.stock) {
        // Prevent updating quantity if it exceeds stock
        console.warn(
          `Cannot update quantity for ${itemToUpdate.name}. New quantity (${newQuantity}) exceeds stock (${itemToUpdate.stock}).`,
        )
        return state // Return current state without modification
      }

      const newItems = state.items
        .map((item, index) => (index === itemIndex ? { ...item, quantity: Math.max(0, newQuantity) } : item))
        .filter((item) => item.quantity > 0)

      const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
      const shippingCost = calculateShippingCost(itemCount, state.deliveryMethod)
      const finalTotal = total + shippingCost

      return { ...state, items: newItems, total, itemCount, shippingCost, finalTotal }
    }

    case "SET_DELIVERY_METHOD": {
      const shippingCost = calculateShippingCost(state.itemCount, action.payload)
      const finalTotal = state.total + shippingCost

      return { ...state, deliveryMethod: action.payload, shippingCost, finalTotal }
    }

    case "CLEAR_CART":
      return {
        items: [],
        total: 0,
        itemCount: 0,
        deliveryMethod: "pickup",
        shippingCost: 0,
        finalTotal: 0,
      }

    case "LOAD_CART": {
      const total = action.payload.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const itemCount = action.payload.reduce((sum, item) => sum + item.quantity, 0)
      const shippingCost = calculateShippingCost(itemCount, state.deliveryMethod)
      const finalTotal = total + shippingCost

      return { ...state, items: action.payload, total, itemCount, shippingCost, finalTotal }
    }

    default:
      return state
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0,
    deliveryMethod: "pickup",
    shippingCost: 0,
    finalTotal: 0,
  })

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("shopping-cart")
    const savedDeliveryMethod = localStorage.getItem("delivery-method") as "pickup" | "delivery" | null

    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart)
        dispatch({ type: "LOAD_CART", payload: cartItems })
      } catch (error) {
        console.error("Error loading cart from localStorage:", error)
      }
    }

    if (savedDeliveryMethod) {
      dispatch({ type: "SET_DELIVERY_METHOD", payload: savedDeliveryMethod })
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("shopping-cart", JSON.stringify(state.items))
    localStorage.setItem("delivery-method", state.deliveryMethod)
  }, [state.items, state.deliveryMethod])

  return <CartContext.Provider value={{ state, dispatch }}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
