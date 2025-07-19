"use client"

import { Loader2Icon } from "lucide-react"

interface LoadingOverlayProps {
  isLoading: boolean
  message?: string
}

export function LoadingOverlay({ isLoading, message = "Loading..." }: LoadingOverlayProps) {
  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="flex flex-col items-center p-6 rounded-lg bg-white shadow-xl">
        <Loader2Icon className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium text-gray-800">{message}</p>
      </div>
    </div>
  )
}
