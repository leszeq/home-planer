import { createClient } from "@/lib/supabase/server"
import { DocumentsClientView } from "./DocumentsClientView"
import { DOCUMENT_TEMPLATES } from "@/lib/document-templates"
import { Suspense } from "react"
import { TableSkeleton } from "@/components/projects/project-skeletons"
import { ClientPageHeader } from "@/components/layout/client-page-header"

async function DocumentsListSection() {
  const supabase = await createClient()
  
  const { data: documents } = await supabase.from('documents').select('*').order('created_at', { ascending: false })
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
      <ClientPageHeader 
        titleKey="documents.header_title" 
        descKey="documents.header_desc" 
        variant="xl"
      />

      <Suspense fallback={<TableSkeleton rows={8} />}>
        <DocumentsListSection />
      </Suspense>
    </div>
  )
}
