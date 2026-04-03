'use client'

import { createClient } from "@/lib/supabase/client"
import { notFound } from "next/navigation"
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
import { ChevronLeft } from "lucide-react"
import { Suspense, useMemo } from "react"
import { StatsSkeleton, TimelineSkeleton, ListSkeleton, PageHeaderSkeleton } from "@/components/projects/project-skeletons"
import { ActivitySheet } from "@/components/projects/activity-sheet"
import { useQuery } from '@tanstack/react-query'

function canEditRole(role: string): boolean {
  return role === 'owner' || role === 'editor'
}

export function ProjectDetailClient({ projectId }: { projectId: string }) {
  const supabase = createClient()

  const { data, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No user")

      const [projectRes, membersRes, stagesRes, expensesRes, filesRes, logsRes] = await Promise.all([
        supabase.from('projects').select('*').match({ id: projectId }).single(),
        supabase.from('project_members').select('*').match({ id: projectId }),
        supabase.from('stages').select('*').match({ project_id: projectId }).order('order', { ascending: true }),
        supabase.from('expenses').select('*').match({ project_id: projectId }).order('date', { ascending: false }),
        supabase.from('project_files').select('*').match({ project_id: projectId }).order('created_at', { ascending: false }),
        supabase.from('activity_logs').select('*, profiles(full_name)').match({ project_id: projectId }).order('created_at', { ascending: false }).limit(30)
      ])

      const project = projectRes.data
      if (!project) return null

      // Roles logic
      const memberships = membersRes.data || []
      let role = 'viewer'
      if (project.user_id === user.id) {
          role = 'owner'
      } else {
          const m = memberships.find(m => m.user_id === user.id)
          if (m) role = m.role
      }
      
      const canEditProject = canEditRole(role as any)

      // Owner for sheet
      const { data: ownerProfile } = await supabase.from('profiles').select('full_name').match({ id: project.user_id }).single()
      const ownerEmail = memberships.find(m => m.user_id === project.user_id)?.email || ""

      // Additional checklist fetch
      const { data: checklists } = await supabase.from('checklists').select('*, checklist_items(*)').match({ project_id: projectId })

      return {
        user,
        project,
        members: memberships,
        stages: stagesRes.data || [],
        expenses: expensesRes.data || [],
        files: filesRes.data || [],
        logs: logsRes.data || [],
        role,
        canEditProject,
        ownerProfile,
        ownerEmail,
        checklists: checklists || []
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  // Loading state (only if no cache)
  if (isLoading && !data) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center gap-4">
           <Link href="/dashboard/projects">
             <Button variant="ghost" size="icon">
               <ChevronLeft className="w-5 h-5" />
             </Button>
           </Link>
           <PageHeaderSkeleton />
        </div>
        <StatsSkeleton />
        <TimelineSkeleton />
      </div>
    )
  }

  const result = data
  if (!result) return notFound()

  const project = result.project
  const canEditProject = result.canEditProject

  // Calculations for Stats (moved from sub-components)
  const totalBudget = Number(project.budget) || 0
  const totalExpenses = result.expenses.reduce((acc, e) => acc + Number(e.amount), 0) || 0
  const progressPercent = totalBudget > 0 ? Math.min((totalExpenses / totalBudget) * 100, 100) : 0
  const isOverBudget = totalExpenses > totalBudget
  const isNearLimit = totalExpenses > totalBudget * 0.8 && !isOverBudget
  
  const largestCategory = result.expenses.length > 0 ? (
    [...new Set(result.expenses.map(e => e.category))].sort((a,b) => 
      result.expenses.filter(e => e.category === b).reduce((sum, e) => sum + Number(e.amount), 0) -
      result.expenses.filter(e => e.category === a).reduce((sum, e) => sum + Number(e.amount), 0)
    )[0]
  ) : "-"

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/projects">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <ProjectHeaderClient name={project.name} />
        <div className="ml-auto flex items-center gap-2">
          {/* History Drawer */}
          <ActivitySheet logs={result.logs} />

          <TeamManagementSheet 
            projectId={project.id} 
            ownerId={project.user_id} 
            ownerName={result.ownerProfile?.full_name || ""}
            ownerEmail={result.ownerEmail}
            currentUserId={result.user?.id || ''} 
            members={result.members || []} 
            userRole={result.role}
          />
          <PrintButton />
          {canEditProject && (
            <DeleteProjectButton projectId={project.id} isShared={project.user_id !== result.user?.id} />
          )}
        </div>
      </div>

      {/* Timeline – full width */}
      <ProjectTimeline stages={result.stages} />

      {/* Stages + Stats: 2/3 + 1/3 side by side */}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StageList 
            projectId={project.id} 
            stages={result.stages} 
            checklists={result.checklists} 
            canEdit={canEditProject} 
          />
        </div>
        
        <div className="space-y-6">
          <ProjectStatsClient 
            totalBudget={totalBudget}
            totalExpenses={totalExpenses}
            progressPercent={progressPercent}
            isOverBudget={isOverBudget}
            isNearLimit={isNearLimit}
            doneStages={result.stages.filter(s => s.status === 'done').length}
            totalStages={result.stages.length}
            largestCategory={largestCategory}
            projectId={project.id}
          />
        </div>
      </div>

      {/* Expenses – 2/3 width */}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ExpenseList 
            projectId={project.id} 
            expenses={result.expenses} 
            stages={result.stages.map(s => ({id: s.id, name: s.name}))} 
            files={result.files}
            userId={result.user?.id || ''}
            canEdit={canEditProject} 
          />
        </div>
      </div>

      {/* Files – 2/3 width */}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FileList 
            projectId={project.id} 
            userId={project.user_id} 
            files={result.files} 
            stages={result.stages.map(s => ({id: s.id, name: s.name}))} 
            canEdit={canEditProject} 
          />
        </div>
      </div>
    </div>
  )
}
