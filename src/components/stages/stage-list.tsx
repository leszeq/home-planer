'use client'

import { useState } from 'react'
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
import { CheckCircle2, Circle, Clock, GripVertical, Plus, Trash2 } from 'lucide-react'
import { createStage, updateStageStatus, deleteStage, updateStagesOrder } from '@/app/(dashboard)/dashboard/projects/[id]/actions'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

interface Stage {
  id: string
  name: string
  status: string
  order: number
}

function SortableStage({
  stage,
  projectId,
}: {
  stage: Stage
  projectId: string
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: stage.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const nextStatus = stage.status === 'done' ? 'todo' : stage.status === 'in_progress' ? 'done' : 'in_progress'

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-4 bg-card border rounded-xl shadow-sm hover:shadow-md transition-shadow"
    >
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
        <p className="text-xs text-muted-foreground capitalize mt-0.5">
          {stage.status === 'todo' ? 'Do zrobienia' : stage.status === 'in_progress' ? 'W trakcie' : 'Zakończony'}
        </p>
      </div>

      {/* Status Badge */}
      <span className={cn(
        'hidden sm:inline-flex text-xs font-medium px-2.5 py-1 rounded-full',
        stage.status === 'done' ? 'badge-done' : stage.status === 'in_progress' ? 'badge-progress' : 'badge-todo'
      )}>
        {stage.status === 'done' ? 'Gotowe' : stage.status === 'in_progress' ? 'W trakcie' : 'Todo'}
      </span>

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

export function StageList({ projectId, stages: initialStages }: { projectId: string; stages: Stage[] }) {
  const [stages, setStages] = useState(initialStages)
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')

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
              <SortableStage key={stage.id} stage={stage} projectId={projectId} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
