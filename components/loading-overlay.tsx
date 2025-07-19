import { Loader2Icon } from "lucide-react"

export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-75 backdrop-blur-sm">
      <div className="flex flex-col items-center">
        <Loader2Icon className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-gray-700">Processing your request...</p>
      </div>
    </div>
  )
}
