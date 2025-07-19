import { Loader2Icon } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-gray-100 p-4 text-center">
      <Loader2Icon className="h-12 w-12 animate-spin text-primary" />
      <h1 className="mt-6 text-3xl font-bold text-gray-800">Processing Your Order...</h1>
      <p className="mt-2 text-lg text-gray-600">Please wait while we confirm your payment and finalize your order.</p>
      <p className="mt-1 text-sm text-gray-500">This may take a few moments.</p>
    </div>
  )
}
