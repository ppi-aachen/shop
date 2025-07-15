"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Workaround for https://github.com/recharts/recharts/issues/3615
const Tooltip = <TValue extends RechartsPrimitive.Value, TName extends RechartsPrimitive.Name>({
  cursor,
  children,
  className,
  ...props
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip<TValue, TName>>) => {
  return (
    <RechartsPrimitive.Tooltip cursor={cursor} wrapperClassName={cn("!bg-transparent", className)} {...props}>
      {children}
    </RechartsPrimitive.Tooltip>
  )
}

const ChartContext = React.createContext<
  | {
      config: Record<string, { color?: string; icon?: string }>
    }
  | undefined
>(undefined)

type ChartProps = React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer> & {
  config: ChartConfig
}

function Chart({ config, className, children, ...props }: ChartProps) {
  return (
    <ChartContext.Provider value={{ config }}>
      <RechartsPrimitive.ResponsiveContainer className={cn("h-[--chart-height]", className)} {...props}>
        {children}
      </RechartsPrimitive.ResponsiveContainer>
    </ChartContext.Provider>
  )
}

type ChartConfig = Record<string, { color?: string; icon?: string }>

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <Chart />")
  }

  return context
}

const ChartTooltip = ({
  active,
  payload,
  className,
  formatter,
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> & {
  formatter?: (value: number, name: string, props: RechartsPrimitive.Payload<any, any>) => [string, string]
}) => {
  const { config } = useChart()

  if (active && payload && payload.length) {
    const item = payload[0]
    const { name, value } = item
    const color = config[name as string]?.color

    return (
      <div className={cn("rounded-lg border bg-background p-2 text-sm shadow-md", className)}>
        {formatter ? (
          <div className="grid gap-1">
            {payload.map((item, i) => (
              <div key={item.dataKey} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className={cn("h-3 w-3 shrink-0 rounded-full", color)} />
                  <span className="text-muted-foreground">{formatter(value as number, name as string, item)[1]}</span>
                </div>
                <span className="font-medium text-foreground">
                  {formatter(value as number, name as string, item)[0]}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-1">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className={cn("h-3 w-3 shrink-0 rounded-full", color)} />
                <span className="text-muted-foreground">{name}</span>
              </div>
              <span className="font-medium text-foreground">{value}</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  return null
}

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> &
    Pick<RechartsPrimitive.TooltipProps<any, any>, "active" | "payload" | "formatter">
>(({ active, payload, className, formatter, ...props }, ref) => {
  const { config } = useChart()

  if (active && payload && payload.length) {
    return (
      <div
        ref={ref}
        className={cn("grid gap-1.5 rounded-lg border bg-background px-3 py-2 text-sm shadow-md", className)}
        {...props}
      >
        {payload.map((item) => {
          const key = item.dataKey as keyof typeof config

          const name = config[key]?.label || item.name
          const color = config[key]?.color

          if (!color) {
            return null
          }

          return (
            <div key={item.dataKey} className="flex items-center justify-between gap-x-4">
              <div className="flex items-center gap-x-2">
                <span className={cn("flex h-3 w-3 shrink-0 rounded-full", color)} />
                <span className="text-muted-foreground">{name}</span>
              </div>
              <span className="font-mono font-medium text-foreground">
                {formatter ? formatter(item.value, name, item) : item.value}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  return null
})
ChartTooltipContent.displayName = "ChartTooltipContent"

export { Chart, ChartTooltip, ChartTooltipContent, useChart }
