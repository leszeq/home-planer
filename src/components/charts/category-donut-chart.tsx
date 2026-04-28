'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface CategoryData {
  name: string
  value: number
  color: string
}

const COLORS: Record<string, string> = {
  materials: 'oklch(0.50 0.20 255)',
  labor: 'oklch(0.65 0.20 145)',
  other: 'oklch(0.72 0.20 55)',
}

const FALLBACK_COLORS = [
  'oklch(0.60 0.15 200)',
  'oklch(0.55 0.20 10)',
  'oklch(0.70 0.18 300)',
  'oklch(0.65 0.15 80)',
  'oklch(0.50 0.18 220)',
  'oklch(0.75 0.16 350)',
  'oklch(0.45 0.15 180)',
  'oklch(0.58 0.20 30)'
]

const LABELS: Record<string, string> = {
  materials: 'Materiały',
  labor: 'Robocizna',
  other: 'Inne',
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl p-3 shadow-lg border border-border text-sm">
        <p className="font-semibold">{payload[0].name}</p>
        <p className="font-bold" style={{ color: payload[0].payload.color }}>
          {payload[0].value.toLocaleString()} zł
        </p>
      </div>
    )
  }
  return null
}

export function CategoryDonutChart({ expenses }: { expenses: { category: string; amount: number }[] }) {
  const grouped = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount)
    return acc
  }, {})

  let colorIndex = 0

  const data: CategoryData[] = Object.entries(grouped)
    .sort((a, b) => b[1] - a[1]) // Sort large amounts first for better appearance
    .map(([cat, val]) => {
      let color = COLORS[cat]
      if (!color) {
        color = FALLBACK_COLORS[colorIndex % FALLBACK_COLORS.length]
        colorIndex++
      }
      return {
        name: LABELS[cat] ?? cat,
        value: val,
        color,
      }
    })

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm italic">
        Brak wydatków do wyświetlenia
      </div>
    )
  }

  return (
    <div className="w-full h-full min-h-[320px] flex items-center justify-center">
      <ResponsiveContainer width="100%" height={320}>
        <PieChart margin={{ top: 0, right: 0, bottom: 20, left: 0 }}>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={65}
            outerRadius={95}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ paddingTop: "20px" }}
            formatter={(value) => <span className="text-xs font-medium text-foreground">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
