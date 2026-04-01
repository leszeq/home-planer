'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateProjectModal } from "@/components/projects/create-project-modal"
import { DeleteProjectButton } from "@/components/projects/delete-project-button"
import { FolderKanban } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "@/lib/i18n/LanguageContext"
import { cn } from "@/lib/utils"

interface Project {
  id: string
  name: string
  budget: number
  created_at: string
  user_id: string
}

export function ProjectsClientView({ 
  projects, 
  currentUserId,
  hideHeader = false
}: { 
  projects: Project[]
  currentUserId?: string 
  hideHeader?: boolean
}) {
  const { t } = useTranslation()

  return (
    <div className={cn("space-y-8", hideHeader ? "animate-fade-in" : "")}>
      {!hideHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{t('common.projects')}</h2>
            <p className="text-muted-foreground">{t('projects.extra.subtitle')}</p>
          </div>
          <CreateProjectModal />
        </div>
      )}

      {hideHeader && (
         <div className="flex justify-end -mt-20">
           <CreateProjectModal />
         </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl bg-muted/20">
            <FolderKanban className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">{t('projects.extra.empty_title')}</h3>
            <p className="text-muted-foreground">{t('projects.extra.empty_desc')}</p>
          </div>
        )}
        {projects.map((project) => {
          const isShared = project.user_id !== currentUserId;

          return (
            <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
              <Card className="hover:shadow-lg transition-all cursor-pointer relative overflow-hidden group border-border/50">
                {isShared && (
                  <div className="absolute right-0 top-0 bg-primary/10 text-primary px-3 py-1 text-[10px] font-bold rounded-bl-lg uppercase tracking-wider z-10 transition-colors group-hover:bg-primary/20">
                    {t('projects.extra.shared_badge')}
                  </div>
                )}
                <CardHeader className="relative pr-14 pb-4">
                  <div className="absolute right-2 top-2 z-30 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <DeleteProjectButton projectId={project.id} isShared={isShared} />
                  </div>
                  <CardTitle className="truncate leading-tight text-lg group-hover:text-primary transition-colors">{project.name}</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 border-t border-border/50 bg-secondary/10">
                  <div className="text-sm space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-medium">{t('projects.extra.budget_label')}:</span>
                      <span className="font-bold text-foreground">
                        {Number(project.budget).toLocaleString()} {t('dashboard.stats.currency', { defaultValue: 'zł' })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-medium">{t('projects.extra.created_label')}:</span>
                      <span className="text-foreground/80 font-medium">
                        {new Date(project.created_at).toLocaleDateString()}
                      </span>
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
