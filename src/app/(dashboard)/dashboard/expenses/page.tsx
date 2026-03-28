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
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Twoje Wydatki</h2>
        <p className="text-muted-foreground">Pełna historia wszystkich kosztów we wszystkich Twoich inwestycjach.</p>
      </div>

      <ExpensesClientView 
        initialExpenses={expenses || []} 
        projects={projects || []} 
      />
    </div>
  )
}
