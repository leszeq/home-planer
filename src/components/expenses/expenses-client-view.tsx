'use client'

import { useState, useMemo, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Filter, Search, Receipt, ChevronUp, ChevronDown, ChevronsUpDown, Printer } from "lucide-react"
import { useTranslation } from "@/lib/i18n/LanguageContext"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"

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

import { CreateExpenseModal } from "./create-expense-modal"
import { EditExpenseModal } from "./edit-expense-modal"

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
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc'|'desc' } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const pageSize = 25

  const processedExpenses = useMemo(() => {
    let filtered = initialExpenses.filter(expense => {
      const matchesProject = selectedProjectId === 'all' || expense.project_id === selectedProjectId
      const matchesSearch = expense.description?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           expense.projects?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           expense.category.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesProject && matchesSearch
    })

    if (sortConfig) {
      filtered.sort((a, b) => {
        let valA: any = a[sortConfig.key as keyof Expense]
        let valB: any = b[sortConfig.key as keyof Expense]

        if (sortConfig.key === 'project') {
          valA = a.projects?.name || ''
          valB = b.projects?.name || ''
        } else if (sortConfig.key === 'amount') {
          valA = Number(a.amount)
          valB = Number(b.amount)
        } else if (sortConfig.key === 'date') {
          valA = new Date(a.date).getTime()
          valB = new Date(b.date).getTime()
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [initialExpenses, selectedProjectId, searchQuery, sortConfig])

  // Pagination
  const totalPages = Math.ceil(processedExpenses.length / pageSize)
  const paginatedExpenses = processedExpenses.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedProjectId, sortConfig])

  const totalAmount = processedExpenses.reduce((sum, e) => sum + Number(e.amount), 0)

  const getLocalizedCategory = (cat: string) => {
    if (cat === 'materials') return t('expenses.category_materials')
    if (cat === 'labor') return t('expenses.category_labor')
    if (cat === 'other') return t('expenses.category_other')
    return cat
  }

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const renderSortIcon = (key: string) => {
    if (sortConfig?.key === key) {
      return sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 ml-1 inline" /> : <ChevronDown className="w-3 h-3 ml-1 inline" />
    }
    return <ChevronsUpDown className="w-3 h-3 ml-1 inline opacity-40 hover:opacity-100" />
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedExpenses.map(e => e.id))
    } else {
      setSelectedIds([])
    }
  }

  const isAllSelected = paginatedExpenses.length > 0 && paginatedExpenses.every(e => selectedIds.includes(e.id))

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleGeneratePDF = () => {
    const selected = processedExpenses.filter(e => selectedIds.includes(e.id))
    if (selected.length === 0) return

    const printWin = window.open('', '_blank')
    if (!printWin) return

    const html = `
      <html>
        <head>
          <title>Zestawienie Wydatków</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #111; }
            h1 { font-size: 24px; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px; }
            th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
            th { background: #f4f4f5; font-weight: bold; }
            .right { text-align: right; }
            .summary { float: right; font-size: 16px; font-weight: bold; margin-top: 20px; padding: 15px; border: 2px solid #111; }
          </style>
        </head>
        <body>
          <h1>Zestawienie Wydatków (Wybrane: ${selected.length})</h1>
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Projekt</th>
                <th>Kategoria</th>
                <th>Opis</th>
                <th class="right">Kwota</th>
              </tr>
            </thead>
            <tbody>
              ${selected.map(e => `
                <tr>
                  <td>${new Date(e.date).toLocaleDateString()}</td>
                  <td>${e.projects?.name || ''}</td>
                  <td>${getLocalizedCategory(e.category)}</td>
                  <td>${e.description}</td>
                  <td class="right">${Number(e.amount).toLocaleString()} zł</td>
                </tr>
              `).join('')}
              <tr>
                <th colspan="4" class="right">Suma wybranych:</th>
                <th class="right">${selected.reduce((sum, e) => sum + Number(e.amount), 0).toLocaleString()} zł</th>
              </tr>
            </tbody>
          </table>
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => { window.close() }, 500);
            }
          </script>
        </body>
      </html>
    `
    printWin.document.write(html)
    printWin.document.close()
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {!hideHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{t('expenses.global.title')}</h2>
            <p className="text-muted-foreground">{t('expenses.global.subtitle')}</p>
          </div>
          <CreateExpenseModal projects={projects} />
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-card p-4 rounded-xl border border-border/50 shadow-sm mt-0">
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

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {selectedIds.length > 0 && (
            <Button onClick={handleGeneratePDF} variant="outline" className="w-full sm:w-auto gap-2 bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary">
              <Printer className="w-4 h-4" />
              Generuj PDF ({selectedIds.length})
            </Button>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground hidden lg:inline-block">
              {t('dashboard.filter')}
            </span>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger className="w-full sm:w-[200px] h-10 rounded-lg font-medium bg-background">
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
          {hideHeader && (
             <CreateExpenseModal projects={projects} />
          )}
        </div>
      </div>

      {/* Summary Row */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Receipt className="w-4 h-4" />
          <span>{t('expenses.global.found_count', { count: processedExpenses.length })}</span>
        </div>
        <div className="text-sm">
          <span className="text-muted-foreground">{t('expenses.global.total_sum')}</span>
          <span className="font-bold text-primary text-lg ml-2">{totalAmount.toLocaleString()} {t('dashboard.stats.currency', { defaultValue: 'zł' })}</span>
        </div>
      </div>

      {/* ─── MOBILE: Card List (visible on < md) ─── */}
      <div className="md:hidden space-y-3">
        {paginatedExpenses.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground italic">
            {t('expenses.global.no_results')}
          </div>
        ) : (
          paginatedExpenses.map((expense) => (
            <Card
              key={expense.id}
              className="p-4 flex items-start gap-3 cursor-pointer active:bg-secondary/80 transition-colors border-border/50"
              onClick={() => setEditingExpense(expense)}
            >
              <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(expense.id)}
                  onChange={() => toggleSelection(expense.id)}
                  className="w-5 h-5 rounded border-primary/50 text-primary cursor-pointer"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-sm truncate">{expense.description || t('expenses.global.no_description')}</p>
                  <span className="font-bold text-primary text-sm tabular-nums whitespace-nowrap">
                    {Number(expense.amount).toLocaleString()} {t('dashboard.stats.currency', { defaultValue: 'zł' })}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter bg-secondary text-muted-foreground border border-border/50">
                    {getLocalizedCategory(expense.category)}
                  </span>
                  <span className="text-xs text-muted-foreground">{expense.projects?.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{new Date(expense.date).toLocaleDateString()}</span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* ─── DESKTOP: Table (visible on md+) ─── */}
      <Card className="hidden md:block overflow-hidden border-border/50 shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-secondary/20">
                <th className="p-4 text-center w-[50px]">
                  <input 
                    type="checkbox" 
                    checked={isAllSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-primary/50 text-primary cursor-pointer align-middle"
                  />
                </th>
                <th className="p-4 text-left font-semibold text-muted-foreground uppercase tracking-wider text-[10px] cursor-pointer hover:bg-secondary/40 select-none transition-colors" onClick={() => requestSort('date')}>
                  <div className="flex items-center">{t('expenses.global.table.date')} {renderSortIcon('date')}</div>
                </th>
                <th className="p-4 text-left font-semibold text-muted-foreground uppercase tracking-wider text-[10px] cursor-pointer hover:bg-secondary/40 select-none transition-colors" onClick={() => requestSort('project')}>
                  <div className="flex items-center">{t('expenses.global.table.project')} {renderSortIcon('project')}</div>
                </th>
                <th className="p-4 text-left font-semibold text-muted-foreground uppercase tracking-wider text-[10px] cursor-pointer hover:bg-secondary/40 select-none transition-colors" onClick={() => requestSort('description')}>
                  <div className="flex items-center">{t('expenses.global.table.description')} {renderSortIcon('description')}</div>
                </th>
                <th className="p-4 text-left font-semibold text-muted-foreground uppercase tracking-wider text-[10px] cursor-pointer hover:bg-secondary/40 select-none transition-colors" onClick={() => requestSort('category')}>
                  <div className="flex items-center">{t('expenses.global.table.category')} {renderSortIcon('category')}</div>
                </th>
                <th className="p-4 text-right font-semibold text-muted-foreground uppercase tracking-wider text-[10px] cursor-pointer hover:bg-secondary/40 select-none transition-colors" onClick={() => requestSort('amount')}>
                  <div className="flex items-center justify-end">{t('expenses.global.table.amount')} {renderSortIcon('amount')}</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {paginatedExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted-foreground italic bg-secondary/5">
                    {t('expenses.global.no_results')}
                  </td>
                </tr>
              ) : (
                paginatedExpenses.map((expense) => (
                  <tr 
                    key={expense.id} 
                    className="hover:bg-secondary/70 transition-colors group cursor-pointer"
                    onClick={() => setEditingExpense(expense)}
                  >
                    <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(expense.id)}
                        onChange={() => toggleSelection(expense.id)}
                        className="w-4 h-4 rounded border-primary/50 text-primary cursor-pointer align-middle"
                      />
                    </td>
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
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter bg-secondary text-muted-foreground border border-border/50 group-hover:border-primary/20 transition-colors">
                        {getLocalizedCategory(expense.category)}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold tabular-nums text-foreground group-hover:text-primary transition-colors">
                      {Number(expense.amount).toLocaleString()} {t('dashboard.stats.currency', { defaultValue: 'zł' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination — shared for both mobile and desktop */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-2">
          <div className="text-xs text-muted-foreground">
            Strona <span className="font-semibold text-foreground">{currentPage}</span> z <span className="font-semibold text-foreground">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-10 px-4"
            >
              Poprzednia
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-10 px-4"
            >
              Następna
            </Button>
          </div>
        </div>
      )}

      <EditExpenseModal 
        isOpen={!!editingExpense}
        onClose={() => setEditingExpense(null)}
        expense={editingExpense}
        projects={projects}
      />
    </div>
  )
}
