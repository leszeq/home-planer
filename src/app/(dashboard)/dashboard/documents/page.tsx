import { createClient } from "@/lib/supabase/server"
import { DocumentsClientView } from "./DocumentsClientView"
import { DOCUMENT_TEMPLATES } from "@/lib/document-templates"
import { Suspense } from "react"
import { TableSkeleton } from "@/components/projects/project-skeletons"

async function DocumentsListSection() {
  const supabase = await createClient()
  
  const { data: documents } = await supabase.from('project_files').select('*').order('created_at', { ascending: false })
  const { data: projects } = await supabase.from('projects').select('id, name')
  const templates = DOCUMENT_TEMPLATES

  return (
    <DocumentsClientView 
      initialDocuments={documents || []} 
      templates={templates} 
      projects={projects || []}
      hideHeader={true}
    />
  )
}

export default async function DocumentsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-fade-in">
      {/* Zero-Flicker Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex-1">
          <h1 className="text-4xl font-extrabold tracking-tight">Dokumenty i Wzory</h1>
          <p className="text-muted-foreground mt-2 text-lg max-w-2xl">
            Przeglądaj wszystkie dokumenty projektowe i korzystaj z gotowych wzorów pism
          </p>
        </div>
      </div>

      <Suspense fallback={<TableSkeleton rows={8} />}>
        <DocumentsListSection />
      </Suspense>
    </div>
  )
}
