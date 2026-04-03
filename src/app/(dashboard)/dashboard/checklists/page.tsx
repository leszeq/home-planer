import { ChecklistDataClient } from "./ChecklistDataClient"
import { ClientPageHeader } from "@/components/layout/client-page-header"

export const dynamic = 'force-dynamic'

export default async function ChecklistsPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <ClientPageHeader 
        titleKey="checklists.header_title" 
        descKey="checklists.header_desc" 
      />

      {/* Internal Caching Section (Client Side) */}
      <ChecklistDataClient />
    </div>
  )
}
