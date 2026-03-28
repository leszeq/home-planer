'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, TrendingUp, BarChart3, PieChart } from "lucide-react"
import { useTranslation } from "@/lib/i18n/LanguageContext"
import { cn } from "@/lib/utils"

interface ProjectStatsProps {
  totalBudget: number
  totalExpenses: number
  progressPercent: number
  isOverBudget: boolean
  isNearLimit: boolean
  doneStages: number
  totalStages: number
  largestCategory: string
}

export function ProjectStatsClient({
  totalBudget,
  totalExpenses,
  progressPercent,
  isOverBudget,
  isNearLimit,
  doneStages,
  totalStages,
  largestCategory
}: ProjectStatsProps) {
  const { t } = useTranslation()

  const localizedCategory = largestCategory === 'materials' ? t('expenses.category_materials') :
                            largestCategory === 'labor' ? t('expenses.category_labor') :
                            largestCategory === 'other' ? t('expenses.category_other') :
                            largestCategory

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className={isOverBudget ? "border-destructive border-2" : ""}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            {t('projects.budget_status')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${isOverBudget ? "text-destructive" : isNearLimit ? "text-orange-500" : ""}`}>
            {totalExpenses.toLocaleString()} / {totalBudget.toLocaleString()} zł
          </div>
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t('projects.safe', { percent: progressPercent.toFixed(1) })}</span>
              <span>{isOverBudget ? t('projects.over_budget_msg') : isNearLimit ? t('projects.near_limit_msg') : t('projects.on_track_msg')}</span>
            </div>
            <Progress 
              value={progressPercent} 
              className={cn("h-2", isOverBudget ? "[&>div]:bg-destructive" : isNearLimit ? "[&>div]:bg-orange-500" : "")} 
            />
          </div>
          {(isOverBudget || isNearLimit) && (
            <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 text-xs font-medium ${isOverBudget ? "bg-destructive/10 text-destructive" : "bg-orange-500/10 text-orange-600"}`}>
              <AlertTriangle className="w-4 h-4" />
              {isOverBudget ? t('projects.budget_exceeded') : t('projects.budget_warning')}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            {t('projects.stage_progress')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {doneStages} / {totalStages}
          </div>
          <p className="text-xs text-muted-foreground mt-1 text-center">{t('projects.completed_stages')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <PieChart className="w-4 h-4 text-muted-foreground" />
            {t('projects.largest_category')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold capitalize">
            {localizedCategory}
          </div>
          <p className="text-xs text-muted-foreground mt-1 text-center">{t('projects.highest_spending')}</p>
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
