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
      hideHeader={true}
    />
  )
}

export default async function GlobalExpensesPage() {
  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Wszystkie wydatki</h1>
        <p className="text-muted-foreground mt-1">Pełna historia finansowa Twoich inwestycji</p>
      </div>

      <Suspense fallback={<TableSkeleton rows={10} />}>
        <ExpenseListSection />
      </Suspense>
    </div>
  )
}
