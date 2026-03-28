'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { createProject } from '@/app/(dashboard)/dashboard/projects/actions'
import { Plus, X } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/LanguageContext'

export function CreateProjectModal() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
        {t('projects.new_project')}
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <form action={async (formData) => {
          await createProject(formData)
          setIsOpen(false)
        }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t('projects.new_project')}</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('projects.project_name')}</label>
              <Input name="name" placeholder={t('projects.project_name')} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('projects.budget')} (zł)</label>
              <Input name="budget" type="number" placeholder="500000" required />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">{t('projects.create')}</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
