"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"
import { cn } from "@/lib/utils"

// Workaround for https://github.com/recharts/recharts/issues/3615
const Customized = <T extends abstract new (...args: any) => any>(Component: T) => {
  return React.memo((props: React.ComponentProps<T>) => <Component {...props} />) as T
}

const defaultValue = {
  color: [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "hsl(var(--chart-6))",
  ],
}

const ChartContext = React.createContext<
  React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer> & {
    /**
     * The color palette for the chart.
     */
    color?: string[]
  }
>(defaultValue)

function Chart({
  color,
  ...props
}: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer> & {
  /**
   * The color palette for the chart.
   */
  color?: string[]
}) {
  return (
    <ChartContext.Provider value={{ color, ...props }}>
      <RechartsPrimitive.ResponsiveContainer {...props} />
    </ChartContext.Provider>
  )
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof Chart> & React.ComponentPropsWithoutRef<"div">
>(({ className, children, ...props }, ref) => {
  const {
    color: colorPalette = [
      "hsl(var(--chart-1))",
      "hsl(var(--chart-2))",
      "hsl(var(--chart-3))",
      "hsl(var(--chart-4))",
      "hsl(var(--chart-5))",
      "hsl(var(--chart-6))",
    ],
    ...chartProps
  } = props
  return (
    <div ref={ref} className={cn("flex aspect-video justify-center text-foreground", className)} {...props}>
      <Chart color={colorPalette} {...chartProps}>
        {children}
      </Chart>
    </div>
  )
})
ChartContainer.displayName = "Chart"

const useChart = () => React.useContext(ChartContext)

const ChartTooltip = ({
  className,
  ...props
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> & React.ComponentPropsWithoutRef<"div">) => {
  const { color } = useChart()

  return (
    <RechartsPrimitive.Tooltip
      cursor={false}
      content={({ active, payload, label }) => {
        if (active && payload && payload.length) {
          return (
            <div
              className={cn(
                "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-3 py-2 text-sm shadow-md",
                className,
              )}
              {...props}
            >
              {label ? <div className="text-muted-foreground">{label}</div> : null}
              <div className="grid gap-1">
                {payload.map((item, i) => {
                  const [itemValue, itemLabel] =
                    typeof item.value === "object"
                      ? item.value instanceof Date
                        ? [item.value.toLocaleDateString(), item.name]
                        : [JSON.stringify(item.value), item.name]
                      : [item.value, item.name]

                  return (
                    <div key={item.dataKey || i} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        {item.color ? (
                          <span
                            className="flex h-3 w-3 rounded-full"
                            style={{
                              backgroundColor: item.color,
                            }}
                          />
                        ) : color?.[i] ? (
                          <span
                            className="flex h-3 w-3 rounded-full"
                            style={{
                              backgroundColor: color[i],
                            }}
                          />
                        ) : null}
                        <span className="text-muted-foreground">{itemLabel}</span>
                      </div>
                      <span className="font-bold text-foreground">{itemValue}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        }

        return null
      }}
      {...props}
    />
  )
}

const ChartLegend = ({
  className,
  ...props
}: React.ComponentProps<typeof RechartsPrimitive.Legend> & React.ComponentPropsWithoutRef<"div">) => {
  return (
    <RechartsPrimitive.Legend
      content={({ payload }) => {
        if (payload && payload.length) {
          return (
            <div className={cn("flex flex-wrap items-center justify-center gap-4", className)} {...props}>
              {payload.map((item, i) => {
                if (item.inactive) {
                  return null
                }

                return (
                  <div key={item.value} className="flex items-center gap-1.5">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{
                        backgroundColor: item.color,
                      }}
                    />
                    <span className="text-xs text-muted-foreground">{item.value}</span>
                  </div>
                )
              })}
            </div>
          )
        }

        return null
      }}
      {...props}
    />
  )
}

const ChartTooltipContent = Customized(ChartTooltip)
const ChartLegendContent = Customized(ChartLegend)

export { Chart, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent }
