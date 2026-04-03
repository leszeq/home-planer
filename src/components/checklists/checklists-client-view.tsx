'use client'

import { useState, useMemo } from 'react'
import { cn } from "@/lib/utils"
import { ChecklistView } from '@/components/checklists/checklist-view'
import { CreateChecklistForm } from '@/components/checklists/create-checklist-form'
import { AddChecklistModal } from '@/components/checklists/add-checklist-modal'
import { ClipboardList, Layers, FolderKanban, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import { updateChecklistsOrder } from '@/app/(dashboard)/dashboard/checklists/actions'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
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

interface ChecklistItem { id: string; content: string; is_done: boolean; order: number }
interface Checklist {
  id: string
  name: string
  project_id: string
  stage_id: string | null
  checklist_items: ChecklistItem[]
  order?: number
}
interface Project { id: string; name: string }
interface Stage { id: string; name: string; project_id: string }

function SortableChecklist({
  checklist,
  projectName,
  showBadge,
  onDelete,
  onItemChange,
  onItemsOrderChange,
  canEdit,
}: {
  checklist: Checklist
  projectName: string
  showBadge: boolean
  onDelete: () => void
  onItemChange?: (items: ChecklistItem[]) => void
  onItemsOrderChange?: (items: ChecklistItem[]) => void
  canEdit?: boolean
}) {
  const { t } = useTranslation()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: checklist.id, disabled: !canEdit })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="space-y-1.5">
      {showBadge && projectName && (
        <div className="flex items-center gap-1.5 ml-1">
          <FolderKanban className="w-3 h-3 text-muted-foreground" />
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{projectName}</span>
        </div>
      )}
      <div className="flex items-start gap-1.5">
        {/* Drag handle */}
        {canEdit && (
          <button
            {...attributes}
            {...listeners}
            className="mt-4 text-muted-foreground/30 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none shrink-0"
            title={t('common.drag_to_reorder')}
          >
            <GripVertical className="w-4 h-4" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <ChecklistView
            checklist={{ ...checklist, checklist_items: checklist.checklist_items ?? [] }}
            projectId={checklist.project_id}
            onDelete={onDelete}
            onItemChange={onItemChange}
            onItemsOrderChange={onItemsOrderChange}
            canEdit={canEdit}
          />
        </div>
      </div>
    </div>
  )
}

export function ChecklistsClientView({
  checklists: initialChecklists,
  projects,
  stages,
  roles = {},
  hideHeader = false,
}: {
  checklists: Checklist[]
  projects: Project[]
  stages: Stage[]
  roles?: Record<string, string>
  hideHeader?: boolean
}) {
  const { t } = useTranslation()
  const [checklists, setChecklists] = useState(
    [...initialChecklists].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  )
  const [groupByProject, setGroupByProject] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [isCustomCreating, setIsCustomCreating] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const projectMap = useMemo(() =>
    Object.fromEntries(projects.map(p => [p.id, p.name])),
    [projects]
  )

  const filtered = useMemo(() =>
    selectedProjectId ? checklists.filter(cl => cl.project_id === selectedProjectId) : checklists,
    [checklists, selectedProjectId]
  )

  const grouped = useMemo(() => {
    if (!groupByProject) return null
    const groups: Record<string, Checklist[]> = {}
    for (const cl of filtered) {
      if (!groups[cl.project_id]) groups[cl.project_id] = []
      groups[cl.project_id].push(cl)
    }
    return groups
  }, [filtered, groupByProject])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = checklists.findIndex(cl => cl.id === active.id)
    const newIndex = checklists.findIndex(cl => cl.id === over.id)
    const reordered = arrayMove(checklists, oldIndex, newIndex)
    setChecklists(reordered)
    await updateChecklistsOrder(reordered[0]?.project_id ?? '', reordered.map(cl => cl.id))
  }

  const firstProject = projects[0]

  return (
    <div className={cn("space-y-8 animate-fade-in", hideHeader ? "" : "")}>
      {/* Header */}
      {!hideHeader && (
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('checklists.page_title')}</h1>
            <p className="text-muted-foreground mt-1">{t('checklists.page_subtitle')}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {firstProject && (roles[firstProject.id] === 'owner' || roles[firstProject.id] === 'editor') && (
              <AddChecklistModal
                projectId={firstProject.id}
                stages={stages}
                projects={projects.filter(p => roles[p.id] === 'owner' || roles[p.id] === 'editor')}
                onSuccess={(newCl) => setChecklists(prev => [newCl, ...prev])}
              />
            )}
          </div>
        </div>
      )}

      {hideHeader && (
        <div className="flex justify-end -mt-20">
          <div className="flex items-center gap-2 shrink-0">
            {firstProject && (roles[firstProject.id] === 'owner' || roles[firstProject.id] === 'editor') && (
              <AddChecklistModal
                projectId={firstProject.id}
                stages={stages}
                projects={projects.filter(p => roles[p.id] === 'owner' || roles[p.id] === 'editor')}
                onSuccess={(newCl) => setChecklists(prev => [newCl, ...prev])}
              />
            )}
          </div>
        </div>
      )}

      {/* Filter & Group Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant={groupByProject ? 'secondary' : 'outline'}
          size="sm"
          className={`gap-2 h-8 text-xs ${groupByProject ? 'ring-1 ring-primary text-primary' : ''}`}
          onClick={() => setGroupByProject(v => !v)}
        >
          <Layers className="w-3.5 h-3.5" />
          {t('checklists.group_by_project')}
        </Button>

        <div className="h-5 w-px bg-border" />

        <button
          onClick={() => setSelectedProjectId(null)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${!selectedProjectId ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'}`}
        >
          {t('checklists.all_projects')} ({checklists.length})
        </button>
        {projects.map(p => {
          const count = checklists.filter(cl => cl.project_id === p.id).length
          if (count === 0) return null
          return (
            <button
              key={p.id}
              onClick={() => setSelectedProjectId(prev => prev === p.id ? null : p.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${selectedProjectId === p.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:bg-secondary/80 border border-border/50'}`}
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
          <p className="font-semibold text-primary">{t('checklists.templates_banner_title')}</p>
          <p className="text-muted-foreground mt-0.5">
            {t('checklists.templates_banner_desc')}
          </p>
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center p-16 border-2 border-dashed rounded-2xl text-center bg-secondary/10">
          <ClipboardList className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-bold">{t('checklists.no_checklists_title')}</h3>
          <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
            {t('checklists.no_checklists_desc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-8 items-center justify-center">
            {firstProject && (roles[selectedProjectId || firstProject.id] === 'owner' || roles[selectedProjectId || firstProject.id] === 'editor') && (
              <>
                {!isCustomCreating && (
                  <AddChecklistModal
                    projectId={selectedProjectId || firstProject.id}
                    stages={stages}
                    projects={projects.filter(p => roles[p.id] === 'owner' || roles[p.id] === 'editor')}
                    onSuccess={(newCl) => setChecklists(prev => [newCl, ...prev])}
                  />
                )}
                <CreateChecklistForm
                  projectId={selectedProjectId || firstProject.id}
                  projects={projects.filter(p => roles[p.id] === 'owner' || roles[p.id] === 'editor')}
                  label={t('checklists.create_custom')}
                  onSuccess={(newCl) => setChecklists(prev => [newCl, ...prev])}
                  onOpenChange={setIsCustomCreating}
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* Checklists */}
      {grouped ? (
        // Grouped view (no DnD — groups are ordered separately)
        <div className="space-y-8">
          {Object.entries(grouped).map(([projectId, cls]) => (
            <div key={projectId}>
              <div className="flex items-center gap-2 mb-4">
                <FolderKanban className="w-4 h-4 text-primary" />
                <h2 className="text-base font-bold">{projectMap[projectId] ?? t('checklists.unknown_project')}</h2>
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{cls.length}</span>
              </div>
              <div className="space-y-3 pl-2 border-l-2 border-primary/20">
                {cls.map(cl => {
                  const canEdit = roles[cl.project_id] === 'owner' || roles[cl.project_id] === 'editor'
                  return (
                    <div key={cl.id} className="space-y-1.5">
                      <ChecklistView
                        checklist={{ ...cl, checklist_items: cl.checklist_items ?? [] }}
                        projectId={cl.project_id}
                        onDelete={() => setChecklists(prev => prev.filter(c => c.id !== cl.id))}
                        onItemChange={(newItems) => {
                          setChecklists(prev => prev.map(c => c.id === cl.id ? { ...c, checklist_items: newItems } : c))
                        }}
                        onItemsOrderChange={(newItems) => {
                          setChecklists(prev => prev.map(c => c.id === cl.id ? { ...c, checklist_items: newItems } : c))
                        }}
                        canEdit={canEdit}
                      />
                    </div>
                  )
                })}
              </div>
              <div className="pl-2 mt-3">
                {(roles[projectId] === 'owner' || roles[projectId] === 'editor') && (
                  <CreateChecklistForm
                    projectId={projectId}
                    projects={projects.filter(p => roles[p.id] === 'owner' || roles[p.id] === 'editor')}
                    label="+ Nowa checklista"
                    onSuccess={(cl) => setChecklists(prev => [cl, ...prev])}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Flat sortable view
        <DndContext id="checklists-dnd" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filtered.map(cl => cl.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {filtered.map(cl => {
                const canEdit = roles[cl.project_id] === 'owner' || roles[cl.project_id] === 'editor'
                return (
                  <SortableChecklist
                    key={cl.id}
                    checklist={cl}
                    projectName={projectMap[cl.project_id]}
                    showBadge={!selectedProjectId || projects.length > 1}
                    onDelete={() => setChecklists(prev => prev.filter(c => c.id !== cl.id))}
                    onItemChange={(newItems) => {
                      setChecklists(prev => prev.map(c => c.id === cl.id ? { ...c, checklist_items: newItems } : c))
                    }}
                    onItemsOrderChange={(newItems) => {
                      setChecklists(prev => prev.map(c => c.id === cl.id ? { ...c, checklist_items: newItems } : c))
                    }}
                    canEdit={canEdit}
                  />
                )
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Global Add Button (when not grouped or no checklists in flat view) */}
      {!grouped && filtered.length > 0 && (
        <div className="flex justify-center pt-4">
          {(roles[selectedProjectId || firstProject?.id || ''] === 'owner' || roles[selectedProjectId || firstProject?.id || ''] === 'editor') && (
            <CreateChecklistForm
              projectId={selectedProjectId || firstProject?.id || ''}
              projects={projects.filter(p => roles[p.id] === 'owner' || roles[p.id] === 'editor')}
              label="+ Kolejna checklista"
              onSuccess={(cl) => setChecklists(prev => [cl, ...prev])}
            />
          )}
        </div>
      )}
    </div>
  )
}
