'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface StageExpenseData {
  name: string
  total: number
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl p-3 shadow-lg border border-border text-sm">
        <p className="font-semibold text-foreground mb-1">{label}</p>
        <p className="text-primary font-bold">{payload[0].value.toLocaleString()} zł</p>
      </div>
    )
  }
  return null
}

export function StageBarChart({ data }: { data: StageExpenseData[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.01 255)" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: 'oklch(0.52 0.02 255)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'oklch(0.52 0.02 255)' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v / 1000}k`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'oklch(0.95 0.01 255)' }} />
        <Bar dataKey="total" fill="oklch(0.50 0.20 255)" radius={[6, 6, 0, 0]} maxBarSize={60} />
      </BarChart>
    </ResponsiveContainer>
  )
}
