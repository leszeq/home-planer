'use client'

import { createClient } from "@/lib/supabase/client"
import { ChecklistsClientView } from "@/components/checklists/checklists-client-view"
import { useQuery } from '@tanstack/react-query'
import { ChecklistLoadingSkeleton } from "@/components/projects/project-skeletons"

export function ChecklistDataClient() {
  const supabase = createClient()
  
  const { data, isLoading } = useQuery({
    queryKey: ['checklists-all'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No user")

      const [projectsRes, stagesRes, membershipsRes, checklistsRes] = await Promise.all([
        supabase.from('projects').select('id, name, user_id'),
        supabase.from('stages').select('id, name, project_id'),
        supabase.from('project_members').select('project_id, role').eq('user_id', user.id),
        supabase.from('checklists').select('*, checklist_items(*)').order('order', { ascending: true })
      ])

      const projects = projectsRes.data || []
      const stages = stagesRes.data || []
      const memberships = membershipsRes.data || []
      const checklists = checklistsRes.data || []

      // Build a map of projectId -> role
      const roles: Record<string, string> = {}
      projects.forEach(p => {
        if (p.user_id === user.id) roles[p.id] = 'owner'
      })
      memberships.forEach(m => {
        roles[m.project_id] = m.role
      })

      return {
        checklists,
        projects: projects.map(({id, name}) => ({id, name})),
        stages,
        roles
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // If loading and no data in cache, show skeleton
  if (isLoading && !data) {
    return <ChecklistLoadingSkeleton items={4} />
  }

  // If there's data (even if stale), render it instantly
  if (data) {
    return (
      <ChecklistsClientView
        checklists={data.checklists}
        projects={data.projects}
        stages={data.stages}
        roles={data.roles}
        hideHeader={true}
      />
    )
  }

  return null
}
