import { createClient } from "@/lib/supabase/server"
import { ChecklistsClientView } from "@/components/checklists/checklists-client-view"

export default async function ChecklistsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: projects } = await supabase.from('projects').select('id, name, user_id')
  const { data: stages } = await supabase.from('stages').select('id, name, project_id')
  const { data: memberships } = await supabase.from('project_members').select('project_id, role').eq('user_id', user?.id)

  const { data: checklists } = await supabase
    .from('checklists')
    .select('*, checklist_items(*)')
    .order('order', { ascending: true })

  // Build a map of projectId -> role
  const roles: Record<string, string> = {}
  projects?.forEach(p => {
    if (p.user_id === user?.id) roles[p.id] = 'owner'
  })
  memberships?.forEach(m => {
    roles[m.project_id] = m.role
  })

  return (
    <ChecklistsClientView
      checklists={checklists || []}
      projects={projects?.map(({id, name}) => ({id, name})) || []}
      stages={stages || []}
      roles={roles}
    />
  )
}

