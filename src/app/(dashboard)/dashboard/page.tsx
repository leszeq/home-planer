import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CategoryDonutChart } from "@/components/charts/category-donut-chart"
import { BarChart3, TrendingDown, TrendingUp, Layers, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: projects } = await supabase.from('projects').select('*')
  const { data: expenses } = await supabase.from('expenses').select('amount, category')

  const totalBudget = projects?.reduce((acc, p) => acc + (Number(p.budget) || 0), 0) ?? 0
  const totalExpenses = expenses?.reduce((acc, e) => acc + (Number(e.amount) || 0), 0) ?? 0
  const remaining = totalBudget - totalExpenses
  const progress = totalBudget > 0 ? Math.min((totalExpenses / totalBudget) * 100, 100) : 0
  const isNear = progress >= 80 && progress < 100
  const isOver = totalExpenses > totalBudget

  const stats = [
    {
      label: 'Projekty',
      value: projects?.length ?? 0,
      icon: Layers,
      sub: 'aktywnych projektów',
      color: 'text-primary',
      bg: 'bg-[var(--primary-glow)]',
    },
    {
      label: 'Łączny budżet',
      value: `${totalBudget.toLocaleString()} zł`,
      icon: TrendingUp,
      sub: 'we wszystkich projektach',
      color: 'text-primary',
      bg: 'bg-[var(--primary-glow)]',
    },
    {
      label: 'Wydano',
      value: `${totalExpenses.toLocaleString()} zł`,
      icon: TrendingDown,
      sub: `${progress.toFixed(1)}% budżetu`,
      color: isOver ? 'text-destructive' : isNear ? 'text-[var(--accent-warm)]' : 'text-[var(--accent-green)]',
      bg: isOver ? 'bg-destructive/10' : isNear ? 'bg-[var(--accent-warm-glow)]' : 'bg-[var(--accent-green-glow)]',
    },
    {
      label: 'Pozostało',
      value: `${remaining.toLocaleString()} zł`,
      icon: BarChart3,
      sub: 'do wykorzystania',
      color: remaining < 0 ? 'text-destructive' : 'text-foreground',
      bg: remaining < 0 ? 'bg-destructive/10' : 'bg-secondary',
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Przegląd Twoich inwestycji budowlanych</p>
      </div>

      {/* Budget Alert */}
      {(isNear || isOver) && (
        <div className={`flex items-center gap-3 p-4 rounded-xl text-sm font-medium animate-fade-in-up ${isOver ? 'bg-destructive/10 text-destructive border border-destructive/30' : 'bg-[var(--accent-warm-glow)] text-[var(--accent-warm)] border border-[var(--accent-warm)]/30'}`}>
          <AlertTriangle className="w-5 h-5 shrink-0" />
          {isOver
            ? `Przekroczono całkowity budżet o ${Math.abs(remaining).toLocaleString()} zł!`
            : `Uwaga: zużyto już ${progress.toFixed(1)}% łącznego budżetu`}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Card key={s.label} className={`animate-fade-in-up delay-${i * 75} card-hover`}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{s.label}</p>
                  <p className={`text-2xl font-bold mt-2 ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
                </div>
                <div className={`p-2.5 rounded-lg ${s.bg}`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts & Projects Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category Chart */}
        <Card className="animate-fade-in-up delay-300">
          <CardHeader>
            <CardTitle className="text-base">Wydatki wg kategorii</CardTitle>
            <CardDescription>Podział wszystkich kosztów</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryDonutChart expenses={expenses ?? []} />
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card className="animate-fade-in-up delay-300">
          <CardHeader>
            <CardTitle className="text-base">Twoje projekty</CardTitle>
            <CardDescription>Ostatnio aktywne</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {projects?.length === 0 && (
              <p className="text-sm text-muted-foreground italic">Brak projektów. Utwórz pierwszy!</p>
            )}
            {projects?.map((p) => {
              const budget = Number(p.budget) || 0
              return (
                <Link key={p.id} href={`/dashboard/projects/${p.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-8 rounded-full bg-primary/50 group-hover:bg-primary transition-colors" />
                      <div>
                        <p className="text-sm font-semibold">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{budget.toLocaleString()} zł budżet</p>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
