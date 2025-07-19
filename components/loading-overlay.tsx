"use client"

import { Loader2 } from "lucide-react"

interface LoadingOverlayProps {
  message?: string
}

export function LoadingOverlay({ message = "Processing your order..." }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center">
        <Loader2 className="h-12 w-12 text-green-600 animate-spin mb-4" />
        <p className="text-lg font-medium text-gray-800">{message}</p>
        <p className="text-sm text-gray-600 mt-2">Please do not close this window.</p>
      </div>
    </div>
  )
}
