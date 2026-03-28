'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CategoryDonutChart } from "@/components/charts/category-donut-chart"
import { BarChart3, TrendingDown, TrendingUp, Layers, AlertTriangle, Filter } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "@/lib/i18n/LanguageContext"

interface Project {
  id: string
  name: string
  budget: number
}

interface Expense {
  amount: number
  category: string
  project_id: string
}

export function DashboardClientView({ 
  initialProjects, 
  allExpenses 
}: { 
  initialProjects: Project[]
  allExpenses: Expense[] 
}) {
  const { t } = useTranslation()
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([])

  const toggleProject = (projectId: string) => {
    setSelectedProjectIds(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    )
  }

  const toggleAll = () => {
    setSelectedProjectIds([])
  }

  // Obliczenia na postawie wybranych projektów
  const { filteredProjects, filteredExpenses, totalBudget, totalExpenses, remaining, progress, isNear, isOver } = useMemo(() => {
    const isFiltered = selectedProjectIds.length > 0
    
    const fProjects = isFiltered 
      ? initialProjects.filter(p => selectedProjectIds.includes(p.id)) 
      : initialProjects
      
    const fExpenses = isFiltered
      ? allExpenses.filter(e => selectedProjectIds.includes(e.project_id))
      : allExpenses

    const budget = fProjects.reduce((acc, p) => acc + (Number(p.budget) || 0), 0)
    const expenses = fExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0)
    const rem = budget - expenses
    const prog = budget > 0 ? (expenses / budget) * 100 : 0
    const near = prog >= 80 && prog < 100
    const over = expenses > budget

    return {
      filteredProjects: fProjects,
      filteredExpenses: fExpenses,
      totalBudget: budget,
      totalExpenses: expenses,
      remaining: rem,
      progress: prog,
      isNear: near,
      isOver: over
    }
  }, [initialProjects, allExpenses, selectedProjectIds])

  const stats = [
    {
      label: t('dashboard.stats.projects'),
      value: filteredProjects.length,
      icon: Layers,
      sub: selectedProjectIds.length > 0 ? t('dashboard.stats.selected_projects') : t('dashboard.stats.active_projects'),
      color: 'text-primary',
      bg: 'bg-[var(--primary-glow)]',
    },
    {
      label: t('dashboard.stats.total_budget'),
      value: `${totalBudget.toLocaleString()} zł`,
      icon: TrendingUp,
      sub: selectedProjectIds.length > 0 ? t('dashboard.stats.in_selected') : t('dashboard.stats.in_all'),
      color: 'text-primary',
      bg: 'bg-[var(--primary-glow)]',
    },
    {
      label: t('dashboard.stats.spent'),
      value: `${totalExpenses.toLocaleString()} zł`,
      icon: TrendingDown,
      sub: t('dashboard.stats.budget_usage', { progress: progress.toFixed(1) }),
      color: isOver ? 'text-destructive' : isNear ? 'text-[var(--accent-warm)]' : 'text-[var(--accent-green)]',
      bg: isOver ? 'bg-destructive/10' : isNear ? 'bg-[var(--accent-warm-glow)]' : 'bg-[var(--accent-green-glow)]',
    },
    {
      label: t('dashboard.stats.remaining'),
      value: `${remaining.toLocaleString()} zł`,
      icon: BarChart3,
      sub: t('dashboard.stats.to_use'),
      color: remaining < 0 ? 'text-destructive' : 'text-foreground',
      bg: remaining < 0 ? 'bg-destructive/10' : 'bg-secondary',
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header & Filter Bar */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('common.dashboard')}</h1>
        <p className="text-muted-foreground mt-1">{t('dashboard.investment_shortcut')}</p>
        
        {/* FILTERS */}
        {initialProjects.length > 0 && (
          <div className="mt-6 flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 mr-2 text-sm text-muted-foreground">
              <Filter className="w-4 h-4" />
              <span>{t('dashboard.filter')}</span>
            </div>
            
            <button
              onClick={toggleAll}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedProjectIds.length === 0 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'bg-secondary/50 hover:bg-secondary text-muted-foreground'
              }`}
            >
              {t('dashboard.stats.all')}
            </button>
            
            {initialProjects.map(project => {
              const isActive = selectedProjectIds.includes(project.id)
              return (
                <button
                  key={project.id}
                  onClick={() => toggleProject(project.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isActive 
                      ? 'bg-primary text-primary-foreground shadow-md' 
                      : 'bg-secondary/50 hover:bg-secondary text-muted-foreground border border-border/50'
                  }`}
                >
                  {project.name}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Budget Alert */}
      {(isNear || isOver) && totalBudget > 0 && (
        <div className={`flex items-center gap-3 p-4 rounded-xl text-sm font-medium animate-fade-in-up ${isOver ? 'bg-destructive/10 text-destructive border border-destructive/30' : 'bg-[var(--accent-warm-glow)] text-[var(--accent-warm)] border border-[var(--accent-warm)]/30'}`}>
          <AlertTriangle className="w-5 h-5 shrink-0" />
          {isOver
            ? t(selectedProjectIds.length > 0 ? 'dashboard.alerts.over_budget_plural' : 'dashboard.alerts.over_budget', { amount: Math.abs(remaining).toLocaleString() })
            : t('dashboard.alerts.near_limit', { progress: progress.toFixed(1) })}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => {
          const CardContentComp = (
            <Card key={s.label} className={`animate-fade-in-up delay-${i * 75} card-hover h-full`}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{s.label}</p>
                    <p className={`text-2xl font-bold mt-2 ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
                  </div>
                  <div className={`p-2.5 rounded-lg ${s.bg}`}>
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )

          if (s.label === 'Wydano') {
            return (
              <Link key={s.label} href="/dashboard/expenses" className="block h-full">
                {CardContentComp}
              </Link>
            )
          }

          return CardContentComp
        })}
      </div>

      {/* Charts & Projects Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category Chart */}
        <Card className="animate-fade-in-up delay-300 flex flex-col">
          <CardHeader>
            <CardTitle className="text-base">{t('dashboard.spending_by_category')}</CardTitle>
            <CardDescription>
              {selectedProjectIds.length > 0 ? t('dashboard.stats.in_selected') : t('dashboard.stats.in_all')}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            {filteredExpenses.length > 0 ? (
              <CategoryDonutChart expenses={filteredExpenses} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50 space-y-2 py-8">
                <BarChart3 className="w-8 h-8" />
                <p className="text-sm">{t('common.none')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card className="animate-fade-in-up delay-300">
          <CardHeader>
            <CardTitle className="text-base">
              {selectedProjectIds.length > 0 ? t('dashboard.stats.selected_projects') : t('dashboard.recent_projects')}
            </CardTitle>
            <CardDescription>{t('dashboard.investment_shortcut')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredProjects.length === 0 && (
              <p className="text-sm text-muted-foreground italic">{t('dashboard.no_projects_match')}</p>
            )}
            {filteredProjects.map((p) => {
              const budget = Number(p.budget) || 0
              return (
                <Link key={p.id} href={`/dashboard/projects/${p.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary transition-colors cursor-pointer group border border-border/30">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-8 rounded-full bg-primary/50 group-hover:bg-primary transition-colors" />
                      <div>
                        <p className="text-sm font-semibold">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{budget.toLocaleString()} zł {t('dashboard.budget_label')}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
