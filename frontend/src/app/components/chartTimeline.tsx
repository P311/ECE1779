"use client"

// reference: https://ui.shadcn.com/charts/line#charts
// The structure is same but content has changed a lot.
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const chartConfig = {
  count: {
    label: "Events",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

function formatTime(value: string, groupBy: string) {
  if (groupBy === "month") return value
  if (groupBy === "day") {
    const date = new Date(value)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }
  // hour or minute
  const date = new Date(value)
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function ChartTimeline({
  data,
  groupBy,
}: {
  data: { time: string; count: number }[]
  groupBy: string
}) {
  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto h-[300px] w-full mt-8"
    >
      <LineChart
        accessibilityLayer
        data={data}
        margin={{ left: 12, right: 12 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="time"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
          tickFormatter={(value) => formatTime(value, groupBy)}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              className="w-[150px]"
              nameKey="count"
              labelFormatter={(value) => formatTime(value, groupBy)}
            />
          }
        />
        <Line
          dataKey="count"
          type="monotone"
          stroke="var(--color-count)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  )
}
