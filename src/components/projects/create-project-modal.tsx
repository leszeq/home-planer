'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { createProject } from '@/app/(dashboard)/dashboard/projects/actions'
import { Plus, X, Loader2 } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/LanguageContext'

export function CreateProjectModal() {
  const { t, locale } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ name?: string; budget?: string }>({})
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch for portals
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (formData: FormData) => {
    const name = formData.get('name') as string
    const budget = formData.get('budget') as string

    // Custom Validation
    const newErrors: { name?: string; budget?: string } = {}
    if (!name || name.trim() === '') {
      newErrors.name = locale === 'pl' ? 'Nazwa projektu jest wymagana' : 'Project name is required'
    }
    if (!budget || isNaN(Number(budget)) || Number(budget) <= 0) {
      newErrors.budget = locale === 'pl' ? 'Podaj prawidłowy budżet' : 'Valid budget is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsSubmitting(true)

    try {
      const result = await createProject(formData)
      
      if (result && !result.success) {
        setErrors((prev) => ({ ...prev, name: result.error }))
      } else {
        setIsOpen(false)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
        {t('projects.new_project')}
      </Button>
    )
  }

  const modalContent = (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
        <form action={handleSubmit}>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle>{t('projects.new_project')}</CardTitle>
            <Button variant="ghost" size="icon" type="button" onClick={() => { setIsOpen(false); setErrors({}); }}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className={`text-sm font-medium ${errors.name ? 'text-destructive' : ''}`}>
                {t('projects.project_name')}
              </label>
              <Input 
                name="name" 
                placeholder={t('projects.project_name')} 
                className={errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {errors.name && <p className="text-xs text-destructive font-semibold">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <label className={`text-sm font-medium ${errors.budget ? 'text-destructive' : ''}`}>
                {t('projects.budget')} (zł)
              </label>
              <Input 
                name="budget" 
                type="number" 
                placeholder="500000" 
                className={errors.budget ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {errors.budget && <p className="text-xs text-destructive font-semibold">{errors.budget}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full font-bold" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : t('projects.create')}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )

  if (!mounted) return null
  return createPortal(modalContent, document.body)
}
