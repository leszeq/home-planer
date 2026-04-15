'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Plus, X, ListChecks, GripVertical } from 'lucide-react'
import { createCustomChecklist } from '@/app/(dashboard)/dashboard/checklists/actions'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import { useQueryClient } from '@tanstack/react-query'

interface Props {
  projectId: string
  stageId?: string | null
  /** Text for the trigger button */
  label?: string
  onSuccess?: (checklist: any) => void
  onOpenChange?: (open: boolean) => void
  projects?: { id: string; name: string }[]
  stages?: { id: string; name: string; project_id: string }[]
}

export function CreateChecklistForm({ projectId: initialProjectId, stageId = null, label, onSuccess, onOpenChange, projects, stages }: Props) {
  const { t } = useTranslation()
  const displayLabel = label || t('checklists.create_new')
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [items, setItems] = useState<string[]>([''])
  const [loading, setLoading] = useState(false)
  const [projectId, setProjectId] = useState(initialProjectId)
  const [internalStageId, setInternalStageId] = useState(stageId || '')
  const queryClient = useQueryClient()
  
  const filteredStages = stages?.filter(s => s.project_id === projectId) || []

  const addItemField = () => setItems(prev => [...prev, ''])
  const removeItemField = (index: number) => setItems(prev => prev.filter((_, i) => i !== index))
  const updateItem = (index: number, value: string) => setItems(prev => prev.map((v, i) => i === index ? value : v))

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (index === items.length - 1) {
        addItemField()
        // Focus next input after render
        setTimeout(() => {
          const inputs = document.querySelectorAll<HTMLInputElement>('[data-item-input]')
          inputs[index + 1]?.focus()
        }, 50)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try {
      const newChecklist = await createCustomChecklist(projectId, internalStageId, name.trim(), items)
      if (newChecklist) {
        queryClient.invalidateQueries({ queryKey: ['checklists-all'] })
        queryClient.invalidateQueries({ queryKey: ['project', projectId] })
        if (onSuccess) onSuccess(newChecklist)
      }
    } catch (err) {
      console.error(err)
    }
    setName('')
    setItems([''])
    setIsOpen(false)
    onOpenChange?.(false)
    setLoading(false)
  }

  const handleOpen = () => {
    setIsOpen(true)
    onOpenChange?.(true)
  }

  const handleClose = () => {
    setIsOpen(false)
    onOpenChange?.(false)
  }

  if (!isOpen) {
    return (
      <Button onClick={handleOpen} className="gap-2">
        <ListChecks className="w-4 h-4" />
        {displayLabel}
      </Button>
    )
  }

  return (
    <Card className="border-primary/20 shadow-md animate-fade-in w-full max-w-6xl mx-auto">
      <CardHeader className="pb-2 pt-6 px-8">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">{t('checklists.create_new')}</CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 px-8 pb-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">{t('checklists.checklist_name')}</label>
            <Input
              autoFocus
              required
              placeholder={t('checklists.custom_name_placeholder')}
              value={name}
              onChange={e => setName(e.target.value)}
              className="h-12 text-base"
            />
          </div>
          {projects && projects.length > 1 && !stageId && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">{t('checklists.select_project')}</label>
              <select 
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={projectId}
                onChange={e => { setProjectId(e.target.value); setInternalStageId('') }}
              >
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          )}
          
          {!stageId && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">{t('checklists.assign_to_stage')}</label>
              {filteredStages.length > 0 ? (
                <select
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={internalStageId}
                  onChange={e => setInternalStageId(e.target.value)}
                >
                  <option value="" disabled>{t('common.select')}</option>
                  {filteredStages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              ) : (
                <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                  Najpierw utwórz etapy w tym projekcie.
                </p>
              )}
            </div>
          )}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground font-semibold">{t('checklists.list_items')}:</p>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <GripVertical className="w-5 h-5 text-muted-foreground/30 shrink-0" />
                  <Input
                    data-item-input
                    placeholder={`${t('checklists.add_item')} ${index + 1}...`}
                    value={item}
                    onChange={e => updateItem(index, e.target.value)}
                    onKeyDown={e => handleKeyDown(e, index)}
                    className="h-11 text-sm flex-1"
                  />
                  {items.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => removeItemField(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" className="h-9 text-xs mt-2" onClick={addItemField}>
              <Plus className="w-4 h-4 mr-1.5" /> {t('checklists.add_item')}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3 px-8 pt-4 pb-8 border-t bg-secondary/5">
          <Button type="button" variant="ghost" className="h-10 px-6" onClick={handleClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" className="h-10 px-10 font-semibold" disabled={loading || !name.trim() || !internalStageId}>
            {loading ? t('common.creating') : t('checklists.save')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
