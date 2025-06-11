// src/components/ui/loading-popup.tsx
"use client"

import type React from "react"
import { Loader2 } from "lucide-react"

interface LoadingPopupProps {
  isSubmitting: boolean
}

export function LoadingPopup({ isSubmitting }: LoadingPopupProps) {
  // If not submitting, render nothing
  if (!isSubmitting) {
    return null
  }

  return (
    // Full-screen overlay
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* Popup content box */}
      <div className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Processing Order...</h3>
        <p className="text-sm text-gray-600">Please do not close or refresh the page.</p>
      </div>
    </div>
  )
}

// export default function Loading() {
//  return null
//}
