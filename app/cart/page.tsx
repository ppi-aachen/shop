"use client"

import { Button } from "@/components/ui/button"
import { Card, CardFooter } from "@/components/ui/card"
import { useCart } from "@/lib/cart-context"
import { formatCurrency } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { MinusCircle, PlusCircle, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getProductImage } from "@/lib/image-utils"
import ShoppingCart from "@/components/icons/shopping-cart" // Added import for ShoppingCart

export default function CartPage() {
  const { state, dispatch } = useCart()
  const { toast } = useToast()

  const handleUpdateQuantity = (id: string, newQuantity: number, stock: number) => {
    if (newQuantity <= 0) {
      dispatch({ type: "REMOVE_ITEM", payload: id })
      toast({
        title: "Item Removed",
        description: "Product removed from your cart.",
      })
    } else if (newQuantity > stock) {
      toast({
        variant: "destructive",
        title: "Out of Stock",
        description: `Cannot add more. Only ${stock} available.`,
      })
    } else {
      dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity: newQuantity } })
      toast({
        title: "Quantity Updated",
        description: "Product quantity updated in your cart.",
      })
    }
  }

  const handleRemoveItem = (id: string, name: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id })
    toast({
      title: "Item Removed",
      description: `${name} removed from your cart.`,
    })
  }

  if (state.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 p-4">
        <ShoppingCart className="h-24 w-24 text-gray-400 mb-6" />
        <h2 className="text-3xl font-bold text-gray-800 mb-3">Your Cart is Empty</h2>
        <p className="text-gray-600 mb-8 text-center">Looks like you haven't added anything to your cart yet.</p>
        <Link href="/">
          <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
            Start Shopping
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Your Cart ({state.itemCount} items)</h2>
        <div className="space-y-4">
          {state.items.map((item) => (
            <Card key={item.id} className="flex items-center p-4 shadow-sm">
              <div className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden mr-4">
                <Image
                  src={getProductImage(item.image) || "/placeholder.svg"}
                  alt={item.name}
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <div className="flex-grow">
                <h3 className="font-semibold text-lg">{item.name}</h3>
                {item.selectedSize && <p className="text-sm text-gray-600">Size: {item.selectedSize}</p>}
                {item.selectedColor && <p className="text-sm text-gray-600">Color: {item.selectedColor}</p>}
                <p className="text-gray-800 font-medium mt-1">{formatCurrency(item.price)}</p>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1, item.stock)}
                >
                  <MinusCircle className="h-4 w-4" />
                </Button>
                <span className="font-medium w-8 text-center">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1, item.stock)}
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id, item.name)}>
                  <Trash2 className="h-5 w-5 text-red-500" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="md:col-span-1">
        <Card className="p-6 shadow-lg sticky top-24">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-2 text-gray-700">
            <div className="flex justify-between">
              <span>Subtotal ({state.itemCount} items)</span>
              <span>{formatCurrency(state.totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="flex justify-between font-bold text-xl text-gray-900 border-t pt-4 mt-4">
              <span>Total</span>
              <span>{formatCurrency(state.totalAmount)}</span>
            </div>
          </div>
          <CardFooter className="p-0 mt-6">
            <Link href="/checkout" className="w-full">
              <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white">
                Proceed to Checkout
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
