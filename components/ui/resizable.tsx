"use client"

import type React from "react"

import { Resizable as ResizablePrimitive } from "react-resizable-panels"

import { cn } from "@/lib/utils"

const ResizablePanelGroup = ({ className, ...props }: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => (
  <ResizablePrimitive.PanelGroup
    className={cn("flex h-full w-full data-[panel-group-direction=vertical]:flex-col", className)}
    {...props}
  />
)

const ResizablePanel = ResizablePrimitive.Panel

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelHandle> & {
  withHandle?: boolean
}) => (
  <ResizablePrimitive.PanelHandle
    className={cn(
      "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:inset-x-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:-translate-y-1/2",
      withHandle &&
        "after:bg-border after:opacity-0 hover:after:opacity-100 hover:data-[panel-group-direction=vertical]:after:data-[panel-group-direction=vertical]:bg-border data-[panel-group-direction=vertical]:after:bg-border data-[panel-group-direction=vertical]:hover:after:opacity-100",
      className,
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-4 w-4 items-center justify-center rounded-full border bg-background">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          className="h-2.5 w-2.5"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    )}
  </ResizablePrimitive.PanelHandle>
)

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
