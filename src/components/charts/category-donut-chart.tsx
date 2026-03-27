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

  const data: CategoryData[] = Object.entries(grouped).map(([cat, val]) => ({
    name: LABELS[cat] ?? cat,
    value: val,
    color: COLORS[cat] ?? '#888',
  }))

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm italic">
        Brak wydatków do wyświetlenia
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={4}
          dataKey="value"
          strokeWidth={0}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => <span className="text-xs font-medium text-foreground">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
