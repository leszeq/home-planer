'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle2, Circle, Clock, GripVertical, Plus, Trash2, Calendar } from 'lucide-react'
import { createStage, updateStageStatus, deleteStage, updateStagesOrder, updateStageDates } from '@/app/(dashboard)/dashboard/projects/[id]/actions'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { ChecklistView } from '@/components/checklists/checklist-view'
import { CreateChecklistForm } from '@/components/checklists/create-checklist-form'
import { AddChecklistModal } from '@/components/checklists/add-checklist-modal'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface Stage {
  id: string
  name: string
  status: string
  order: number
  start_date?: string | null
  end_date?: string | null
}

interface ChecklistItem { id: string; content: string; is_done: boolean; order: number }
interface Checklist { id: string; name: string; checklist_items: ChecklistItem[], stage_id: string | null }
function SortableStage({
  stage,
  projectId,
  checklists,
  onDeleteChecklist,
  onAddChecklist,
  onUpdateChecklist,
  allStages,
  canEdit,
}: {
  stage: Stage
  projectId: string
  checklists: Checklist[]
  onDeleteChecklist: (checklistId: string) => void
  onAddChecklist: (checklist: any) => void
  onUpdateChecklist: (checklistId: string, items: ChecklistItem[]) => void
  allStages: Stage[]
  canEdit?: boolean
}) {
  const { t, locale } = useTranslation()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: stage.id,
    disabled: !canEdit
  })
  const [isEditingDates, setIsEditingDates] = useState(false)
  const [startDate, setStartDate] = useState(stage.start_date || '')
  const [endDate, setEndDate] = useState(stage.end_date || '')
  const [isSavingDates, setIsSavingDates] = useState(false)
  const queryClient = useQueryClient()

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const nextStatus = stage.status === 'done' ? 'todo' : stage.status === 'in_progress' ? 'done' : 'in_progress'

  const handleSaveDates = async () => {
    setIsSavingDates(true)
    const res = await updateStageDates(projectId, stage.id, startDate || null, endDate || null)
    if (res.success) {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
    }
    setIsSavingDates(false)
    setIsEditingDates(false)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col gap-3 p-4 bg-card border rounded-xl shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-3">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing p-0.5 rounded"
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Status Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={async () => {
            const res = await updateStageStatus(projectId, stage.id, nextStatus)
            if (res.success) {
              queryClient.invalidateQueries({ queryKey: ['project', projectId] })
              const statusLabel = nextStatus === 'done' ? t('projects.status_done') : nextStatus === 'in_progress' ? t('projects.status_in_progress') : t('projects.status_todo')
              toast.success(`${t('projects.stage_status_changed').replace('{{status}}', statusLabel)}`)
            } else {
              toast.error(res.error || t('common.error'))
            }
          }}
          className="shrink-0"
          disabled={!canEdit}
        >
          {stage.status === 'done' ? (
            <CheckCircle2 className="w-5 h-5 text-[var(--accent-green)]" />
          ) : stage.status === 'in_progress' ? (
            <Clock className="w-5 h-5 text-primary" />
          ) : (
            <Circle className="w-5 h-5 text-muted-foreground" />
          )}
        </Button>

        {/* Stage Name */}
        <div className="flex-1 min-w-0">
          <p className={cn('font-medium text-sm truncate', stage.status === 'done' && 'line-through text-muted-foreground')}>
            {stage.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-muted-foreground capitalize">
              {stage.status === 'todo' ? t('projects.status_todo') : stage.status === 'in_progress' ? t('projects.status_in_progress') : t('projects.status_done')}
            </p>
            {(stage.start_date || stage.end_date) && (
              <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded border border-border/50 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {stage.start_date ? new Date(stage.start_date).toLocaleDateString(locale === 'pl' ? 'pl-PL' : 'en-US') : '...'} - {stage.end_date ? new Date(stage.end_date).toLocaleDateString(locale === 'pl' ? 'pl-PL' : 'en-US') : '...'}
              </span>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <span className={cn(
          'hidden sm:inline-flex text-xs font-medium px-2.5 py-1 rounded-full',
          stage.status === 'done' ? 'badge-done' : stage.status === 'in_progress' ? 'badge-progress' : 'badge-todo'
        )}>
          {stage.status === 'done' ? t('projects.status_done') : stage.status === 'in_progress' ? t('projects.status_in_progress') : t('projects.status_todo')}
        </span>

        {/* Calendar Edit */}
        {canEdit && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className={cn("hover:text-primary shrink-0 transition-colors", isEditingDates ? "text-primary bg-primary/10" : "text-muted-foreground")}
              onClick={() => setIsEditingDates(!isEditingDates)}
            >
              <Calendar className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive shrink-0"
              onClick={async () => {
                const res = await deleteStage(projectId, stage.id)
                if (res.success) {
                  queryClient.invalidateQueries({ queryKey: ['project', projectId] })
                  toast.success(t('projects.stage_deleted'))
                } else {
                  toast.error(res.error || t('common.error'))
                }
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>

      {isEditingDates && (
        <div className="px-4 py-3 bg-secondary/30 rounded-lg mx-2 mt-1 mb-2 text-sm border border-border/50 animate-fade-in">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{t('stages.start_date')}</label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="h-9 text-xs" />
            </div>
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{t('stages.end_date')}</label>
              <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="h-9 text-xs" />
            </div>
          </div>
          <div className="flex justify-end mt-4 gap-2">
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setIsEditingDates(false)}>{t('common.cancel')}</Button>
            <Button size="sm" className="h-8 text-xs" disabled={isSavingDates} onClick={handleSaveDates}>{t('stages.save_dates')}</Button>
          </div>
        </div>
      )}

      {/* Checklists for this stage */}
      <div className="pl-9 pr-2 space-y-2 mt-2">
        {checklists.map(cl => (
          <ChecklistView 
            key={cl.id} 
            checklist={{...cl, checklist_items: cl.checklist_items || []}} 
            projectId={projectId}
            onDelete={() => onDeleteChecklist(cl.id)}
            onItemChange={(newItems) => onUpdateChecklist(cl.id, newItems)}
            onItemsOrderChange={(newItems) => onUpdateChecklist(cl.id, newItems)}
            canEdit={canEdit}
          />
        ))}
        {canEdit && (
          <div className="flex items-center gap-2">
            <CreateChecklistForm 
              projectId={projectId} 
              stageId={stage.id} 
              label="+ Checklista" 
              onSuccess={onAddChecklist}
            />
            <AddChecklistModal
              projectId={projectId}
              stages={allStages.map((s: Stage) => ({ ...s, project_id: projectId }))}
              onSuccess={onAddChecklist}
              initialStageId={stage.id}
              lockStage={true}
              variant="ghost"
            />
          </div>
        )}
      </div>
    </div>
  )
}

const SUGGESTED_STAGES = [
  'Działka i formalności',
  'Stan zero (Fundamenty, Płyta)',
  'Stan surowy otwarty',
  'Stan surowy zamknięty (Okna, Dach)',
  'Instalacje wewnętrzne',
  'Tynki i wylewki',
  'Termoizolacja poddasza',
  'Ocieplenie i elewacja',
  'Prace wykończeniowe',
  'Urządzanie i meble',
  'Odbiór i przeprowadzka'
]

export function StageList({ 
  projectId, 
  stages: initialStages, 
  checklists: initialChecklists = [],
  canEdit = true
}: { 
  projectId: string; 
  stages: Stage[]; 
  checklists?: Checklist[] 
  canEdit?: boolean
}) {
  const { t } = useTranslation()
  const [stages, setStages] = useState(initialStages)
  const [checklists, setChecklists] = useState(initialChecklists)
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const queryClient = useQueryClient()

  const suggestedStages = t('stages.suggested_list') as string[]

  // Sync local state when server data changes
  useEffect(() => {
    setStages(initialStages)
    setChecklists(initialChecklists)
  }, [initialStages, initialChecklists])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!canEdit) return
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = stages.findIndex(s => s.id === active.id)
    const newIndex = stages.findIndex(s => s.id === over.id)
    const reordered = arrayMove(stages, oldIndex, newIndex)
    setStages(reordered)
    const res = await updateStagesOrder(projectId, reordered.map(s => s.id))
    if (res.success) {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    const res = await createStage(projectId, newName, stages.length + 1)
    if (res.success) {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      toast.success(t('projects.stage_added').replace('{{name}}', newName))
      setNewName('')
      setIsAdding(false)
    } else {
      toast.error(res.error || t('common.error'))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">{t('stages.title')}</h3>
        {canEdit && (
          <Button variant="outline" size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t('projects.add_stage')}
          </Button>
        )}
      </div>

      {isAdding && (
        <Card>
          <CardContent className="pt-4 pb-4">
            <form onSubmit={handleAdd} className="flex flex-col gap-3">
              <div className="flex gap-2">
                <Input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder={t('stages.suggested_title')}
                  autoFocus
                />
                <Button type="submit" disabled={!newName.trim()}>{t('common.save')}</Button>
                <Button variant="ghost" type="button" onClick={() => setIsAdding(false)}>{t('common.cancel')}</Button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {suggestedStages.map(suggestion => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setNewName(suggestion)}
                    className="text-[10px] font-medium bg-secondary text-secondary-foreground px-2 py-1 rounded-full hover:bg-[var(--primary-glow)] hover:text-primary transition-colors border border-transparent hover:border-primary/20"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {stages.length === 0 && !isAdding && (
        <p className="text-muted-foreground text-sm italic text-center py-8">
          {t('stages.no_stages')}
        </p>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={stages.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {stages.map(stage => (
              <SortableStage 
                key={stage.id} 
                stage={stage} 
                projectId={projectId} 
                checklists={checklists.filter(cl => cl.stage_id === stage.id)} 
                onDeleteChecklist={(id) => setChecklists(prev => prev.filter(c => c.id !== id))}
                onAddChecklist={(cl) => setChecklists(prev => [cl, ...prev])}
                onUpdateChecklist={(id, newItems) => setChecklists(prev => prev.map(c => c.id === id ? { ...c, checklist_items: newItems } : c))}
                allStages={stages}
                canEdit={canEdit}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
