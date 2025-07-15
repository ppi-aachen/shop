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
  sizes?: string[]
  colors?: string[]
}

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
  shippingCost: number
  finalTotal: number
  deliveryMethod: "pickup" | "delivery"
}

type CartAction =
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "image"> & { image: string } }
  | { type: "REMOVE_ITEM"; payload: number }
  | { type: "UPDATE_QUANTITY"; payload: { id: number; quantity: number } }
  | { type: "SET_DELIVERY_METHOD"; payload: "pickup" | "delivery" }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartState }

const initialCartState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
  shippingCost: 0,
  finalTotal: 0,
  deliveryMethod: "pickup", // Default delivery method
}

const CartContext = createContext<{
  state: CartState
  dispatch: React.Dispatch<CartAction>
  getTotalPrice: () => number
}>({
  state: initialCartState,
  dispatch: () => null,
  getTotalPrice: () => 0,
})

const cartReducer = (state: CartState, action: CartAction): CartState => {
  let newItems = [...state.items]
  let newDeliveryMethod = state.deliveryMethod

  switch (action.type) {
    case "ADD_ITEM":
      const existingItemIndex = newItems.findIndex(
        (item) =>
          item.id === action.payload.id &&
          item.selectedSize === action.payload.selectedSize &&
          item.selectedColor === action.payload.selectedColor,
      )

      if (existingItemIndex > -1) {
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + action.payload.quantity,
        }
      } else {
        newItems.push({ ...action.payload })
      }
      break
    case "REMOVE_ITEM":
      newItems = newItems.filter((item) => item.id !== action.payload)
      break
    case "UPDATE_QUANTITY":
      newItems = newItems.map((item) =>
        item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item,
      )
      break
    case "SET_DELIVERY_METHOD":
      newDeliveryMethod = action.payload
      break
    case "CLEAR_CART":
      return initialCartState
    case "LOAD_CART":
      return action.payload
    default:
      return state
  }

  const newTotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
  const newShippingCost = newDeliveryMethod === "pickup" ? 0 : 5 // Recalculate based on new method
  const newFinalTotal = newTotal + newShippingCost

  return {
    ...state,
    items: newItems,
    total: newTotal,
    itemCount: newItemCount,
    shippingCost: newShippingCost,
    finalTotal: newFinalTotal,
    deliveryMethod: newDeliveryMethod,
  }
}

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, initialCartState)

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem("aachenStudioCart")
    if (storedCart) {
      try {
        const parsedCart: CartState = JSON.parse(storedCart)
        // Ensure loaded cart has all necessary fields, provide defaults if missing
        const validatedCart: CartState = {
          ...initialCartState,
          ...parsedCart,
          items: parsedCart.items || [],
          deliveryMethod: parsedCart.deliveryMethod || "pickup",
        }
        // Recalculate totals to ensure consistency
        const recalculatedTotal = validatedCart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
        const recalculatedItemCount = validatedCart.items.reduce((sum, item) => sum + item.quantity, 0)
        const recalculatedShippingCost = validatedCart.deliveryMethod === "pickup" ? 0 : 5
        const recalculatedFinalTotal = recalculatedTotal + recalculatedShippingCost

        dispatch({
          type: "LOAD_CART",
          payload: {
            ...validatedCart,
            total: recalculatedTotal,
            itemCount: recalculatedItemCount,
            shippingCost: recalculatedShippingCost,
            finalTotal: recalculatedFinalTotal,
          },
        })
      } catch (e) {
        console.error("Failed to parse cart from localStorage", e)
        // If parsing fails, clear corrupted data
        localStorage.removeItem("aachenStudioCart")
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("aachenStudioCart", JSON.stringify(state))
  }, [state])

  const getTotalPrice = () => state.total

  return <CartContext.Provider value={{ state, dispatch, getTotalPrice }}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
