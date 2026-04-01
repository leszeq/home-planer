'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { checkPermission } from '@/lib/permissions'
import { esignProvider } from '@/lib/integrations/esignature'
import { ActionResponse } from '@/lib/types/actions'

export type DocumentType = 'scan' | 'e-signature'
export type DocumentStatus = 'draft' | 'pending' | 'signed' | 'rejected' | 'archived'

export async function addDocumentRecord(
  projectId: string, 
  name: string, 
  type: DocumentType,
  storagePath?: string,
  providerId?: string,
  provider?: 'autenti' | 'docusign' | 'boldsign'
): Promise<ActionResponse> {
  try {
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
    
    if (error) throw error

    revalidatePath('/dashboard/documents')
    if (projectId) revalidatePath(`/dashboard/projects/${projectId}`)
    
    return { success: true, data }
  } catch (e: any) {
    console.error('Failed to save document record', e)
    return { success: false, error: e.message || 'Could not save document statistics' }
  }
}

export async function deleteDocument(documentId: string, storagePath?: string): Promise<ActionResponse> {
  try {
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
    if (dbError) throw dbError

    revalidatePath('/dashboard/documents')
    if (doc.project_id) revalidatePath(`/dashboard/projects/${doc.project_id}`)
    
    return { success: true, data: null }
  } catch (e: any) {
    console.error('Failed to delete document', e)
    return { success: false, error: e.message || 'Could not delete document' }
  }
}

export async function updateDocumentStatus(documentId: string, status: DocumentStatus): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase.from('documents').update({ status }).eq('id', documentId)
    
    if (error) throw error

    revalidatePath('/dashboard/documents')
    return { success: true, data: null }
  } catch (e: any) {
    console.error('Failed to update status', e)
    return { success: false, error: e.message || 'Could not update document status' }
  }
}

export async function requestSignatureAction(
  projectId: string,
  docName: string,
  signerName: string,
  signerEmail: string,
  file: File
): Promise<ActionResponse> {
  try {
    if (projectId) {
      await checkPermission(projectId)
    }

    // 1. Initiate e-signature on the server
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
  } catch (e: any) {
    console.error('Failed to request signature', e)
    return { success: false, error: e.message || 'Could not request signature' }
  }
}

export async function syncDocumentStatusAction(documentId: string): Promise<ActionResponse> {
  try {
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
    if (!doc.provider_id || doc.provider !== 'boldsign') return { success: true, data: doc }

    // 2. Check BoldSign status
    const newStatus = await esignProvider.checkStatus(doc.provider_id)
    
    // 3. Update if changed
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

    return { success: true, data: { status: mappedStatus || doc.status } }
  } catch (e: any) {
    console.error('Failed to sync status', e)
    return { success: false, error: e.message || 'Could not sync document status' }
  }
}

export async function getBoldSignUrl(documentId: string): Promise<ActionResponse<{ url: string }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: doc } = await supabase.from('documents').select('*').eq('id', documentId).single()
    if (!doc || doc.user_id !== user.id) throw new Error('Forbidden')
    if (!doc.provider_id || doc.provider !== 'boldsign') throw new Error('Invalid provider')

    const apiKey = process.env.BOLDSIGN_API_KEY
    const response = await fetch(`https://api.boldsign.com/v1/document/properties?documentId=${doc.provider_id}`, {
      headers: { 'X-API-KEY': apiKey!, 'accept': 'application/json' }
    })
    
    if (!response.ok) {
      return { success: true, data: { url: `https://app.boldsign.com/documents/details/${doc.provider_id}` } }
    }
    
    const bsDoc = await response.json()
    const signerEmail = bsDoc.signers?.[0]?.emailAddress
    
    if (doc.status === 'signed') {
      return { success: true, data: { url: `https://app.boldsign.com/document/view/?documentId=${doc.provider_id}` } }
    }

    if (signerEmail) {
      return { success: true, data: { url: `https://app.boldsign.com/document/view/?documentId=${doc.provider_id}&email=${encodeURIComponent(signerEmail)}` } }
    }

    return { success: true, data: { url: `https://app.boldsign.com/document/view/?documentId=${doc.provider_id}` } }
  } catch (e: any) {
    console.error('Failed to get BoldSign URL', e)
    return { success: false, error: e.message || 'Could not retrieve document URL' }
  }
}
