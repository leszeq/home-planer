import { createClient } from "@/lib/supabase/server"
import { ProjectsClientView } from "@/components/projects/projects-client-view"
import { Suspense } from "react"
import { GridSkeleton } from "@/components/projects/project-skeletons"
import { ClientPageHeader } from "@/components/layout/client-page-header"

// We fetch data in a separate component to allow the header to render instantly via Suspense
async function ProjectListSection({ userId }: { userId?: string }) {
  const supabase = await createClient()
  const { data: projects } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
  
  return (
    <ProjectsClientView 
      projects={projects || []} 
      currentUserId={userId} 
      hideHeader={true} // New prop to let the server component handle the header
    />
  )
}

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="space-y-8 animate-fade-in">
      <ClientPageHeader 
        titleKey="projects.header_title" 
        descKey="projects.header_desc" 
      />

      <Suspense fallback={<GridSkeleton items={6} />}>
        <ProjectListSection userId={user?.id} />
      </Suspense>
    </div>
  )
}
