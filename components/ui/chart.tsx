"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Workaround for https://github.com/recharts/recharts/issues/3615
const Tooltip = ({
  active,
  payload,
  label,
  formatter,
  content,
  className,
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> & {
  formatter?: (value: any, name: string, props: any) => React.ReactNode | [React.ReactNode, string]
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className={cn("rounded-lg border bg-background p-2 shadow-sm", className)}>
        <p className="text-sm font-medium">{label}</p>
        {content ? (
          content({ active, payload, label })
        ) : (
          <div className="grid gap-1">
            {payload.map((item: any, i: number) => (
              <div key={item.dataKey || i} className="flex items-center gap-2">
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                <div className="flex flex-1 justify-between">
                  {item.name && <p className="text-sm text-muted-foreground">{item.name}:</p>}
                  <p className="text-sm font-medium">
                    {formatter ? formatter(item.value, item.name, item) : item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return null
}

const ChartContext = React.createContext<
  | {
      data: Record<string, any>[]
      categories: string[]
      index: string
      colors: string[]
      yAxisDomain?: [number | string, number | string]
    }
  | undefined
>(undefined)

type ChartProps = React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer> & {
  data: Record<string, any>[]
  categories: string[]
  index: string
  colors?: string[]
  yAxisDomain?: [number | string, number | string]
}

const Chart = React.forwardRef<HTMLDivElement, ChartProps>(
  (
    {
      data,
      categories,
      index,
      colors = [
        "hsl(var(--chart-1))",
        "hsl(var(--chart-2))",
        "hsl(var(--chart-3))",
        "hsl(var(--chart-4))",
        "hsl(var(--chart-5))",
      ],
      yAxisDomain,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const customColors = React.useMemo(() => {
      return colors.map((color) => `var(${color})`)
    }, [colors])

    return (
      <ChartContext.Provider
        value={{
          data,
          categories,
          index,
          colors: customColors,
          yAxisDomain,
        }}
      >
        <div ref={ref} className={cn("h-[400px] w-full", className)}>
          <RechartsPrimitive.ResponsiveContainer {...props}>{children}</RechartsPrimitive.ResponsiveContainer>
        </div>
      </ChartContext.Provider>
    )
  },
)

Chart.displayName = "Chart"

const ChartTooltip = ({ ...props }: React.ComponentProps<typeof Tooltip>) => {
  const chart = useChart()
  return (
    <RechartsPrimitive.Tooltip
      cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
      content={<Tooltip className="bg-background text-foreground" formatter={props.formatter} {...props} />}
      {...props}
    />
  )
}

const ChartLegend = ({ ...props }: React.ComponentProps<typeof RechartsPrimitive.Legend>) => {
  return (
    <RechartsPrimitive.Legend
      wrapperStyle={{ paddingTop: 10 }}
      itemClassName="text-sm font-medium text-muted-foreground"
      formatter={(value) => <span className="text-foreground">{value}</span>}
      {...props}
    />
  )
}

const ChartCrosshair = ({ ...props }: React.ComponentProps<typeof RechartsPrimitive.ReferenceLine>) => {
  return (
    <RechartsPrimitive.ReferenceLine stroke="hsl(var(--border))" strokeDasharray="4 4" strokeWidth={1} {...props} />
  )
}

const useChart = () => {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a <Chart />")
  }
  return context
}

export { Chart, ChartTooltip, ChartLegend, ChartCrosshair, useChart }
