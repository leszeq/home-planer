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
}: {
  stage: Stage
  projectId: string
  checklists: Checklist[]
  onDeleteChecklist: (checklistId: string) => void
  onAddChecklist: (checklist: any) => void
  onUpdateChecklist: (checklistId: string, items: ChecklistItem[]) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: stage.id })
  const [isEditingDates, setIsEditingDates] = useState(false)
  const [startDate, setStartDate] = useState(stage.start_date || '')
  const [endDate, setEndDate] = useState(stage.end_date || '')
  const [isSavingDates, setIsSavingDates] = useState(false)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const nextStatus = stage.status === 'done' ? 'todo' : stage.status === 'in_progress' ? 'done' : 'in_progress'

  const handleSaveDates = async () => {
    setIsSavingDates(true)
    await updateStageDates(projectId, stage.id, startDate || null, endDate || null)
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
          onClick={() => updateStageStatus(projectId, stage.id, nextStatus)}
          className="shrink-0"
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
              {stage.status === 'todo' ? 'Do zrobienia' : stage.status === 'in_progress' ? 'W trakcie' : 'Zakończony'}
            </p>
            {(stage.start_date || stage.end_date) && (
              <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded border border-border/50 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {stage.start_date ? new Date(stage.start_date).toLocaleDateString('pl-PL') : '...'} - {stage.end_date ? new Date(stage.end_date).toLocaleDateString('pl-PL') : '...'}
              </span>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <span className={cn(
          'hidden sm:inline-flex text-xs font-medium px-2.5 py-1 rounded-full',
          stage.status === 'done' ? 'badge-done' : stage.status === 'in_progress' ? 'badge-progress' : 'badge-todo'
        )}>
          {stage.status === 'done' ? 'Gotowe' : stage.status === 'in_progress' ? 'W trakcie' : 'Todo'}
        </span>

        {/* Calendar Edit */}
        <Button
          variant="ghost"
          size="icon"
          className={cn("hover:text-primary shrink-0 transition-colors", isEditingDates ? "text-primary bg-primary/10" : "text-muted-foreground")}
          onClick={() => setIsEditingDates(!isEditingDates)}
        >
          <Calendar className="w-4 h-4" />
        </Button>

        {/* Delete */}
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive shrink-0"
          onClick={() => deleteStage(projectId, stage.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {isEditingDates && (
        <div className="px-4 py-3 bg-secondary/30 rounded-lg mx-2 mt-1 mb-2 text-sm border border-border/50 animate-fade-in">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Data Rozpoczęcia</label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="h-9 text-xs" />
            </div>
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Data Zakończenia</label>
              <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="h-9 text-xs" />
            </div>
          </div>
          <div className="flex justify-end mt-4 gap-2">
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setIsEditingDates(false)}>Anuluj</Button>
            <Button size="sm" className="h-8 text-xs" disabled={isSavingDates} onClick={handleSaveDates}>Zapisz Daty</Button>
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
          />
        ))}
        <CreateChecklistForm 
          projectId={projectId} 
          stageId={stage.id} 
          label="+ Checklista" 
          onSuccess={onAddChecklist}
        />
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

export function StageList({ projectId, stages: initialStages, checklists: initialChecklists = [] }: { projectId: string; stages: Stage[]; checklists?: Checklist[] }) {
  const [stages, setStages] = useState(initialStages)
  const [checklists, setChecklists] = useState(initialChecklists)
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')

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
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = stages.findIndex(s => s.id === active.id)
    const newIndex = stages.findIndex(s => s.id === over.id)
    const reordered = arrayMove(stages, oldIndex, newIndex)
    setStages(reordered)
    await updateStagesOrder(projectId, reordered.map(s => s.id))
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    await createStage(projectId, newName, stages.length + 1)
    setNewName('')
    setIsAdding(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Etapy budowy</h3>
        <Button variant="outline" size="sm" onClick={() => setIsAdding(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Dodaj etap
        </Button>
      </div>

      {isAdding && (
        <Card>
          <CardContent className="pt-4 pb-4">
            <form onSubmit={handleAdd} className="flex flex-col gap-3">
              <div className="flex gap-2">
                <Input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Wpisz własną nazwę lub wybierz poniżej..."
                  autoFocus
                />
                <Button type="submit" disabled={!newName.trim()}>Zapisz</Button>
                <Button variant="ghost" type="button" onClick={() => setIsAdding(false)}>Anuluj</Button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {SUGGESTED_STAGES.map(suggestion => (
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
          Brak etapów. Dodaj pierwszy etap budowy.
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
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
