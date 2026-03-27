import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function GlobalExpensesPage() {
  const supabase = await createClient()
  
  const { data: expenses } = await supabase.from('expenses').select(`
    *,
    projects(name)
  `).order('date', { ascending: false })

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">All Expenses</h2>
        <p className="text-muted-foreground">Detailed history of all construction spending.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr className="text-left font-medium">
                <th className="p-4">Date</th>
                <th className="p-4">Project</th>
                <th className="p-4">Description</th>
                <th className="p-4">Category</th>
                <th className="p-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {expenses?.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground italic">
                    No expenses recorded yet.
                  </td>
                </tr>
              )}
              {expenses?.map((expense: any) => (
                <tr key={expense.id} className="hover:bg-muted/50">
                  <td className="p-4">{new Date(expense.date).toLocaleDateString()}</td>
                  <td className="p-4 font-medium">{expense.projects?.name}</td>
                  <td className="p-4">{expense.description || "No description"}</td>
                  <td className="p-4 capitalize">{expense.category}</td>
                  <td className="p-4 text-right font-bold">
                    {Number(expense.amount).toLocaleString()} zł
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
