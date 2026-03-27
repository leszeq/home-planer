'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CHECKLIST_TEMPLATES } from '@/lib/checklist-templates'
import { createChecklistFromTemplate } from '@/app/(dashboard)/dashboard/checklists/actions'
import { Plus, X, ListChecks } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'

export function AddChecklistModal({ projectId, stages }: { projectId: string, stages: { id: string; name: string }[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [stageId, setStageId] = useState('')
  const [pending, setPending] = useState(false)

  const handleAdd = async () => {
    if (!selected) return
    setPending(true)
    await createChecklistFromTemplate(projectId, stageId || null, selected)
    setPending(false)
    setIsOpen(false)
    setSelected(null)
  }

  if (!isOpen) return (
    <Button onClick={() => setIsOpen(true)}>
      <Plus className="w-4 h-4 mr-2" />
      Dodaj z szablonu
    </Button>
  )

  return (
    <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-xl shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Wybierz szablon checklisty</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}><X className="w-4 h-4" /></Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {stages.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Przypisz do etapu (opcjonalnie)</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={stageId}
                onChange={e => setStageId(e.target.value)}
              >
                <option value="">Bez etapu</option>
                {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}
          <div className="grid gap-2 max-h-80 overflow-y-auto pr-1">
            {CHECKLIST_TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelected(selected === t.id ? null : t.id)}
                className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                  selected === t.id ? 'border-primary bg-[var(--primary-glow)]' : 'border-border hover:bg-secondary'
                }`}
              >
                <ListChecks className={`w-5 h-5 mt-0.5 shrink-0 ${selected === t.id ? 'text-primary' : 'text-muted-foreground'}`} />
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.items.length} pozycji · {t.description.slice(0, 60)}…</p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAdd} disabled={!selected || pending} className="w-full">
            {pending ? 'Dodawanie...' : 'Dodaj checklistę'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
