import { Loader2Icon } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
      <Loader2Icon className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-lg text-gray-600">Loading order details...</p>
    </div>
  )
}
