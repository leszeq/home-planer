'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CHECKLIST_TEMPLATES } from '@/lib/checklist-templates'
import { createChecklistFromTemplate } from '@/app/(dashboard)/dashboard/checklists/actions'
import { X, ListChecks, Layout } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import { toast } from 'sonner'

export function AddChecklistModal({
  projectId: defaultProjectId,
  stages: allStages,
  projects = [],
  onSuccess,
  initialStageId = '',
  lockStage = false,
  variant = 'primary'
}: {
  projectId: string
  stages: { id: string; name: string; project_id: string }[]
  projects?: { id: string; name: string }[]
  onSuccess?: (checklist: any) => void
  initialStageId?: string
  lockStage?: boolean
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'glow'
}) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [selectedProjectId, setSelectedProjectId] = useState(defaultProjectId)
  const [stageId, setStageId] = useState(initialStageId)
  const [pending, setPending] = useState(false)
  const queryClient = useQueryClient()

  const filteredStages = allStages.filter(s => s.project_id === selectedProjectId)

  const handleAdd = async () => {
    if (!selected) return
    setPending(true)
    try {
      const template = CHECKLIST_TEMPLATES.find(t => t.id === selected)
      const newChecklist = await createChecklistFromTemplate(selectedProjectId, stageId || null, selected)
      if (newChecklist) {
        queryClient.invalidateQueries({ queryKey: ['checklists-all'] })
        queryClient.invalidateQueries({ queryKey: ['project', selectedProjectId] })
        if (onSuccess) onSuccess(newChecklist)
        toast.success(t('checklists.added_from_template').replace('{{name}}', template?.name || ''))
      }
    } catch (err) {
      console.error(err)
      toast.error(t('common.error'))
    }
    setPending(false)
    setIsOpen(false)
    setSelected(null)
    if (!lockStage) setStageId('')
  }

  if (!isOpen) return (
    <Button 
      onClick={() => setIsOpen(true)} 
      variant={variant}
      size={variant === 'ghost' ? 'sm' : undefined}
      className={variant === 'ghost' ? 'h-8 text-xs px-2' : ''}
    >
      <Layout className="w-4 h-4 mr-2" />
      {variant === 'ghost' ? t('checklists.add_from_template_short') : t('checklists.add_from_template')}
    </Button>
  )

  return (
    <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-xl shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('checklists.select_template')}</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}><X className="w-4 h-4" /></Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {projects.length > 1 && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t('checklists.select_project')}</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedProjectId}
                onChange={e => { setSelectedProjectId(e.target.value); setStageId('') }}
              >
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          )}
          {filteredStages.length > 0 && !lockStage && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t('checklists.assign_to_stage')}</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={stageId}
                onChange={e => setStageId(e.target.value)}
              >
                <option value="">{t('checklists.no_stage')}</option>
                {filteredStages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}
          <div className="grid gap-2 max-h-80 overflow-y-auto pr-1">
            {CHECKLIST_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => setSelected(selected === tmpl.id ? null : tmpl.id)}
                className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${selected === tmpl.id ? 'border-primary bg-[var(--primary-glow)]' : 'border-border hover:bg-secondary'
                  }`}
              >
                <ListChecks className={`w-5 h-5 mt-0.5 shrink-0 ${selected === tmpl.id ? 'text-primary' : 'text-muted-foreground'}`} />
                <div>
                  <p className="text-sm font-semibold">{tmpl.name}</p>
                  <p className="text-xs text-muted-foreground">{tmpl.items.length} pozycji · {tmpl.description.slice(0, 60)}…</p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAdd} disabled={!selected || pending} className="w-full">
            {pending ? t('checklists.adding_template') : t('checklists.add_from_template')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
