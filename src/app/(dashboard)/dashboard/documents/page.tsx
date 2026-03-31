import { createClient } from '@/lib/supabase/server'
import { DocumentsClientView } from './DocumentsClientView'
import { DOCUMENT_TEMPLATES } from '@/lib/document-templates'

export default async function DocumentsPage() {
  const supabase = await createClient()
  
  // Fetch real documents
  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch projects for the filter
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name')
    .order('name')

  return (
    <DocumentsClientView 
      initialDocuments={documents || []} 
      templates={DOCUMENT_TEMPLATES} 
      projects={projects || []}
    />
  )
}
