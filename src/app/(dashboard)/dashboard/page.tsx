import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Fetch stats (placeholder for now)
  const { data: projects } = await supabase.from('projects').select('*')
  const { data: expenses } = await supabase.from('expenses').select('amount')
  
  const totalBudget = projects?.reduce((acc, p) => acc + (p.budget || 0), 0) || 0
  const totalExpenses = expenses?.reduce((acc, e) => acc + (Number(e.amount) || 0), 0) || 0

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your construction projects and finances.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBudget.toLocaleString()} zł</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actual Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExpenses.toLocaleString()} zł</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalBudget - totalExpenses).toLocaleString()} zł</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent activity placeholder */}
      <h3 className="text-xl font-semibold">Your Projects</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects?.length === 0 && (
          <p className="text-muted-foreground col-span-full">No projects found. Create your first project to get started.</p>
        )}
        {projects?.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Budget: {project.budget} zł</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
