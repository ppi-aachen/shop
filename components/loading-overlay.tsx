import { Loader2 } from "lucide-react"

export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 text-white">
        <Loader2 className="h-12 w-12 animate-spin" />
        <p className="text-lg font-medium">Processing your order...</p>
        <p className="text-sm">Please do not close this window.</p>
      </div>
    </div>
  )
}
