"use client"

import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle } from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
        {toasts.map(({ id, title, description, action, ...props }) => (
          <Toast
            key={id}
            title={title}         // Pass title directly as a prop
            description={description} // Pass description directly as a prop
            action={action}
            {...props}            // Ensure other props are spread
          >
            {/* Remove the redundant ToastTitle and ToastDescription children */}
            {action}
            <ToastClose />
          </Toast>
        ))}
      </div>
    </ToastProvider>
  )
}
