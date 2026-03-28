import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StageList } from "@/components/stages/stage-list"
import { ProjectTimeline } from "@/components/stages/project-timeline"
import { TeamManagementSheet } from "@/components/team/team-management-sheet"
import { ExpenseList } from "@/components/expenses/expense-list"
import { FileList } from "@/components/files/file-list"
import { Button } from "@/components/ui/button"
import { PrintButton } from "@/components/ui/print-button"
import { DeleteProjectButton } from "@/components/projects/delete-project-button"
import { ProjectHeaderClient, ProjectStatsClient } from "@/components/projects/project-detail-client"
import Link from "next/link"
import { ChevronLeft, AlertTriangle } from "lucide-react"
import { getProjectRole, canEdit as canEditRole } from "@/lib/permissions"

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const awaitedParams = await params;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: project } = await supabase.from('projects').select('*').match({ id: awaitedParams.id }).single()
  if (!project) notFound()

  const { data: stages } = await supabase.from('stages').select('*').match({ project_id: awaitedParams.id }).order('order', { ascending: true })
  const { data: expenses } = await supabase.from('expenses').select('*').match({ project_id: awaitedParams.id }).order('date', { ascending: false })
  const { data: checklists } = await supabase.from('checklists').select('*, checklist_items(*)').match({ project_id: awaitedParams.id })
  const { data: files } = await supabase.from('project_files').select('*').match({ project_id: awaitedParams.id }).order('created_at', { ascending: false })
  const { data: members } = await supabase.from('project_members').select('*').match({ project_id: awaitedParams.id })
  
  // Fetch owner data
  const { data: ownerProfile } = await supabase
    .from('profiles')
    .select('full_name')
    .match({ id: project.user_id })
    .single()
    
  // Since we don't store email in profiles (usually in auth.users), and we can't easily join auth.users from client-side rpc without admin access, 
  // we check if the owner is in project_members (they usually shouldn't be, but maybe they are).
  // If not, we'll try to get it from the project metadata if available or just use full_name.
  // Actually, project.user_id exists, we'll just pass ownerId and ownerProfile.
  const ownerEmail = members?.find(m => m.user_id === project.user_id)?.email || ""

  const totalBudget = Number(project.budget) || 0
  const totalExpenses = expenses?.reduce((acc, e) => acc + Number(e.amount), 0) || 0
  const progressPercent = totalBudget > 0 ? Math.min((totalExpenses / totalBudget) * 100, 100) : 0
  
  const isOverBudget = totalExpenses > totalBudget
  const isNearLimit = totalExpenses > totalBudget * 0.8 && !isOverBudget

  const projectRole = await getProjectRole(awaitedParams.id)
  const canEditProject = canEditRole(projectRole)

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/projects">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <ProjectHeaderClient name={project.name} />
        <div className="ml-auto flex items-center gap-2">
          <TeamManagementSheet 
            projectId={project.id} 
            ownerId={project.user_id} 
            ownerName={ownerProfile?.full_name || ""}
            ownerEmail={ownerEmail}
            currentUserId={user?.id || ''} 
            members={members || []} 
            userRole={projectRole}
          />
          <PrintButton />
          {canEditProject && (
            <DeleteProjectButton projectId={project.id} isShared={project.user_id !== user?.id} />
          )}
        </div>
      </div>

      <ProjectStatsClient 
        totalBudget={totalBudget}
        totalExpenses={totalExpenses}
        progressPercent={progressPercent}
        isOverBudget={isOverBudget}
        isNearLimit={isNearLimit}
        doneStages={stages?.filter(s => s.status === 'done').length || 0}
        totalStages={stages?.length || 0}
        largestCategory={expenses && expenses.length > 0 ? (
          [...new Set(expenses.map(e => e.category))].sort((a,b) => 
            expenses.filter(e => e.category === b).reduce((sum, e) => sum + Number(e.amount), 0) -
            expenses.filter(e => e.category === a).reduce((sum, e) => sum + Number(e.amount), 0)
          )[0]
        ) : "-"}
      />

      <ProjectTimeline stages={stages || []} />

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-8">
          <StageList 
            projectId={project.id} 
            stages={stages || []} 
            checklists={checklists || []} 
            canEdit={canEditProject}
          />
          <FileList 
            projectId={project.id} 
            userId={project.user_id} 
            files={files || []} 
            canEdit={canEditProject}
          />
        </div>
        <div className="space-y-8">
          <ExpenseList 
            projectId={project.id} 
            expenses={expenses || []} 
            stages={stages || []} 
            canEdit={canEditProject}
          />
        </div>
      </div>

    </div>
  )
}
