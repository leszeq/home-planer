'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Plus, Trash2, Receipt, Search, Filter, ArrowUpDown, ChevronDown, CheckCircle, X } from 'lucide-react'
import { createExpense, deleteExpense, deleteMultipleExpenses } from '@/app/(dashboard)/dashboard/projects/[id]/actions'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from '@/lib/utils'

interface Expense {
  id: string
  amount: number
  category: string
  description: string
  stage_id: string | null
  date: string
}

interface Stage {
  id: string
  name: string
}

export function ExpenseList({ 
  projectId, 
  expenses, 
  stages,
  canEdit = true
}: { 
  projectId: string, 
  expenses: Expense[], 
  stages: Stage[]
  canEdit?: boolean
}) {
  const { t, locale } = useTranslation()
  const [isAdding, setIsAdding] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('date-desc')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isDeletingBatch, setIsDeletingBatch] = useState(false)

  // 1. Filter and Sort logic
  const processedExpenses = useMemo(() => {
    let result = [...expenses]

    // Search
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase()
      result = result.filter(e => 
        e.description?.toLowerCase().includes(lowerSearch) || 
        e.category.toLowerCase().includes(lowerSearch)
      )
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime()
      if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime()
      if (sortBy === 'amount-desc') return b.amount - a.amount
      if (sortBy === 'amount-asc') return a.amount - b.amount
      return 0
    })

    return result
  }, [expenses, searchTerm, sortBy])

  // 2. Selection handlers
  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(processedExpenses.map(e => e.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) newSelected.delete(id)
    else newSelected.add(id)
    setSelectedIds(newSelected)
  }

  // 3. Action handlers
  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return
    
    setIsDeletingBatch(true)
    const toastId = toast.loading(t('common.deleting') || 'Usuwanie...')
    
    const response = await deleteMultipleExpenses(projectId, Array.from(selectedIds))
    
    if (response.success) {
      toast.success(t('common.deleted') || 'Usunięto pomyślnie', { id: toastId })
      setSelectedIds(new Set())
    } else {
      toast.error(response.error || t('common.error'), { id: toastId })
    }
    setIsDeletingBatch(false)
  }

  const handleDeleteExpense = async (id: string) => {
    const toastId = toast.loading(t('common.deleting') || 'Usuwanie...')
    const response = await deleteExpense(projectId, id)
    if (response.success) {
      toast.success(t('common.deleted'), { id: toastId })
    } else {
      toast.error(response.error || t('common.error'), { id: toastId })
    }
  }

  return (
    <Card className="flex flex-col h-full border border-border shadow-sm animate-fade-in relative pb-4">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold tracking-tight">{t('expenses.title')}</CardTitle>
            <CardDescription className="text-sm font-medium">{t('expenses.summary')}</CardDescription>
          </div>
          {canEdit && (
            <Button size="sm" onClick={() => setIsAdding(true)} className="rounded-xl shadow-sm card-hover font-bold h-9">
              <Plus className="w-4 h-4 mr-2" />
              {t('expenses.add_expense')}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 flex-1 overflow-visible pt-2">
        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder={t('common.search') || "Szukaj..."} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 border-muted-foreground/20 bg-secondary/5"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px] h-9 text-xs font-bold bg-secondary/5 border-muted-foreground/20">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                <SelectValue placeholder="Sortuj" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">{t('common.sort_date_desc') || "Data: od najnowszych"}</SelectItem>
              <SelectItem value="date-asc">{t('common.sort_date_asc') || "Data: od najstarszych"}</SelectItem>
              <SelectItem value="amount-desc">{t('common.sort_amount_desc') || "Kwota: od największych"}</SelectItem>
              <SelectItem value="amount-asc">{t('common.sort_amount_asc') || "Kwota: od najmniejszych"}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Add Expense Form */}
        {isAdding && (
          <Card className="bg-secondary/10 border-dashed border-2 border-primary/20 animate-in slide-in-from-top duration-300">
            <CardContent className="pt-6">
              <form action={async (formData) => {
                const data = {
                  amount: parseFloat(formData.get('amount') as string),
                  category: formData.get('category') as string,
                  description: formData.get('description') as string,
                  stage_id: formData.get('stage_id') as string || null,
                  date: formData.get('date') as string
                }
                const response = await createExpense(projectId, data)
                if (response.success) {
                  setIsAdding(false)
                  toast.success(t('common.success'))
                } else {
                  toast.error(response.error)
                }
              }} className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t('expenses.amount')} (zł)</label>
                  <Input name="amount" type="number" step="0.01" required placeholder="0.00" className="h-10 bg-card border-muted-foreground/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t('expenses.category')}</label>
                  <select name="category" className="flex h-10 w-full rounded-lg border border-muted-foreground/20 bg-card px-3 py-2 text-sm font-medium" required>
                    <option value="materials">{t('expenses.category_materials')}</option>
                    <option value="labor">{t('expenses.category_labor')}</option>
                    <option value="other">{t('expenses.category_other')}</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t('expenses.description')}</label>
                  <Input name="description" placeholder={t('expenses.description')} className="h-10 bg-card border-muted-foreground/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t('expenses.stage')}</label>
                  <select name="stage_id" className="flex h-10 w-full rounded-lg border border-muted-foreground/20 bg-card px-3 py-2 text-sm font-medium">
                    <option value="">{t('common.none')}</option>
                    {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t('expenses.date')}</label>
                  <Input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required className="h-10 bg-card border-muted-foreground/20" />
                </div>
                <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                  <Button variant="ghost" type="button" onClick={() => setIsAdding(false)} className="rounded-xl font-bold">{t('common.cancel')}</Button>
                  <Button type="submit" className="rounded-xl font-bold shadow-md shadow-primary/20">{t('expenses.add_expense')}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Expenses List */}
        <div className="border rounded-xl overflow-hidden bg-secondary/5 min-h-[400px]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/10">
                <tr className="text-left font-bold text-muted-foreground uppercase tracking-tighter text-[11px]">
                  {canEdit && (
                    <th className="p-4 w-10">
                      <Checkbox 
                        checked={selectedIds.size === processedExpenses.length && processedExpenses.length > 0} 
                        onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                      />
                    </th>
                  )}
                  <th className="p-4">{t('expenses.date')}</th>
                  <th className="p-4">{t('expenses.description')}</th>
                  <th className="p-4">{t('expenses.category')}</th>
                  <th className="p-4">{t('expenses.stage')}</th>
                  <th className="p-4 text-right">{t('expenses.amount')}</th>
                  <th className="p-4 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {processedExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-muted-foreground font-medium italic">
                      <div className="flex flex-col items-center gap-2">
                        <Receipt className="w-8 h-8 opacity-20" />
                        {searchTerm ? t('common.no_search_results') || "Nie znaleziono wydatków" : t('expenses.no_expenses')}
                      </div>
                    </td>
                  </tr>
                ) : (
                  processedExpenses.map((expense) => (
                    <tr key={expense.id} className={cn(
                      "hover:bg-card transition-colors group",
                      selectedIds.has(expense.id) && "bg-primary/5"
                    )}>
                      {canEdit && (
                        <td className="p-4">
                          <Checkbox 
                            checked={selectedIds.has(expense.id)} 
                            onCheckedChange={() => toggleSelect(expense.id)}
                          />
                        </td>
                      )}
                      <td className="p-4 font-semibold text-muted-foreground/80">
                        {new Date(expense.date).toLocaleDateString(locale === 'pl' ? 'pl-PL' : 'en-US')}
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-foreground/90 truncate max-w-[200px]" title={expense.description}>
                          {expense.description || t('common.none')}
                        </p>
                      </td>
                      <td className="p-4">
                        <span className="bg-secondary/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tight">
                          {expense.category === 'materials' ? t('expenses.category_materials') : 
                           expense.category === 'labor' ? t('expenses.category_labor') : 
                           t('expenses.category_other')}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="text-xs font-medium text-muted-foreground truncate max-w-[150px]" title={stages.find(s => s.id === expense.stage_id)?.name}>
                          {stages.find(s => s.id === expense.stage_id)?.name || "-"}
                        </p>
                      </td>
                      <td className="p-4 text-right font-bold text-foreground">
                        {Number(expense.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} zł
                      </td>
                      <td className="p-4 text-right">
                        {canEdit && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive hover:bg-destructive/10" 
                            onClick={() => handleDeleteExpense(expense.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Batch Action Bar */}
        {selectedIds.size > 0 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-8 duration-300">
            <div className="flex items-center gap-4 bg-foreground text-background px-6 py-3 rounded-2xl shadow-2xl border border-border/20">
              <span className="text-sm font-bold flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                {selectedIds.size} {t('common.selected') || "Wybrano"}
              </span>
              <div className="w-px h-4 bg-muted-foreground/30" />
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleBatchDelete()}
                  disabled={isDeletingBatch}
                  className="h-8 rounded-lg hover:bg-destructive hover:text-destructive-foreground text-destructive font-bold transition-all"
                >
                  {isDeletingBatch ? <Plus className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                  {t('common.delete_selected') || "Usuń wybrane"}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setSelectedIds(new Set())}
                  className="h-8 w-8 hover:bg-muted/10 rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
