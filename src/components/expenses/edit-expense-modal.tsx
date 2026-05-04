'use client'

import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { X, Loader2, Save } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import { updateExpense, getProjectCategories, createCategory } from '@/app/(dashboard)/dashboard/projects/[id]/actions'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export function EditExpenseModal({ 
  expense, 
  projects,
  isOpen,
  onClose,
  onSuccess
}: { 
  expense: any
  projects: { id: string, name: string }[]
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}) {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [mounted, setMounted] = useState(false)

  // Form states matching standard Next.js forms or controlled
  const [selectedProjectId, setSelectedProjectId] = useState<string>(expense?.project_id ? String(expense.project_id) : '')
  const [selectedCategory, setSelectedCategory] = useState<string>(expense?.category ? String(expense.category) : '')
  const [amount, setAmount] = useState<string>(expense?.amount ? String(expense.amount) : '')
  const [description, setDescription] = useState<string>(expense?.description || '')
  const [date, setDate] = useState<string>(expense?.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])
  const [customCategories, setCustomCategories] = useState<any[]>([])
  const [addingCustomCategory, setAddingCustomCategory] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (expense && isOpen) {
      setSelectedProjectId(expense.project_id ? String(expense.project_id) : '')
      setSelectedCategory(expense.category ? String(expense.category) : '')
      setAmount(expense.amount ? String(expense.amount) : '')
      setDescription(expense.description || '')
      setDate(expense.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])
      setErrors({})
    } else if (!isOpen) {
      setSelectedProjectId('')
      setSelectedCategory('')
      setAmount('')
      setDescription('')
      setDate('')
      setErrors({})
      setAddingCustomCategory('')
    }
  }, [expense, isOpen])

  useEffect(() => {
    if (selectedProjectId) {
      getProjectCategories(selectedProjectId).then(res => {
        if (res.success && res.data) setCustomCategories(res.data)
      })
    } else {
      setCustomCategories([])
    }
  }, [selectedProjectId])

  const allCategories = useMemo(() => {
    const base = [
      { id: 'materials', name: t('expenses.category_materials') },
      { id: 'labor', name: t('expenses.category_labor') },
      { id: 'other', name: t('expenses.category_other') },
    ]
    const custom = customCategories.map(c => ({ id: c.name, name: c.name }))
    
    if (expense?.category && expense.category !== '__custom__' && !base.find(b => b.id === expense.category) && !custom.find(c => c.id === expense.category)) {
      custom.push({ id: expense.category, name: expense.category })
    }

    return [...base, ...custom]
  }, [customCategories, t, expense?.category])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting || !expense) return

    const newErrors: Record<string, string> = {}
    if (!selectedProjectId) {
      newErrors.projectId = t('common.error_field_required')
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = t('common.error_field_required')
    }
    if (!description || !description.trim()) {
      newErrors.description = t('common.error_field_required')
    }
    if (!selectedCategory) {
      newErrors.category = t('common.error_field_required')
    }
    if (!date) {
      newErrors.date = t('common.error_field_required')
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsSubmitting(true)

    try {
      let finalCategory = selectedCategory;
      if (selectedCategory === '__custom__' && addingCustomCategory) {
        finalCategory = addingCustomCategory;
        await createCategory(selectedProjectId, addingCustomCategory);
      }

      const result = await updateExpense(selectedProjectId, expense.id, {
        amount: Number(amount),
        category: finalCategory,
        description: description.trim(),
        date: date
      })
      
      if (result && !result.success) {
        setErrors((prev) => ({ ...prev, amount: result.error || t('common.error') }))
      } else {
        onClose()
        if (onSuccess) {
            onSuccess()
        } else {
            window.location.reload()
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen || !mounted) return null

  const modalContent = (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-in fade-in duration-200">
      <Card className="w-full sm:max-w-md sm:rounded-xl rounded-t-2xl rounded-b-none shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle>{t('expenses.edit_expense')}</CardTitle>
            <Button variant="ghost" size="icon" type="button" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div className="space-y-2">
              <label className={cn("text-sm font-medium", errors.projectId && "text-destructive")}>
                Projekt
              </label>
              <Select value={selectedProjectId ? String(selectedProjectId) : undefined} onValueChange={setSelectedProjectId}>
                <SelectTrigger className={cn(errors.projectId && "border-destructive ring-1 ring-destructive")}>
                  <SelectValue placeholder={t('common.select')} />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.projectId && <p className="text-[10px] font-bold text-destructive animate-in fade-in slide-in-from-top-1">{errors.projectId}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={cn("text-sm font-medium", errors.amount && "text-destructive")}>
                  {t('expenses.amount')} (zł)
                </label>
                <Input 
                   type="number" 
                   step="0.01"
                   value={amount}
                   onChange={e => setAmount(e.target.value)}
                   placeholder="0.00" 
                   className={cn(errors.amount && "border-destructive ring-1 ring-destructive")}
                />
                {errors.amount && <p className="text-[10px] font-bold text-destructive animate-in fade-in slide-in-from-top-1">{errors.amount}</p>}
              </div>
              <div className="space-y-2">
                <label className={cn("text-sm font-medium", errors.date && "text-destructive")}>Data</label>
                <Input 
                   type="date" 
                   value={date}
                   onChange={e => setDate(e.target.value)}
                   className={cn(errors.date && "border-destructive ring-1 ring-destructive")}
                />
                {errors.date && <p className="text-[10px] font-bold text-destructive animate-in fade-in slide-in-from-top-1">{errors.date}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className={cn("text-sm font-medium", errors.category && "text-destructive")}>Kategoria</label>
              <Select 
                value={selectedCategory ? String(selectedCategory) : undefined} 
                onValueChange={(val) => {
                  setSelectedCategory(val);
                  if (val !== '__custom__') setAddingCustomCategory('');
                }}
              >
                <SelectTrigger className={cn(errors.category && "border-destructive ring-1 ring-destructive")}>
                  <SelectValue placeholder={t('common.select')} />
                </SelectTrigger>
                <SelectContent>
                  {allCategories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                  <SelectItem value="__custom__">+ {t('expenses.category_custom')}</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && <p className="text-[10px] font-bold text-destructive animate-in fade-in slide-in-from-top-1">{errors.category}</p>}
              {selectedCategory === '__custom__' && (
                <Input 
                  className="mt-2 h-9 text-sm" 
                  placeholder={t('expenses.custom_category_label')} 
                  value={addingCustomCategory} 
                  onChange={e => setAddingCustomCategory(e.target.value)} 
                />
              )}
            </div>

            <div className="space-y-2">
              <label className={cn("text-sm font-medium", errors.description && "text-destructive")}>{t('expenses.description')}</label>
              <Input 
                type="text" 
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder={t('expenses.description')}
                className={cn(errors.description && "border-destructive ring-1 ring-destructive")} 
              />
              {errors.description && <p className="text-[10px] font-bold text-destructive animate-in fade-in slide-in-from-top-1">{errors.description}</p>}
            </div>

          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full font-bold" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <><Save className="w-4 h-4 mr-2" />{t('common.save')}</>}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )

  return createPortal(modalContent, document.body)
}
