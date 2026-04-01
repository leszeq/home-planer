import { ChecklistDataClient } from "./ChecklistDataClient"

export const dynamic = 'force-dynamic'

export default async function ChecklistsPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Zero-Flicker Header (Instant Server Render) */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Harmonogram prac</h1>
          <p className="text-muted-foreground mt-1">Zarządzaj etapami budowy i listami kontrolnymi</p>
        </div>
      </div>

      {/* Internal Caching Section (Client Side) */}
      <ChecklistDataClient />
    </div>
  )
}
