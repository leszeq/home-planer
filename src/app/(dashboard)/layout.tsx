import { Sidebar } from "@/components/layout/sidebar"
import { QueryProvider } from "@/providers/query-provider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <QueryProvider>
      <div className="flex h-screen overflow-hidden bg-background print:h-auto print:block print:overflow-visible">
        <div className="print:hidden">
          <Sidebar />
        </div>
        <main className="flex-1 overflow-y-auto p-8 print:overflow-visible print:p-0">
          <div className="max-w-7xl mx-auto space-y-8 print:space-y-4">
            {children}
          </div>
        </main>
      </div>
    </QueryProvider>
  )
}
