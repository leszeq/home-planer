import { createClient } from "@/lib/supabase/server"
import { ExpensesClientView } from "@/components/expenses/expenses-client-view"
import { Suspense } from "react"
import { TableSkeleton } from "@/components/projects/project-skeletons"

async function ExpenseListSection() {
  const supabase = await createClient()
  
  const { data: projects } = await supabase.from('projects').select('id, name')
  const { data: expenses } = await supabase.from('expenses').select(`
    *,
    projects(name)
  `).order('date', { ascending: false })

  return (
    <ExpensesClientView 
      initialExpenses={expenses || []} 
      projects={projects || []} 
      hideHeader={false}
    />
  )
}

export default async function GlobalExpensesPage() {
  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <Suspense fallback={<TableSkeleton rows={10} />}>
        <ExpenseListSection />
      </Suspense>
    </div>
  )
}
