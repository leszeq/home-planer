'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { checkPermission } from '@/lib/permissions'
import { esignProvider } from '@/lib/integrations/esignature'

export type DocumentType = 'scan' | 'e-signature'
export type DocumentStatus = 'draft' | 'pending' | 'signed' | 'rejected' | 'archived'

export async function addDocumentRecord(
  projectId: string, 
  name: string, 
  type: DocumentType,
  storagePath?: string,
  providerId?: string,
  provider?: 'autenti' | 'docusign' | 'boldsign'
) {
  if (projectId) {
    await checkPermission(projectId)
  }
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase.from('documents').insert({
    project_id: projectId || null,
    user_id: user.id,
    name,
    type,
    status: type === 'e-signature' ? 'pending' : 'signed',
    storage_path: storagePath || null,
    provider_id: providerId || null,
    provider: provider || null,
    signed_at: type === 'scan' ? new Date().toISOString() : null
  }).select().single()
  
  if (error) {
    console.error('Failed to save document metadata', error)
    throw new Error('Could not save document statistics')
  }

  revalidatePath('/dashboard/documents')
  if (projectId) revalidatePath(`/dashboard/projects/${projectId}`)
  
  return data
}

export async function deleteDocument(documentId: string, storagePath?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Check ownership
  const { data: doc } = await supabase.from('documents').select('user_id, project_id').eq('id', documentId).single()
  if (!doc || doc.user_id !== user.id) {
    throw new Error('Forbidden')
  }

  // Remove from Storage if exists
  if (storagePath) {
    const { error: storageError } = await supabase.storage.from('project-files').remove([storagePath])
    if (storageError) {
      console.error('Failed to delete from storage', storageError)
    }
  }

  // Remove metadata
  const { error: dbError } = await supabase.from('documents').delete().match({ id: documentId })
  if (dbError) {
    console.error('Failed to delete document metadata', dbError)
    throw new Error('Could not delete document record')
  }

  revalidatePath('/dashboard/documents')
  if (doc.project_id) revalidatePath(`/dashboard/projects/${doc.project_id}`)
}

export async function updateDocumentStatus(documentId: string, status: DocumentStatus) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('documents').update({ status }).eq('id', documentId)
  
  if (error) {
    console.error('Failed to update document status', error)
    throw new Error('Could not update document status')
  }

  revalidatePath('/dashboard/documents')
}

export async function requestSignatureAction(
  projectId: string,
  docName: string,
  signerName: string,
  signerEmail: string,
  file: File
) {
  if (projectId) {
    await checkPermission(projectId)
  }

  // 1. Initiate e-signature on the server (accesses BOLDSIGN_API_KEY)
  const { providerId } = await esignProvider.sendForSignature({
    documentName: docName,
    signerName,
    signerEmail,
    file
  })

  // 2. Save metadata to DB
  return await addDocumentRecord(
    projectId,
    docName,
    'e-signature',
    undefined,
    providerId,
    'boldsign'
  )
}

export async function syncDocumentStatusAction(documentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // 1. Get document info
  const { data: doc, error: fetchError } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single()

  if (fetchError || !doc) throw new Error('Document not found')
  if (doc.user_id !== user.id) throw new Error('Forbidden')
  if (!doc.provider_id || doc.provider !== 'boldsign') return doc

  // 2. Check BoldSign status
  const newStatus = await esignProvider.checkStatus(doc.provider_id)
  
  // 3. Update if changed (BoldSign 'SIGNED' -> Dashboard 'signed')
  const statusMap: Record<string, DocumentStatus> = {
    'SIGNED': 'signed',
    'REJECTED': 'rejected',
    'PENDING': 'pending'
  }
  
  const mappedStatus = statusMap[newStatus]
  
  if (mappedStatus && mappedStatus !== doc.status) {
    await updateDocumentStatus(documentId, mappedStatus)
    if (mappedStatus === 'signed') {
      await supabase.from('documents').update({ 
        signed_at: new Date().toISOString() 
      }).eq('id', documentId)
    }
    revalidatePath('/dashboard/documents')
  }

  return { status: mappedStatus || doc.status }
}

export async function getBoldSignUrl(documentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // 1. Get document from local DB to verify ownership
  const { data: doc } = await supabase.from('documents').select('*').eq('id', documentId).single()
  if (!doc || doc.user_id !== user.id) throw new Error('Forbidden')
  if (!doc.provider_id || doc.provider !== 'boldsign') throw new Error('Invalid provider')

  // 2. Fetch signer details from BoldSign API to construct the exact link
  const apiKey = process.env.BOLDSIGN_API_KEY
  const response = await fetch(`https://api.boldsign.com/v1/document/properties?documentId=${doc.provider_id}`, {
    headers: { 'X-API-KEY': apiKey!, 'accept': 'application/json' }
  })
  
  if (!response.ok) {
    // Fallback: If API fails, try the general details page (sender view)
    return { url: `https://app.boldsign.com/documents/details/${doc.provider_id}` }
  }
  
  const bsDoc = await response.json()
  const signerEmail = bsDoc.signers?.[0]?.emailAddress
  
  console.log(`BoldSign Debug: documentId=${doc.provider_id}, status=${doc.status}, signerEmail=${signerEmail}`)

  // 3. If signed, go to the correct view page
  if (doc.status === 'signed') {
    return { url: `https://app.boldsign.com/document/view/?documentId=${doc.provider_id}` }
  }

  // 4. For pending: construct the dynamic view link (it often allows signing if needed)
  // or use the signing link if we have the email, but the user specifically asked for 'document/view'
  if (signerEmail) {
    // We can still add the email to help with auto-identification in the view mode
    return { url: `https://app.boldsign.com/document/view/?documentId=${doc.provider_id}&email=${encodeURIComponent(signerEmail)}` }
  }

  // Final fallback to the view page
  return { url: `https://app.boldsign.com/document/view/?documentId=${doc.provider_id}` }
}
