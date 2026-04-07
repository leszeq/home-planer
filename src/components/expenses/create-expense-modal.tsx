'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Plus, X, Loader2 } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import { createExpense } from '@/app/(dashboard)/dashboard/projects/[id]/actions'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export function CreateExpenseModal({ projects }: { projects: { id: string, name: string }[] }) {
  const { t, locale } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [mounted, setMounted] = useState(false)

  // Form states matching standard Next.js forms or controlled
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [amount, setAmount] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0])

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

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
      // createExpense signature: (projectId, data)
      const result = await createExpense(selectedProjectId, {
        amount: Number(amount),
        category: selectedCategory,
        description: description.trim(),
        stage_id: null,
        date: date
      })
      
      if (result && !result.success) {
        setErrors((prev) => ({ ...prev, amount: result.error || t('common.error') }))
      } else {
        setIsOpen(false)
        setAmount('')
        setDescription('')
        setSelectedCategory('')
        setSelectedProjectId('')
        // Global view revalidation is tricky if there's no path supplied, let's refresh page
        window.location.reload()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
        {t('expenses.add_expense')}
      </Button>
    )
  }

  const modalContent = (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
        <form onSubmit={handleSubmit}>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle>{t('expenses.add_expense')}</CardTitle>
            <Button variant="ghost" size="icon" type="button" onClick={() => { setIsOpen(false); setErrors({}); }}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div className="space-y-2">
              <label className={cn("text-sm font-medium", errors.projectId && "text-destructive")}>
                Projekt
              </label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
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
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className={cn(errors.category && "border-destructive ring-1 ring-destructive")}>
                  <SelectValue placeholder={t('common.select')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="materials">{t('expenses.category_materials')}</SelectItem>
                  <SelectItem value="labor">{t('expenses.category_labor')}</SelectItem>
                  <SelectItem value="other">{t('expenses.category_other')}</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && <p className="text-[10px] font-bold text-destructive animate-in fade-in slide-in-from-top-1">{errors.category}</p>}
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
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : t('expenses.add_expense')}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )

  if (!mounted) return null
  return createPortal(modalContent, document.body)
}
