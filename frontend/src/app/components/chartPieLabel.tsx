"use client"
// reference: https://ui.shadcn.com/charts/pie#charts
// The structure is same but content has changed a lot.
import { Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"


const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)"
]

export function ChartPieLabel({
  data,
  nameKey,
}: {
  data: any[]
  nameKey: string
}) {
  const chartData = data.map((d, i) => ({
    ...d,
    fill: COLORS[i % COLORS.length],
  }))

  const config: ChartConfig = Object.fromEntries([
    ["count", { label: "count" }],
    ...data.map((d, i) => [
      d[nameKey],
      { label: d[nameKey], color: COLORS[i % COLORS.length] },
    ]),
  ])

  return (
    <ChartContainer
      config={config}
      className="mx-auto mt-4 max-h-[400px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
    >
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Pie data={chartData} dataKey={"count"} nameKey={nameKey}
          label={({ [nameKey]: name, count }: any) => `${name}: ${count}`} />
      </PieChart>
    </ChartContainer>
  )
}
