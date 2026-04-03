'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, TrendingUp, BarChart3, PieChart, Pencil, Check, X } from "lucide-react"
import { useTranslation } from "@/lib/i18n/LanguageContext"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { updateProjectBudget } from "@/app/(dashboard)/dashboard/projects/[id]/actions"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface ProjectStatsProps {
  totalBudget: number
  totalExpenses: number
  progressPercent: number
  isOverBudget: boolean
  isNearLimit: boolean
  doneStages: number
  totalStages: number
  largestCategory: string
  projectId: string
}

export function ProjectStatsClient({
  totalBudget,
  totalExpenses,
  progressPercent,
  isOverBudget,
  isNearLimit,
  doneStages,
  totalStages,
  largestCategory,
  projectId
}: ProjectStatsProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [newBudget, setNewBudget] = useState(totalBudget.toString())
  const [loading, setLoading] = useState(false)

  const handleSaveBudget = async () => {
    const budgetNum = parseFloat(newBudget)
    if (isNaN(budgetNum)) return
    setLoading(true)
    const res = await updateProjectBudget(projectId, budgetNum)
    if (res.success) {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      toast.success(t('projects.budget_updated').replace('{{amount}}', budgetNum.toLocaleString()))
      setIsEditing(false)
    } else {
      toast.error(res.error || t('common.error'))
    }
    setLoading(false)
  }

  const localizedCategory = largestCategory === 'materials' ? t('expenses.category_materials') :
                            largestCategory === 'labor' ? t('expenses.category_labor') :
                            largestCategory === 'other' ? t('expenses.category_other') :
                            largestCategory

  return (
    <div className="flex flex-col gap-6">
      <Card className={isOverBudget ? "border-destructive border-2" : ""}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            {t('projects.budget_status')}
          </CardTitle>
        </CardHeader>
        <CardContent>
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
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity ml-2" onClick={() => setIsEditing(true)}>
                <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
            </div>
          )}
          {isOverBudget && (
            <div className="mt-2 text-sm font-bold text-destructive">
              +{(totalExpenses - totalBudget).toLocaleString()} zł {t('projects.budget_exceeded')}
            </div>
          )}
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
          </div>
          {isNearLimit && !isOverBudget && (
            <div className="mt-4 p-3 rounded-lg flex items-center gap-2 text-xs font-medium bg-orange-500/10 text-orange-600">
              <AlertTriangle className="w-4 h-4" />
              {t('projects.budget_warning')}
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
