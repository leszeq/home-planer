'use client'

import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts'
import { BarChart3 } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/LanguageContext'

interface StagesCostChartProps {
  expenses: { stage_id: string | null; amount: number }[]
  stages: { id: string; name: string }[]
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899', '#64748b']

export function StagesCostChart({ expenses, stages }: StagesCostChartProps) {
  const { t } = useTranslation()

  const data = useMemo(() => {
    // Initialize map with all stages (so even stages with 0 costs show up, optional but good for context)
    const costMap = new Map<string | null, number>()
    stages.forEach(s => costMap.set(s.id, 0))
    costMap.set(null, 0)

    // Aggregate costs
    expenses.forEach(e => {
      const current = costMap.get(e.stage_id) || 0
      costMap.set(e.stage_id, current + Number(e.amount || 0))
    })

    // Format for Recharts
    const result = Array.from(costMap.entries()).map(([stageId, amount]) => {
      const stageName = stageId 
        ? stages.find(s => s.id === stageId)?.name || t('common.unknown', { defaultValue: 'Nieznany' })
        : t('expenses.no_stage', { defaultValue: 'Bez etapu' })

      return {
        name: stageName,
        amount: Number(amount.toFixed(2))
      }
    })

    // Filter out stages with 0 expenses to keep the chart clean, unless you want all
    return result.filter(item => item.amount > 0).sort((a, b) => b.amount - a.amount)
  }, [expenses, stages, t])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border/50 p-3 rounded-lg shadow-xl">
          <p className="font-bold text-sm mb-1">{label}</p>
          <p className="text-primary font-bold">
            {Number(payload[0].value).toLocaleString()} {t('dashboard.stats.currency', { defaultValue: 'zł' })}
          </p>
        </div>
      )
    }
    return null
  }

  if (data.length === 0) {
    return null
  }

  return (
    <Card className="flex flex-col h-full group">
      <CardHeader className="pb-2 flex-none">
        <CardTitle className="text-sm font-medium flex items-center gap-2" title={t('expenses.stages_chart_desc', { defaultValue: 'Podsumowanie wydatków przypisanych do poszczególnych etapów budowy.' })}>
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
          {t('expenses.stages_chart_title', { defaultValue: 'Koszty według etapów' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-[120px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
            <XAxis 
              dataKey="name" 
              tick={false}
              axisLine={{ stroke: 'currentColor', opacity: 0.2 }}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.7 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value.toLocaleString()}`}
            />
            <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'currentColor', opacity: 0.05 }} />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]} barSize={32}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
