"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
  description?: string
  selectedSize?: string
  selectedColor?: string
  sizes?: string[]
  colors?: string[]
  stock: number
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (id: string, size?: string, color?: string) => void
  updateQuantity: (id: string, quantity: number, size?: string, color?: string) => void
  clearCart: () => void
  getCartItemCount: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isClient, setIsClient] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setIsClient(true)
    if (typeof window !== "undefined") {
      const storedCart = localStorage.getItem("cart")
      if (storedCart) {
        setCart(JSON.parse(storedCart))
      }
    }
  }, [])

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("cart", JSON.stringify(cart))
    }
  }, [cart, isClient])

  const addToCart = useCallback(
    (item: CartItem) => {
      setCart((prevCart) => {
        const existingItemIndex = prevCart.findIndex(
          (cartItem) =>
            cartItem.id === item.id &&
            cartItem.selectedSize === item.selectedSize &&
            cartItem.selectedColor === item.selectedColor,
        )

        if (existingItemIndex > -1) {
          const updatedCart = [...prevCart]
          const existingItem = updatedCart[existingItemIndex]
          const newQuantity = existingItem.quantity + item.quantity

          if (newQuantity > existingItem.stock) {
            toast({
              title: "Insufficient Stock",
              description: `Cannot add ${item.quantity} more of ${item.name}. Only ${existingItem.stock - existingItem.quantity} available.`,
              variant: "destructive",
            })
            return prevCart // Return original cart if stock is insufficient
          }

          updatedCart[existingItemIndex] = {
            ...existingItem,
            quantity: newQuantity,
          }
          return updatedCart
        } else {
          if (item.quantity > item.stock) {
            toast({
              title: "Insufficient Stock",
              description: `Cannot add ${item.quantity} of ${item.name}. Only ${item.stock} available.`,
              variant: "destructive",
            })
            return prevCart // Return original cart if initial quantity is more than stock
          }
          return [...prevCart, item]
        }
      })
    },
    [toast],
  )

  const removeFromCart = useCallback((id: string, size?: string, color?: string) => {
    setCart((prevCart) =>
      prevCart.filter((item) => !(item.id === id && item.selectedSize === size && item.selectedColor === color)),
    )
  }, [])

  const updateQuantity = useCallback(
    (id: string, quantity: number, size?: string, color?: string) => {
      setCart(
        (prevCart) =>
          prevCart
            .map((item) => {
              if (item.id === id && item.selectedSize === size && item.selectedColor === color) {
                if (quantity > item.stock) {
                  toast({
                    title: "Insufficient Stock",
                    description: `Cannot set quantity to ${quantity} for ${item.name}. Only ${item.stock} available.`,
                    variant: "destructive",
                  })
                  return item // Return original item if stock is insufficient
                }
                return { ...item, quantity: Math.max(1, quantity) }
              }
              return item
            })
            .filter((item) => item.quantity > 0), // Remove if quantity becomes 0
      )
    },
    [toast],
  )

  const clearCart = useCallback(() => {
    setCart([])
  }, [])

  const getCartItemCount = useCallback(() => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }, [cart])

  const value = React.useMemo(
    () => ({
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartItemCount,
    }),
    [cart, addToCart, removeFromCart, updateQuantity, clearCart, getCartItemCount],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
