'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, TrendingUp, BarChart3, PieChart as PieChartIcon, Pencil, Check, X } from "lucide-react"
import { useTranslation } from "@/lib/i18n/LanguageContext"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { updateProjectBudget } from "@/app/(dashboard)/dashboard/projects/[id]/actions"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts"

interface ProjectStatsProps {
  project: any
  expenses: any[]
  stages: any[]
}

export function ProjectStatsClient({ project, expenses, stages }: ProjectStatsProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  
  const totalBudget = Number(project.budget) || 0
  const [newBudget, setNewBudget] = useState(totalBudget.toString())
  const [loading, setLoading] = useState(false)

  const totalExpenses = expenses.reduce((acc, e) => acc + Number(e.amount), 0) || 0
  const progressPercent = totalBudget > 0 ? Math.min((totalExpenses / totalBudget) * 100, 100) : 0
  const isOverBudget = totalExpenses > totalBudget
  const isNearLimit = totalExpenses > totalBudget * 0.8 && !isOverBudget

  const totalStages = stages.length
  const doneStages = stages.filter(s => s.status === 'done').length
  const inProgressStages = stages.filter(s => s.status === 'in_progress').length
  const donePercent = totalStages > 0 ? (doneStages / totalStages) * 100 : 0
  const progressPercentStages = totalStages > 0 ? (inProgressStages / totalStages) * 100 : 0

  const handleSaveBudget = async () => {
    const budgetNum = parseFloat(newBudget)
    if (isNaN(budgetNum)) return
    setLoading(true)
    const res = await updateProjectBudget(project.id, budgetNum)
    if (res.success) {
      queryClient.invalidateQueries({ queryKey: ['project', project.id] })
      toast.success(t('projects.budget_updated').replace('{{amount}}', budgetNum.toLocaleString()))
      setIsEditing(false)
    } else {
      toast.error(res.error || t('common.error'))
    }
    setLoading(false)
  }

  const getLocalizedCategory = (name: string) => {
    if (name === 'materials') return t('expenses.category_materials')
    if (name === 'labor') return t('expenses.category_labor')
    if (name === 'other') return t('expenses.category_other')
    return name
  }

  const categoryMap: Record<string, number> = {}
  expenses.forEach(e => {
    const key = e.category || 'other'
    categoryMap[key] = (categoryMap[key] || 0) + Number(e.amount)
  })

  const pieData = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1]) // largest first
    .map(([name, value]) => ({
      name: getLocalizedCategory(name),
      value
    }))

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#64748b']

  return (
    <div className="grid gap-6 md:grid-cols-3 group">
      {/* 1. Budget Card */}
      <Card className={cn("flex flex-col h-full", isOverBudget ? "border-destructive relative shadow-sm" : "")}>
        <CardHeader className="pb-2 flex-none">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            {t('projects.budget_status')}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col justify-between flex-1">
          <div>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input 
                  type="number" 
                  value={newBudget} 
                  onChange={e => setNewBudget(e.target.value)}
                  className="h-9 font-bold text-lg"
                  autoFocus
                />
                <Button size="icon" variant="ghost" className="h-8 w-8 text-[var(--accent-green)]" onClick={handleSaveBudget} disabled={loading}>
                  <Check className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => { setIsEditing(false); setNewBudget(totalBudget.toString()) }}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className={`text-2xl font-bold flex items-center justify-between ${isOverBudget ? "text-destructive" : isNearLimit ? "text-orange-500" : ""}`}>
                <span>{totalExpenses.toLocaleString()} / {totalBudget.toLocaleString()} zł</span>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0" onClick={() => setIsEditing(true)}>
                  <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
              </div>
            )}
            {isOverBudget && (
              <div className="mt-1 text-xs font-medium text-destructive">
                +{(totalExpenses - totalBudget).toLocaleString()} zł {t('projects.budget_exceeded')}
              </div>
            )}
          </div>
          
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              {!isOverBudget && <span>{t('projects.safe', { percent: progressPercent.toFixed(1) })}</span>}
              <span className={isOverBudget ? 'text-destructive font-semibold' : isNearLimit ? 'text-orange-500 font-semibold' : ''}>
                {isOverBudget ? t('projects.over_budget_msg') : isNearLimit ? t('projects.near_limit_msg') : t('projects.on_track_msg')}
              </span>
            </div>
            <Progress 
              value={progressPercent} 
              className={cn("h-2", isOverBudget ? "[&>div]:bg-destructive" : isNearLimit ? "[&>div]:bg-orange-500" : "")} 
            />
            {isNearLimit && !isOverBudget && (
              <div className="mt-2 p-2 rounded-lg flex items-center justify-center gap-1.5 text-[10px] font-medium bg-orange-500/10 text-orange-600">
                <AlertTriangle className="w-3 h-3" />
                {t('projects.budget_warning')}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* 2. Stages Card */}
      <Card className="flex flex-col h-full">
        <CardHeader className="pb-2 flex-none">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            {t('projects.stage_progress')}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col justify-center flex-1">
          <div className="flex justify-between items-end mb-4">
            <div>
              <div className="text-2xl font-bold flex items-end gap-1">
                {doneStages}
                <span className="text-sm font-normal text-muted-foreground mb-1">/ {totalStages}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{t('projects.status_done')}</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-primary flex items-end gap-1 justify-end">
                {inProgressStages}
                <span className="text-xs font-normal text-muted-foreground mb-1">/ {totalStages}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5 uppercase">{t('projects.status_in_progress')}</p>
            </div>
          </div>
          
          <div className="mt-auto">
            {/* Custom Multi-Segment Progress Bar */}
            <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-[var(--accent-green)] transition-all duration-500 ease-in-out" 
                style={{ width: `${donePercent}%` }}
                title={`${doneStages} ukończone`}
              />
              <div 
                className="h-full bg-primary transition-all duration-500 ease-in-out" 
                style={{ width: `${progressPercentStages}%` }}
                title={`${inProgressStages} w trakcie`}
              />
            </div>
            <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Categories Card (PieChart) */}
      <Card className="flex flex-col h-full">
        <CardHeader className="pb-2 flex-none">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-muted-foreground" />
            {t('common.expenses')}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center -mt-2">
          {pieData.length > 0 ? (
            <div className="w-full h-[120px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value: any) => `${Number(value).toLocaleString()} zł`}
                    contentStyle={{ borderRadius: '8px', fontSize: '12px', padding: '4px 8px', borderColor: 'var(--border)' }}
                    itemStyle={{ color: 'var(--foreground)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                 <p className="text-[10px] text-muted-foreground leading-none">{t('common.expenses')}</p>
                 <p className="text-xs font-bold leading-tight mt-0.5">{totalExpenses > 1000 ? `${(totalExpenses/1000).toFixed(1)}k` : totalExpenses}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-muted-foreground h-full py-8">
               <PieChartIcon className="w-8 h-8 opacity-20 mb-2" />
               <span className="text-xs">{t('expenses.no_expenses')}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export function ProjectHeaderClient({ name }: { name: string }) {
  const { t } = useTranslation()
  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight">{name}</h2>
      <p className="text-muted-foreground italic print:hidden">{t('projects.summary_subtitle')}</p>
    </div>
  )
}
