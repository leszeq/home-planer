'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { CheckCircle2, Circle, Clock, MoreVertical, Plus, Trash2 } from 'lucide-react'
import { createStage, updateStageStatus, deleteStage } from '@/app/(dashboard)/projects/[id]/actions'
import { cn } from '@/lib/utils'

export function StageList({ projectId, stages }: { projectId: string, stages: any[] }) {
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName) return
    await createStage(projectId, newName, stages.length + 1)
    setNewName('')
    setIsAdding(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Building Stages</h3>
        <Button variant="outline" size="sm" onClick={() => setIsAdding(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Stage
        </Button>
      </div>

      {isAdding && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleAdd} className="flex gap-2">
              <Input 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)} 
                placeholder="Stage name (e.g. Foundations)"
                autoFocus
              />
              <Button type="submit">Save</Button>
              <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {stages.length === 0 && !isAdding && (
          <p className="text-muted-foreground text-sm italic">No stages defined yet.</p>
        )}
        {stages.map((stage) => (
          <div 
            key={stage.id} 
            className="flex items-center justify-between p-4 bg-card border rounded-lg hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  const nextStatus = stage.status === 'done' ? 'todo' : stage.status === 'in_progress' ? 'done' : 'in_progress'
                  updateStageStatus(projectId, stage.id, nextStatus)
                }}
              >
                {stage.status === 'done' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : stage.status === 'in_progress' ? (
                  <Clock className="w-5 h-5 text-blue-500" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground" />
                )}
              </Button>
              <div>
                <p className={cn("font-medium", stage.status === 'done' && "line-through text-muted-foreground")}>
                  {stage.name}
                </p>
                <p className="text-xs text-muted-foreground capitalize">Status: {stage.status.replace('_', ' ')}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => deleteStage(projectId, stage.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
