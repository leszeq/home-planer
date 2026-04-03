'use client'
import React from 'react'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Plus, Trash2, Receipt, Search, Filter, ArrowUpDown, ChevronDown, CheckCircle, X, FileText, Paperclip, Loader2, Image as ImageIcon, File } from 'lucide-react'
import { createExpense, deleteExpense, deleteMultipleExpenses, updateExpense, getProjectCategories, createCategory } from '@/app/(dashboard)/dashboard/projects/[id]/actions'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { useFileUpload } from '@/hooks/use-file-upload'
import { addFileRecord } from '@/app/(dashboard)/dashboard/projects/[id]/files/actions'
import { useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from '@/lib/utils'
import { useQueryClient } from '@tanstack/react-query'

export interface Expense {
  id: string
  amount: number
  category: string
  description: string
  stage_id: string | null
  date: string
  file_id: string | null
}

interface Stage {
  id: string
  name: string
}

export function ExpenseList({
  projectId,
  expenses,
  stages,
  files = [],
  userId,
  canEdit = true
}: {
  projectId: string,
  expenses: Expense[],
  stages: Stage[],
  files?: any[],
  userId: string,
  canEdit?: boolean
}) {
  const { t, locale } = useTranslation()
  const [isAdding, setIsAdding] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('date-desc')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isDeletingBatch, setIsDeletingBatch] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Expense>>({})
  const [addingCategory, setAddingCategory] = useState('')
  const [addingCustomCategory, setAddingCustomCategory] = useState('')
  const [customCategories, setCustomCategories] = useState<any[]>([])
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { uploadFiles, isUploading: isUploadingFile, uploadProgress } = useFileUpload({
    userId,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project', projectId] })
  })

  useEffect(() => {
    getProjectCategories(projectId).then(res => {
      if (res.success && res.data) setCustomCategories(res.data)
    })
  }, [projectId])

  const allCategories = useMemo(() => {
    const base = [
      { id: 'materials', name: t('expenses.category_materials') },
      { id: 'labor', name: t('expenses.category_labor') },
      { id: 'other', name: t('expenses.category_other') },
    ]
    const custom = customCategories.map(c => ({ id: c.name, name: c.name }))
    return [...base, ...custom]
  }, [customCategories, t])

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

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return
    const count = selectedIds.size
    setIsDeletingBatch(true)
    const toastId = toast.loading(t('common.deleting') || 'Usuwanie...')
    const response = await deleteMultipleExpenses(projectId, Array.from(selectedIds))
    if (response.success) {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      toast.success(t('expenses.expenses_deleted').replace('{{count}}', String(count)), { id: toastId })
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
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      toast.success(t('expenses.expense_deleted'), { id: toastId })
    } else {
      toast.error(response.error || t('common.error'), { id: toastId })
    }
  }

  const handleEditSave = async () => {
    if (!editingId) return
    const data = { ...editData }
    if (data.category === '__custom__' && addingCustomCategory) {
      data.category = addingCustomCategory
      await createCategory(projectId, addingCustomCategory)
      const catRes = await getProjectCategories(projectId)
      if (catRes.success) setCustomCategories(catRes.data || [])
    }
    const res = await updateExpense(projectId, editingId, data)
    if (res.success) {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      toast.success(t('expenses.expense_updated'))
      setEditingId(null)
      setEditData({})
      setAddingCustomCategory('')
    } else {
      toast.error(res.error || t('common.error'))
    }
  }

  return (
    <Card className="flex flex-col border border-border shadow-sm animate-fade-in pb-4 relative">
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

      <CardContent className="flex flex-col gap-4 overflow-visible pt-2">
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

        {isAdding && (
          <Card className="bg-secondary/10 border-dashed border-2 border-primary/20 animate-in slide-in-from-top duration-300">
            <CardContent className="pt-6">
              <form action={async (formData) => {
                const category = addingCategory === '__custom__'
                  ? addingCustomCategory
                  : addingCategory || 'other'
                
                const data = {
                  amount: parseFloat(formData.get('amount') as string),
                  category: category,
                  description: formData.get('description') as string,
                  stage_id: formData.get('stage_id') as string || null,
                  date: formData.get('date') as string,
                  file_id: selectedFileId
                }

                if (addingCategory === '__custom__' && addingCustomCategory) {
                  await createCategory(projectId, addingCustomCategory)
                  const catRes = await getProjectCategories(projectId)
                  if (catRes.success) setCustomCategories(catRes.data || [])
                }

                const response = await createExpense(projectId, data)
                if (response.success) {
                  queryClient.invalidateQueries({ queryKey: ['project', projectId] })
                  setIsAdding(false)
                  setAddingCategory('')
                  setAddingCustomCategory('')
                  setSelectedFileId(null)
                  toast.success(t('expenses.expense_added').replace('{{desc}}', data.description || '').replace('{{amount}}', String(data.amount)))
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
                  <select name="category" className="flex h-10 w-full rounded-lg border border-muted-foreground/20 bg-card px-3 py-2 text-sm font-medium" required
                    value={addingCategory} onChange={e => { setAddingCategory(e.target.value); if (e.target.value !== '__custom__') setAddingCustomCategory('') }}
                  >
                    {allCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    <option value="__custom__">+ {t('expenses.category_custom')}</option>
                  </select>
                  {addingCategory === '__custom__' && (
                    <Input name="custom_category" className="mt-2 h-9 text-sm" placeholder={t('expenses.custom_category_label')} value={addingCustomCategory} onChange={e => setAddingCustomCategory(e.target.value)} />
                  )}
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

                {/* File handling */}
                <div className="md:col-span-2 space-y-2 border-t pt-4 mt-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
                    <Paperclip className="w-3.5 h-3.5" />
                    {t('expenses.document_label') || "Powiązany dokument"}
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-[10px] text-muted-foreground font-bold uppercase">{t('expenses.upload_new') || "Wgraj nowy"}</p>
                      <Input 
                        type="file" 
                        onChange={async (e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0]
                            const storagePath = `${userId}/${projectId}/${Date.now()}-${file.name}`
                            await uploadFiles([file], (f, path) => Promise.resolve({ success: true }), `${userId}/${projectId}`)
                            const recRes = await addFileRecord(projectId, file.name, storagePath, file.type, file.size)
                            if (recRes.success) {
                              toast.info(t('expenses.file_uploaded_success') || "Plik wgrany pomyślnie.")
                              queryClient.invalidateQueries({ queryKey: ['project', projectId] })
                            }
                          }
                        }}
                        className="h-10 text-xs" 
                        accept="image/*,.pdf,.doc,.docx"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] text-muted-foreground font-bold uppercase">{t('expenses.link_existing') || "Połącz z istniejącym"}</p>
                      <Select value={selectedFileId || 'none'} onValueChange={val => setSelectedFileId(val === 'none' ? null : val)}>
                        <SelectTrigger className="h-10 text-xs border-muted-foreground/20 bg-card">
                          <SelectValue placeholder={t('expenses.select_file') || "Wybierz plik..."} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">{t('common.none')}</SelectItem>
                          {files.map(f => (
                            <SelectItem key={f.id} value={f.id} className="text-xs">
                              <div className="flex items-center gap-2">
                                {f.content_type.startsWith('image/') ? <ImageIcon className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                                {f.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 flex justify-end gap-2 pt-4 border-t mt-2">
                  <Button variant="ghost" type="button" onClick={() => setIsAdding(false)} className="rounded-xl font-bold">{t('common.cancel')}</Button>
                  <Button type="submit" className="rounded-xl font-bold shadow-md shadow-primary/20" disabled={isUploadingFile}>
                    {isUploadingFile && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {t('expenses.add_expense')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Expenses List */}
        <div className="space-y-2 overflow-y-auto pr-1 custom-scrollbar">
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
                    <React.Fragment key={expense.id}>
                      <tr className={cn(
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
                          <div className="flex flex-col gap-1">
                            <p className="font-bold text-foreground/90 truncate max-w-[200px]" title={expense.description}>
                              {expense.description || t('common.none')}
                            </p>
                            {expense.file_id && (
                              <div className="flex items-center gap-1.5 text-[10px] text-primary font-bold bg-primary/5 w-fit px-1.5 py-0.5 rounded border border-primary/10">
                                <Paperclip className="w-2.5 h-2.5" />
                                {files.find(f => f.id === expense.file_id)?.name || t('expenses.document')}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="bg-secondary/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tight">
                            {expense.category === 'materials' ? t('expenses.category_materials') :
                              expense.category === 'labor' ? t('expenses.category_labor') :
                                expense.category === 'other' ? t('expenses.category_other') :
                                  expense.category}
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
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-8 h-8 hover:text-primary hover:bg-primary/10"
                                title={t('expenses.edit_expense')}
                                onClick={() => {
                                  setEditingId(expense.id)
                                  const isCustom = !['materials', 'labor', 'other'].includes(expense.category)
                                  setEditData({ ...expense, category: isCustom ? '__custom__' : expense.category })
                                  setAddingCustomCategory(isCustom ? expense.category : '')
                                }}
                              >
                                <Filter className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-8 h-8 hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteExpense(expense.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                      {editingId === expense.id && (
                        <tr key={`edit-${expense.id}`}>
                          <td colSpan={canEdit ? 7 : 6} className="p-0">
                            <div className="bg-secondary/10 border-t border-b border-primary/20 p-4 animate-in slide-in-from-top duration-200">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('expenses.amount')}</label>
                                  <Input type="number" step="0.01" className="h-9 text-sm" value={editData.amount ?? ''} onChange={e => setEditData(d => ({ ...d, amount: parseFloat(e.target.value) }))} />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('expenses.category')}</label>
                                  <select className="flex h-9 w-full rounded-lg border border-muted-foreground/20 bg-card px-2 py-1 text-sm font-medium"
                                    value={editData.category || 'other'}
                                    onChange={e => { setEditData(d => ({ ...d, category: e.target.value })); if (e.target.value !== '__custom__') setAddingCustomCategory('') }}
                                  >
                                    {allCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    <option value="__custom__">+ {t('expenses.category_custom')}</option>
                                  </select>
                                  {editData.category === '__custom__' && (
                                    <Input className="mt-1 h-8 text-xs" placeholder={t('expenses.custom_category_label')} value={addingCustomCategory} onChange={e => setAddingCustomCategory(e.target.value)} />
                                  )}
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('expenses.description')}</label>
                                  <Input className="h-9 text-sm" value={editData.description ?? ''} onChange={e => setEditData(d => ({ ...d, description: e.target.value }))} />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('expenses.date')}</label>
                                  <Input type="date" className="h-9 text-sm" value={editData.date?.split('T')[0] ?? ''} onChange={e => setEditData(d => ({ ...d, date: e.target.value }))} />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('expenses.stage')}</label>
                                  <select className="flex h-9 w-full rounded-lg border border-muted-foreground/20 bg-card px-2 py-1 text-sm"
                                    value={editData.stage_id ?? ''}
                                    onChange={e => setEditData(d => ({ ...d, stage_id: e.target.value || null }))}
                                  >
                                    <option value="">{t('common.none')}</option>
                                    {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                  </select>
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('expenses.document')}</label>
                                  <Select 
                                    value={editData.file_id || 'none'} 
                                    onValueChange={val => setEditData(d => ({ ...d, file_id: val === 'none' ? null : val }))}
                                  >
                                    <SelectTrigger className="h-9 text-xs border-muted-foreground/20 bg-card">
                                      <SelectValue placeholder={t('expenses.select_file') || "Wybierz plik..."} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="none">{t('common.none')}</SelectItem>
                                      {files.map(f => (
                                        <SelectItem key={f.id} value={f.id} className="text-xs">
                                          <div className="flex items-center gap-2">
                                            {f.content_type.startsWith('image/') ? <ImageIcon className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                                            {f.name}
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="flex justify-end gap-2 mt-3">
                                <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => { setEditingId(null); setEditData({}); setAddingCustomCategory('') }}>{t('common.cancel')}</Button>
                                <Button size="sm" className="h-8 text-xs" onClick={handleEditSave}>{t('common.save')}</Button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
