import { createClient } from "@/lib/supabase/server"
import { ChecklistsClientView } from "@/components/checklists/checklists-client-view"

export default async function ChecklistsPage() {
  const supabase = await createClient()

  const { data: projects } = await supabase.from('projects').select('id, name')
  const { data: stages } = await supabase.from('stages').select('id, name, project_id')
  const { data: checklists } = await supabase
    .from('checklists')
    .select('*, checklist_items(*)')
    .order('order', { ascending: true })

  return (
    <ChecklistsClientView
      checklists={checklists || []}
      projects={projects || []}
      stages={stages || []}
    />
  )
}

