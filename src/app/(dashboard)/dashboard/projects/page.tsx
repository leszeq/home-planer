import { createClient } from "@/lib/supabase/server"
import { ProjectsClientView } from "@/components/projects/projects-client-view"

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: projects } = await supabase.from('projects').select('*').order('created_at', { ascending: false })

  return (
    <ProjectsClientView 
        projects={projects || []} 
        currentUserId={user?.id} 
    />
  )
}
