import { createClient } from "@/lib/supabase/server"
import { DashboardClientView } from "@/components/dashboard/dashboard-client-view"
import { Suspense } from "react"
import { DashboardLoadingSkeleton } from "@/components/projects/project-skeletons"

async function DashboardDataSection() {
  const supabase = await createClient()

  const { data: projects } = await supabase.from('projects').select('id, name, budget')
  const { data: expenses } = await supabase.from('expenses').select('amount, category, project_id')

  return (
    <DashboardClientView 
      initialProjects={projects || []} 
      allExpenses={expenses || []} 
    />
  )
}

export default async function DashboardPage() {
  return (
    <div className="space-y-8 animate-fade-in">
       <Suspense fallback={<DashboardLoadingSkeleton />}>
          <DashboardDataSection />
       </Suspense>
    </div>
  )
}
