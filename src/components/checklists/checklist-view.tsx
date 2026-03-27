'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toggleChecklistItem, deleteChecklist } from '@/app/(dashboard)/dashboard/checklists/actions'
import { CheckCircle2, Circle, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Item { id: string; content: string; is_done: boolean }
interface Checklist { id: string; name: string; checklist_items: Item[] }

export function ChecklistView({ checklist }: { checklist: Checklist }) {
  const [isOpen, setIsOpen] = useState(true)
  
  const items = checklist.checklist_items ?? []
  const doneCount = items.filter(i => i.is_done).length
  const progress = items.length > 0 ? (doneCount / items.length) * 100 : 0

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
        <div className="flex items-center gap-2">
          <form action={async () => { await deleteChecklist(checklist.id) }}>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={(e) => e.stopPropagation()}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </form>
          {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>

      {/* Items */}
      {isOpen && (
        <div className="divide-y border-t max-h-[500px] overflow-y-auto">
          {items.map((item) => (
            <label
              key={item.id}
              className="flex items-start gap-3 px-4 py-2.5 cursor-pointer hover:bg-secondary/30 transition-colors"
            >
              <button
                type="button"
                className="mt-0.5 shrink-0"
                onClick={() => toggleChecklistItem(item.id, !item.is_done, checklist.id)}
              >
                {item.is_done ? (
                  <CheckCircle2 className="w-5 h-5 text-[var(--accent-green)]" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
              <span className={cn(
                "text-sm leading-relaxed",
                item.is_done && "line-through text-muted-foreground"
              )}>
                {item.content}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
