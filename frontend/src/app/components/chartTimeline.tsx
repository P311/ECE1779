"use client"

// reference: https://ui.shadcn.com/charts/line#charts
// The structure is same but content has changed a lot.
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { useState } from "react"

const GROUP_BY_OPTIONS = [
  { value: "minute", label: "Minute" },
  { value: "hour", label: "Hour" },
  { value: "day", label: "Day" },
  { value: "month", label: "Month" },
]

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
}: {
  data: Record<string, { time: string; count: number }[]>
}) {
  const [groupBy, setGroupBy] = useState("minute")
  const chartData = data[groupBy] ?? []

  return (
    <div>
        <Select value={groupBy} onValueChange={setGroupBy}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Group by" />
          </SelectTrigger>
          <SelectContent>
            {GROUP_BY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[300px] w-full mt-8"
        >
          <LineChart
            accessibilityLayer
            data={chartData}
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
    </div>
  )
}
