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

export function CreateExpenseModal({ projects }: { projects: { id: string, name: string }[] }) {
  const { t, locale } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ amount?: string; projectId?: string }>({})
  const [mounted, setMounted] = useState(false)

  // Form states matching standard Next.js forms or controlled
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('materials')
  const [amount, setAmount] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0])

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: { amount?: string; projectId?: string } = {}
    if (!selectedProjectId) {
      newErrors.projectId = locale === 'pl' ? 'Wybierz projekt' : 'Select a project'
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = locale === 'pl' ? 'Podaj prawidłową kwotę' : 'Valid amount is required'
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
        description: description,
        stage_id: null,
        date: date
      })
      
      if (result && !result.success) {
        setErrors((prev) => ({ ...prev, amount: result.error }))
      } else {
        setIsOpen(false)
        setAmount('')
        setDescription('')
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
              <label className={`text-sm font-medium ${errors.projectId ? 'text-destructive' : ''}`}>
                Projekt
              </label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger className={errors.projectId ? 'border-destructive' : ''}>
                  <SelectValue placeholder={locale === 'pl' ? 'Wybierz projekt' : 'Select project'} />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.projectId && <p className="text-xs text-destructive font-semibold">{errors.projectId}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`text-sm font-medium ${errors.amount ? 'text-destructive' : ''}`}>
                  {t('expenses.amount')} (zł)
                </label>
                <Input 
                  type="number" 
                  step="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="2500" 
                  className={errors.amount ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Data</label>
                <Input 
                  type="date" 
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </div>
            </div>
            {errors.amount && <p className="text-xs text-destructive font-semibold">{errors.amount}</p>}

            <div className="space-y-2">
              <label className="text-sm font-medium">Kategoria</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="materials">{t('expenses.category_materials')}</SelectItem>
                  <SelectItem value="labor">{t('expenses.category_labor')}</SelectItem>
                  <SelectItem value="other">{t('expenses.category_other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('expenses.description')}</label>
              <Input 
                type="text" 
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder={locale === 'pl' ? 'np. Faktura za materiały' : 'e.g. Materials invoice'} 
              />
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
