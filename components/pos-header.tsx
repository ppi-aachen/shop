"use client"

import { Button } from "@/components/ui/button"
import { X, Clock, Store } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useToast } from "@/hooks/use-toast"

interface POSHeaderProps {
  onClearCart: () => void
}

export function POSHeader({ onClearCart }: POSHeaderProps) {
  const { state } = useCart()
  const { toast } = useToast()

  const handleClearCart = () => {
    if (state.items.length > 0) {
      onClearCart()
    } else {
      toast({
        variant: "warning",
        title: "Cart Already Empty",
        description: "There are no items to clear.",
      })
    }
  }

  return (
    <header className="bg-white shadow-lg border-b-4 border-green-600">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Store className="h-8 w-8 text-green-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Aachen Studio POS</h1>
                <p className="text-gray-600">Point of Sale System</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Current Time</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">{new Date().toLocaleTimeString()}</p>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-600">Items in Cart</p>
              <p className="text-lg font-semibold text-green-600">{state.itemCount}</p>
            </div>
            
            <Button 
              variant="outline" 
              onClick={handleClearCart} 
              disabled={state.items.length === 0}
              className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
            >
              <X className="h-5 w-5 mr-2" />
              Clear Cart
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
