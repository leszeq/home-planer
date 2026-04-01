'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Filter, Search, Receipt } from "lucide-react"
import { useTranslation } from "@/lib/i18n/LanguageContext"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Project {
  id: string
  name: string
}

interface Expense {
  id: string
  date: string
  amount: number
  description: string
  category: string
  project_id: string
  projects?: { name: string }
}

import { cn } from "@/lib/utils"

export function ExpensesClientView({ 
  initialExpenses, 
  projects,
  hideHeader = false
}: { 
  initialExpenses: Expense[]
  projects: Project[]
  hideHeader?: boolean
}) {
  const { t } = useTranslation()
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredExpenses = useMemo(() => {
    return initialExpenses.filter(expense => {
      const matchesProject = selectedProjectId === 'all' || expense.project_id === selectedProjectId
      const matchesSearch = expense.description?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           expense.projects?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           expense.category.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesProject && matchesSearch
    })
  }, [initialExpenses, selectedProjectId, searchQuery])

  const totalAmount = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0)

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {!hideHeader && (
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('expenses.global.title')}</h2>
          <p className="text-muted-foreground">{t('expenses.global.subtitle')}</p>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-card p-4 rounded-xl border border-border/50 shadow-sm">
        <div className="flex items-center gap-3 flex-1 w-full max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('expenses.global.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-secondary/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground hidden sm:inline-block">
              {t('dashboard.filter')}
            </span>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger className="w-full sm:w-[200px] h-10 rounded-lg font-medium">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 opacity-50" />
                  <SelectValue placeholder={t('expenses.global.all_projects')} />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('expenses.global.all_projects')}</SelectItem>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Summary Row */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Receipt className="w-4 h-4" />
          <span>{t('expenses.global.found_count', { count: filteredExpenses.length })}</span>
        </div>
        <div className="text-sm">
          <span className="text-muted-foreground">{t('expenses.global.total_sum')}</span>
          <span className="font-bold text-primary text-lg">{totalAmount.toLocaleString()} {t('dashboard.stats.currency', { defaultValue: 'zł' })}</span>
        </div>
      </div>

      {/* Expenses Table/List */}
      <Card className="overflow-hidden border-border/50 shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-secondary/20">
                <th className="p-4 text-left font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">{t('expenses.global.table.date')}</th>
                <th className="p-4 text-left font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">{t('expenses.global.table.project')}</th>
                <th className="p-4 text-left font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">{t('expenses.global.table.description')}</th>
                <th className="p-4 text-left font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">{t('expenses.global.table.category')}</th>
                <th className="p-4 text-right font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">{t('expenses.global.table.amount')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-muted-foreground italic bg-secondary/5">
                    {t('expenses.global.no_results')}
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-secondary/30 transition-colors group">
                    <td className="p-4 text-muted-foreground">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-6 rounded-full bg-primary/30 group-hover:bg-primary transition-colors" />
                        <span className="font-medium">{expense.projects?.name}</span>
                      </div>
                    </td>
                    <td className="p-4">{expense.description || t('expenses.global.no_description')}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter bg-secondary text-muted-foreground border border-border/50">
                        {expense.category}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold tabular-nums text-foreground">
                      {Number(expense.amount).toLocaleString()} {t('dashboard.stats.currency', { defaultValue: 'zł' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
