"use client"

import type React from "react"
import { createContext, useReducer, useContext, useEffect } from "react"

interface CartItem {
  id: number
  name: string
  price: number
  image: string
  quantity: number
  selectedSize?: string
  selectedColor?: string
  sizes?: string[] // Add sizes to cart item for validation
  colors?: string[] // Add colors to cart item for validation
}

interface CartState {
  items: CartItem[]
  itemCount: number
  total: number
  shippingCost: number
  finalTotal: number
  deliveryMethod: "pickup" | "delivery"
}

type CartAction =
  | { type: "ADD_TO_CART"; payload: CartItem }
  | { type: "REMOVE_FROM_CART"; payload: number } // payload is item id
  | { type: "UPDATE_QUANTITY"; payload: { id: number; quantity: number } }
  | { type: "SET_DELIVERY_METHOD"; payload: "pickup" | "delivery" }
  | { type: "LOAD_CART"; payload: CartState }
  | { type: "CLEAR_CART" }

const initialState: CartState = {
  items: [],
  itemCount: 0,
  total: 0,
  shippingCost: 0,
  finalTotal: 0,
  deliveryMethod: "pickup", // Default to pickup
}

const CartContext = createContext<{
  state: CartState
  dispatch: React.Dispatch<CartAction>
}>({
  state: initialState,
  dispatch: () => null,
})

function cartReducer(state: CartState, action: CartAction): CartState {
  let updatedItems: CartItem[]
  let newDeliveryMethod = state.deliveryMethod

  switch (action.type) {
    case "ADD_TO_CART":
      const existingItemIndex = state.items.findIndex(
        (item) =>
          item.id === action.payload.id &&
          item.selectedSize === action.payload.selectedSize &&
          item.selectedColor === action.payload.selectedColor,
      )

      if (existingItemIndex > -1) {
        updatedItems = state.items.map((item, index) =>
          index === existingItemIndex ? { ...item, quantity: item.quantity + action.payload.quantity } : item,
        )
      } else {
        updatedItems = [...state.items, action.payload]
      }
      break
    case "REMOVE_FROM_CART":
      updatedItems = state.items.filter((item) => item.id !== action.payload)
      break
    case "UPDATE_QUANTITY":
      updatedItems = state.items
        .map((item) => (item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item))
        .filter((item) => item.quantity > 0) // Remove if quantity drops to 0
      break
    case "SET_DELIVERY_METHOD":
      newDeliveryMethod = action.payload
      updatedItems = state.items // Items don't change, only delivery method
      break
    case "LOAD_CART":
      return action.payload // Load entire state from payload
    case "CLEAR_CART":
      return initialState // Reset to initial state
    default:
      return state
  }

  const newItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0)
  const newSubtotal = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const newShippingCost = newDeliveryMethod === "pickup" ? 0 : 5 // Recalculate based on new method
  const newFinalTotal = newSubtotal + newShippingCost

  return {
    ...state,
    items: updatedItems,
    itemCount: newItemCount,
    total: newSubtotal,
    shippingCost: newShippingCost,
    finalTotal: newFinalTotal,
    deliveryMethod: newDeliveryMethod,
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Load cart from localStorage on initial mount
  useEffect(() => {
    const savedCart = localStorage.getItem("aachen_studio_cart")
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        dispatch({ type: "LOAD_CART", payload: parsedCart })
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error)
        // Optionally clear corrupted cart
        localStorage.removeItem("aachen_studio_cart")
      }
    }
  }, [])

  // Save cart to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem("aachen_studio_cart", JSON.stringify(state))
  }, [state])

  return <CartContext.Provider value={{ state, dispatch }}>{children}</CartContext.Provider>
}

export function useCart() {
  return useContext(CartContext)
}
