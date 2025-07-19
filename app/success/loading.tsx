import { Loader2Icon } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
      <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
      <p className="ml-2 text-lg">Loading order details...</p>
    </div>
  )
}
