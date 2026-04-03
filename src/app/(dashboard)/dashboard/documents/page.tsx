import { createClient } from "@/lib/supabase/server"
import { DocumentsClientView } from "./DocumentsClientView"
import { DOCUMENT_TEMPLATES } from "@/lib/document-templates"
import { Suspense } from "react"
import { TableSkeleton } from "@/components/projects/project-skeletons"
import { ClientPageHeader } from "@/components/layout/client-page-header"

async function DocumentsListSection() {
  const supabase = await createClient()
  
  // Fetch both e-signature documents and project files
  const [documentsRes, projectFilesRes, projectsRes] = await Promise.all([
    supabase.from('documents').select('*').order('created_at', { ascending: false }),
    supabase.from('project_files').select('*').order('created_at', { ascending: false }),
    supabase.from('projects').select('id, name')
  ])

  const documents = documentsRes.data || []
  const projectFiles = projectFilesRes.data || []
  const templates = DOCUMENT_TEMPLATES

  // Map project_files to the Document interface shape
  const mappedProjectFiles = projectFiles.map((f: any) => ({
    id: f.id,
    project_id: f.project_id,
    user_id: f.user_id || '',
    name: f.name,
    type: 'scan' as const,
    status: 'archived' as const,
    storage_path: f.storage_path,
    provider_id: null,
    provider: null,
    signed_at: null,
    created_at: f.created_at
  }))

  // Merge and sort by creation date
  const allDocuments = [...documents, ...mappedProjectFiles]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <DocumentsClientView 
      initialDocuments={allDocuments} 
      templates={templates} 
      projects={projectsRes.data || []}
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
