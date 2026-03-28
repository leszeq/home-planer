'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Plus, X, ListChecks, GripVertical } from 'lucide-react'
import { createCustomChecklist } from '@/app/(dashboard)/dashboard/checklists/actions'

interface Props {
  projectId: string
  stageId?: string | null
  /** Text for the trigger button */
  label?: string
  onSuccess?: (checklist: any) => void
}

export function CreateChecklistForm({ projectId, stageId = null, label = 'Nowa Checklista', onSuccess }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [items, setItems] = useState<string[]>([''])
  const [loading, setLoading] = useState(false)

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
      const newChecklist = await createCustomChecklist(projectId, stageId, name.trim(), items)
      if (newChecklist && onSuccess) {
        onSuccess(newChecklist)
      }
    } catch (err) {
      console.error(err)
    }
    setName('')
    setItems([''])
    setIsOpen(false)
    setLoading(false)
  }

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="gap-2">
        <ListChecks className="w-4 h-4" />
        {label}
      </Button>
    )
  }

  return (
    <Card className="border-primary/20 shadow-md animate-fade-in w-full max-w-2xl mx-auto">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Nowa checklista</CardTitle>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsOpen(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-3 px-4 pb-2">
          <Input
            autoFocus
            required
            placeholder="Nazwa checklisty (np. 'Odbiór instalacji')"
            value={name}
            onChange={e => setName(e.target.value)}
            className="h-9 text-sm"
          />
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Zadania (opcjonalnie):</p>
            {items.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-muted-foreground/30 shrink-0" />
                <Input
                  data-item-input
                  placeholder={`Zadanie ${index + 1}...`}
                  value={item}
                  onChange={e => updateItem(index, e.target.value)}
                  onKeyDown={e => handleKeyDown(e, index)}
                  className="h-8 text-xs flex-1"
                />
                {items.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeItemField(index)}>
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={addItemField}>
              <Plus className="w-3 h-3 mr-1" /> Dodaj zadanie
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 px-4 pt-2 pb-4">
          <Button type="button" variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setIsOpen(false)}>
            Anuluj
          </Button>
          <Button type="submit" size="sm" className="h-8 text-xs" disabled={loading || !name.trim()}>
            Utwórz
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
