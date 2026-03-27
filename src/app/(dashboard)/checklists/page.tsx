import { createClient } from "@/lib/supabase/server"
import { AddChecklistModal } from "@/components/checklists/add-checklist-modal"
import { ChecklistView } from "@/components/checklists/checklist-view"
import { ClipboardList } from "lucide-react"

export default async function ChecklistsPage() {
  const supabase = await createClient()

  // Get all projects to choose from
  const { data: projects } = await supabase.from('projects').select('id, name')

  // Get all checklists with items
  const { data: checklists } = await supabase
    .from('checklists')
    .select('*, checklist_items(*)')
    .order('created_at', { ascending: false })

  // Get all stages for modal
  const { data: stages } = await supabase.from('stages').select('id, name, project_id')

  // Use first project as default (user can expand this later)
  const firstProject = projects?.[0]

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Checklisty</h1>
          <p className="text-muted-foreground mt-1">Narzędzia kontroli jakości dla każdego etapu budowy</p>
        </div>
        {firstProject && (
          <AddChecklistModal
            projectId={firstProject.id}
            stages={stages?.filter(s => s.project_id === firstProject.id) ?? []}
          />
        )}
      </div>

      {/* Templates info banner */}
      <div className="flex items-start gap-3 p-4 bg-[var(--primary-glow)] border border-primary/20 rounded-xl text-sm">
        <ClipboardList className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-primary">7 profesjonalnych szablonów checklisty</p>
          <p className="text-muted-foreground mt-0.5">
            Gotowe listy kontrolne oparte na polskich normach budowlanych: fundamenty tradycyjne (54 pkt),
            płyta fundamentowa (30 pkt), stan surowy otwarty (92 pkt), okna i drzwi (13 pkt),
            instalacje + tynki (78 pkt), termoizolacja poddasza (13 pkt), elewacja (18 pkt).
          </p>
        </div>
      </div>

      {/* Checklists */}
      {!checklists || checklists.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 border-2 border-dashed rounded-xl text-center">
          <ClipboardList className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Brak checklisty</h3>
          <p className="text-muted-foreground mt-1">Dodaj pierwszą checklistę z gotowego szablonu budowlanego.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {checklists.map((cl) => (
            <ChecklistView key={cl.id} checklist={cl} />
          ))}
        </div>
      )}
    </div>
  )
}
