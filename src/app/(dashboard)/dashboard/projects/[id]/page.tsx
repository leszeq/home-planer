import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StageList } from "@/components/stages/stage-list"
import { ProjectTimeline } from "@/components/stages/project-timeline"
import { TeamManagement } from "@/components/team/team-management"
import { ExpenseList } from "@/components/expenses/expense-list"
import { FileList } from "@/components/files/file-list"
import { Button } from "@/components/ui/button"
import { PrintButton } from "@/components/ui/print-button"
import { DeleteProjectButton } from "@/components/projects/delete-project-button"
import Link from "next/link"
import { ChevronLeft, AlertTriangle } from "lucide-react"

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

  const totalBudget = Number(project.budget) || 0
  const totalExpenses = expenses?.reduce((acc, e) => acc + Number(e.amount), 0) || 0
  const progressPercent = totalBudget > 0 ? Math.min((totalExpenses / totalBudget) * 100, 100) : 0
  
  const isOverBudget = totalExpenses > totalBudget
  const isNearLimit = totalExpenses > totalBudget * 0.8 && !isOverBudget

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/projects">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{project.name}</h2>
          <p className="text-muted-foreground italic print:hidden">Project Summary & Controls</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <PrintButton />
          <DeleteProjectButton projectId={project.id} isShared={project.user_id !== user?.id} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className={isOverBudget ? "border-destructive border-2" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Budget Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isOverBudget ? "text-destructive" : isNearLimit ? "text-orange-500" : ""}`}>
              {totalExpenses.toLocaleString()} / {totalBudget.toLocaleString()} zł
            </div>
            <div className="mt-4 space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{progressPercent.toFixed(1)}% safe</span>
                <span>{isOverBudget ? "Over Budget!" : isNearLimit ? "Near Limit" : "On Track"}</span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${isOverBudget ? "bg-destructive" : isNearLimit ? "bg-orange-500" : "bg-primary"}`} 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            {(isOverBudget || isNearLimit) && (
              <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 text-xs font-medium ${isOverBudget ? "bg-destructive/10 text-destructive" : "bg-orange-500/10 text-orange-600"}`}>
                <AlertTriangle className="w-4 h-4" />
                {isOverBudget ? "Budget exceeded!" : "You've used 80% of your budget."}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Placeholder for other stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Stage Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stages?.filter(s => s.status === 'done').length || 0} / {stages?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-center">Completed Stages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Largest Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {expenses && expenses.length > 0 ? [...new Set(expenses.map(e => e.category))].sort((a,b) => 
                expenses.filter(e => e.category === b).reduce((sum, e) => sum + Number(e.amount), 0) -
                expenses.filter(e => e.category === a).reduce((sum, e) => sum + Number(e.amount), 0)
              )[0] : "-"}
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-center">Highest spending category</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-8">
          <ProjectTimeline stages={stages || []} />
          <StageList projectId={project.id} stages={stages || []} checklists={checklists || []} />
          <FileList projectId={project.id} userId={project.user_id} files={files || []} />
        </div>
        <div className="space-y-8">
          <TeamManagement 
            projectId={project.id} 
            ownerId={project.user_id} 
            currentUserId={user?.id || ''} 
            members={members || []} 
          />
          <ExpenseList projectId={project.id} expenses={expenses || []} stages={stages || []} />
        </div>
      </div>

    </div>
  )
}
