import { createClient } from "@/lib/supabase/server"
import { ProjectsClientView } from "@/components/projects/projects-client-view"
import { Suspense } from "react"
import { GridSkeleton } from "@/components/projects/project-skeletons"

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
      {/* 
        This is the "Zero-Flicker" header. 
        Note: Currently keeping it inside the Client Component would cause a flash during hydration.
        We provide a simple placeholder or move the header text here if possible.
        For now, let's keep the header inside ProjectsClientView but use hideHeader=false 
        for the "outer" shell if we were doing it differently.
        Actually, the best result is Rendering the Header here on the server.
      */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projekty</h1>
          <p className="text-muted-foreground mt-1">Zarządzaj swoimi inwestycjami budowlanymi</p>
        </div>
      </div>

      <Suspense fallback={<GridSkeleton items={6} />}>
        <ProjectListSection userId={user?.id} />
      </Suspense>
    </div>
  )
}
