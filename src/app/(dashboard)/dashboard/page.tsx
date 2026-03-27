import { createClient } from "@/lib/supabase/server"
import { DashboardClientView } from "@/components/dashboard/dashboard-client-view"

export default async function DashboardPage() {
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
