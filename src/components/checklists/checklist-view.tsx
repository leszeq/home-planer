'use client'

import { useState, useOptimistic } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  toggleChecklistItem,
  deleteChecklist,
  addChecklistItem,
  deleteChecklistItem,
  updateChecklistItemsOrder,
} from '@/app/(dashboard)/dashboard/checklists/actions'
import { CheckCircle2, Circle, Trash2, ChevronDown, ChevronUp, GripVertical, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Item { id: string; content: string; is_done: boolean; order: number }
interface Checklist { id: string; name: string; checklist_items: Item[] }

function SortableItem({
  item,
  checklistId,
}: {
  item: Item
  checklistId: string
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 px-3 py-2.5 hover:bg-secondary/30 transition-colors group/item border-b border-border/30 last:border-0"
    >
      <button
        {...attributes}
        {...listeners}
        className="text-muted-foreground/30 hover:text-muted-foreground cursor-grab active:cursor-grabbing shrink-0 touch-none"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <button
        type="button"
        className="shrink-0"
        onClick={() => toggleChecklistItem(item.id, !item.is_done, checklistId)}
      >
        {item.is_done ? (
          <CheckCircle2 className="w-5 h-5 text-[var(--accent-green)]" />
        ) : (
          <Circle className="w-5 h-5 text-muted-foreground" />
        )}
      </button>
      <span className={cn('text-sm leading-relaxed flex-1', item.is_done && 'line-through text-muted-foreground')}>
        {item.content}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0 opacity-0 group-hover/item:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
        onClick={() => deleteChecklistItem(item.id)}
      >
        <X className="w-3 h-3" />
      </Button>
    </div>
  )
}

export function ChecklistView({ checklist, projectId }: { checklist: Checklist; projectId: string }) {
  const [isOpen, setIsOpen] = useState(true)
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [newItem, setNewItem] = useState('')
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [items, setItems] = useState(
    [...(checklist.checklist_items ?? [])].sort((a, b) => a.order - b.order)
  )

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const doneCount = items.filter(i => i.is_done).length
  const progress = items.length > 0 ? (doneCount / items.length) * 100 : 0

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex(i => i.id === active.id)
    const newIndex = items.findIndex(i => i.id === over.id)
    const reordered = arrayMove(items, oldIndex, newIndex)
    setItems(reordered)
    await updateChecklistItemsOrder(checklist.id, reordered.map(i => i.id))
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItem.trim()) return
    setIsAddingItem(false)
    const optimisticItem = { id: `temp-${Date.now()}`, content: newItem.trim(), is_done: false, order: items.length }
    setItems(prev => [...prev, optimisticItem])
    setNewItem('')
    await addChecklistItem(checklist.id, newItem.trim(), projectId)
  }

  return (
    <div className="border rounded-xl overflow-hidden bg-card shadow-sm">
      {/* Header */}
      <div
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-secondary/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold">{checklist.name}</h3>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full badge-progress">
              {doneCount}/{items.length}
            </span>
          </div>
          <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={() => { setIsOpen(true); setIsAddingItem(true) }}
            title="Dodaj zadanie"
          >
            <Plus className="w-4 h-4" />
          </Button>
          {isConfirmingDelete ? (
            <div className="flex items-center gap-1 bg-destructive/10 border border-destructive/30 rounded-lg px-2 py-1 animate-fade-in">
              <span className="text-xs text-destructive font-medium whitespace-nowrap">Usunąć?</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-destructive hover:bg-destructive/20"
                onClick={() => deleteChecklist(checklist.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground"
                onClick={() => setIsConfirmingDelete(false)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => setIsConfirmingDelete(true)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </div>

      {/* Items */}
      {isOpen && (
        <div className="border-t max-h-[500px] overflow-y-auto">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
              {items.map(item => (
                <SortableItem key={item.id} item={item} checklistId={checklist.id} />
              ))}
            </SortableContext>
          </DndContext>

          {items.length === 0 && !isAddingItem && (
            <p className="text-xs text-muted-foreground italic text-center py-6">
              Brak zadań. Kliknij + aby dodać pierwsze.
            </p>
          )}

          {/* Inline Add Item */}
          {isAddingItem ? (
            <form onSubmit={handleAddItem} className="flex items-center gap-2 px-3 py-2.5 border-t bg-secondary/20">
              <Circle className="w-5 h-5 text-muted-foreground/40 shrink-0" />
              <Input
                autoFocus
                value={newItem}
                onChange={e => setNewItem(e.target.value)}
                placeholder="Nowe zadanie..."
                className="h-8 text-sm border-0 bg-transparent focus-visible:ring-0 p-0 flex-1"
                onKeyDown={e => e.key === 'Escape' && (setIsAddingItem(false), setNewItem(''))}
              />
              <Button size="sm" type="submit" className="h-7 text-xs">Dodaj</Button>
              <Button size="sm" variant="ghost" type="button" className="h-7 w-7 p-0" onClick={() => { setIsAddingItem(false); setNewItem('') }}>
                <X className="w-4 h-4" />
              </Button>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingItem(true)}
              className="w-full text-xs text-muted-foreground/70 hover:text-muted-foreground hover:bg-secondary/20 flex items-center gap-2 px-4 py-3 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Dodaj zadanie
            </button>
          )}
        </div>
      )}
    </div>
  )
}
