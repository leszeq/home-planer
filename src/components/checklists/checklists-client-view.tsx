'use client'

import { useState, useMemo } from 'react'
import { ChecklistView } from '@/components/checklists/checklist-view'
import { CreateChecklistForm } from '@/components/checklists/create-checklist-form'
import { AddChecklistModal } from '@/components/checklists/add-checklist-modal'
import { ClipboardList, LayoutList, Layers, FolderKanban } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ChecklistItem { id: string; content: string; is_done: boolean; order: number }
interface Checklist {
  id: string
  name: string
  project_id: string
  stage_id: string | null
  checklist_items: ChecklistItem[]
}
interface Project { id: string; name: string }
interface Stage { id: string; name: string; project_id: string }

export function ChecklistsClientView({
  checklists,
  projects,
  stages,
}: {
  checklists: Checklist[]
  projects: Project[]
  stages: Stage[]
}) {
  const [groupByProject, setGroupByProject] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

  const projectMap = useMemo(() =>
    Object.fromEntries(projects.map(p => [p.id, p.name])),
    [projects]
  )

  // Filter by project if one is selected
  const filtered = useMemo(() =>
    selectedProjectId ? checklists.filter(cl => cl.project_id === selectedProjectId) : checklists,
    [checklists, selectedProjectId]
  )

  // Group by project
  const grouped = useMemo(() => {
    if (!groupByProject) return null
    const groups: Record<string, Checklist[]> = {}
    for (const cl of filtered) {
      if (!groups[cl.project_id]) groups[cl.project_id] = []
      groups[cl.project_id].push(cl)
    }
    return groups
  }, [filtered, groupByProject])

  const firstProject = projects[0]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Checklisty</h1>
          <p className="text-muted-foreground mt-1">Narzędzia kontroli jakości dla każdego etapu budowy</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {firstProject && (
            <AddChecklistModal
              projectId={firstProject.id}
              stages={stages}
              projects={projects}
            />
          )}
        </div>
      </div>

      {/* Filter & Group Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Group toggle */}
        <Button
          variant={groupByProject ? 'secondary' : 'outline'}
          size="sm"
          className={`gap-2 h-8 text-xs ${groupByProject ? 'ring-1 ring-primary text-primary' : ''}`}
          onClick={() => setGroupByProject(v => !v)}
        >
          <Layers className="w-3.5 h-3.5" />
          Grupuj wg projektu
        </Button>

        <div className="h-5 w-px bg-border" />

        {/* Project filter pills */}
        <button
          onClick={() => setSelectedProjectId(null)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${!selectedProjectId ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
            }`}
        >
          Wszystkie ({checklists.length})
        </button>
        {projects.map(p => {
          const count = checklists.filter(cl => cl.project_id === p.id).length
          if (count === 0) return null
          return (
            <button
              key={p.id}
              onClick={() => setSelectedProjectId(prev => prev === p.id ? null : p.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${selectedProjectId === p.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:bg-secondary/80 border border-border/50'
                }`}
            >
              {p.name} ({count})
            </button>
          )
        })}
      </div>

      {/* Templates info banner */}
      <div className="flex items-start gap-3 p-4 bg-[var(--primary-glow)] border border-primary/20 rounded-xl text-sm">
        <ClipboardList className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-primary">10 profesjonalnych szablonów checklisty</p>
          <p className="text-muted-foreground mt-0.5">
            Gotowe listy kontrolne: fundamenty (54 pkt), płyta (30 pkt), stan surowy (92 pkt), okna (13 pkt), instalacje (78 pkt), termoizolacja (13 pkt), elewacja (18 pkt).
          </p>
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center p-16 border-2 border-dashed rounded-xl text-center">
          <ClipboardList className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Brak checklisty</h3>
          <p className="text-muted-foreground mt-1">Dodaj pierwszą checklistę z gotowego szablonu budowlanego.</p>
        </div>
      )}

      {/* Checklists */}
      {grouped ? (
        // Grouped view
        <div className="space-y-8">
          {Object.entries(grouped).map(([projectId, cls]) => (
            <div key={projectId}>
              <div className="flex items-center gap-2 mb-4">
                <FolderKanban className="w-4 h-4 text-primary" />
                <h2 className="text-base font-bold">{projectMap[projectId] ?? 'Nieznany projekt'}</h2>
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{cls.length}</span>
              </div>
              <div className="space-y-3 pl-2 border-l-2 border-primary/20">
                {cls.map(cl => (
                  <ChecklistWithProjectBadge key={cl.id} checklist={cl} projectName={projectMap[cl.project_id]} showBadge={false} />
                ))}
              </div>
              {/* Add custom checklist to this project */}
              <div className="pl-2 mt-3">
                <CreateChecklistForm projectId={projectId} label="+ Nowa checklista" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Flat view
        <div className="space-y-3">
          {filtered.map(cl => (
            <ChecklistWithProjectBadge key={cl.id} checklist={cl} projectName={projectMap[cl.project_id]} showBadge />
          ))}
        </div>
      )}
    </div>
  )
}

function ChecklistWithProjectBadge({
  checklist,
  projectName,
  showBadge,
}: {
  checklist: Checklist
  projectName: string
  showBadge: boolean
}) {
  return (
    <div className="space-y-1.5">
      {showBadge && projectName && (
        <div className="flex items-center gap-1.5 ml-1">
          <FolderKanban className="w-3 h-3 text-muted-foreground" />
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{projectName}</span>
        </div>
      )}
      <ChecklistView
        checklist={{ ...checklist, checklist_items: checklist.checklist_items ?? [] }}
        projectId={checklist.project_id}
      />
    </div>
  )
}
