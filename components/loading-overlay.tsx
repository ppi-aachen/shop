import { Loader2Icon } from "lucide-react"

interface LoadingOverlayProps {
  isLoading: boolean
  message?: string
}

export function LoadingOverlay({ isLoading, message = "Loading..." }: LoadingOverlayProps) {
  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex flex-col items-center rounded-lg bg-white p-8 shadow-xl">
        <Loader2Icon className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg font-medium text-gray-800">{message}</p>
      </div>
    </div>
  )
}
