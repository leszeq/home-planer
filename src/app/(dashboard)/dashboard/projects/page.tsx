import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CreateProjectModal } from "@/components/projects/create-project-modal"
import { FolderKanban } from "lucide-react"

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: projects } = await supabase.from('projects').select('*').order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Projekty</h2>
          <p className="text-muted-foreground">Zarządzaj swoimi i udostępnionymi projektami budowlanymi.</p>
        </div>
        <CreateProjectModal />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects?.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl">
            <FolderKanban className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Brak projektów</h3>
            <p className="text-muted-foreground">Utwórz pierwszy projekt lub poproś o zaproszenie.</p>
          </div>
        )}
        {projects?.map((project) => {
          const isShared = project.user_id !== user?.id;

          return (
            <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer relative overflow-hidden">
                {isShared && (
                  <div className="absolute right-0 top-0 bg-primary/10 text-primary px-3 py-1 text-[10px] font-bold rounded-bl-lg uppercase tracking-wider">
                    Udostępniony
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="pr-16 truncate">{project.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Budżet:</span>
                      <span className="font-medium">{Number(project.budget).toLocaleString()} zł</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Utworzono:</span>
                      <span>{new Date(project.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
