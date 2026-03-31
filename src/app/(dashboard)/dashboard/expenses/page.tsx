import { createClient } from "@/lib/supabase/server"
import { ExpensesClientView } from "@/components/expenses/expenses-client-view"

export default async function GlobalExpensesPage() {
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
      />
  )
}
