'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { checkPermission } from '@/lib/permissions'

export async function addFileRecord(projectId: string, name: string, storagePath: string, contentType: string, sizeBytes: number, stageId?: string | null) {
  await checkPermission(projectId)
  const supabase = await createClient()

  const { error } = await supabase.from('project_files').insert({
    project_id: projectId,
    name,
    storage_path: storagePath,
    content_type: contentType,
    size_bytes: sizeBytes,
    stage_id: stageId
  })
  
  if (error) {
    console.error('Failed to save file metadata', error)
    throw new Error('Could not save file data')
  }

  revalidatePath(`/dashboard/projects/${projectId}`)
}

export async function updateFileStage(projectId: string, fileId: string, stageId: string | null) {
  await checkPermission(projectId)
  const supabase = await createClient()

  const { error } = await supabase
    .from('project_files')
    .update({ stage_id: stageId })
    .match({ id: fileId, project_id: projectId })

  if (error) {
    console.error('Failed to update file stage', error)
    throw new Error('Could not update file stage')
  }

  revalidatePath(`/dashboard/projects/${projectId}`)
}

export async function deleteFile(projectId: string, fileId: string, storagePath: string) {
  await checkPermission(projectId)
  const supabase = await createClient()

  // Remove from Storage First
  const { error: storageError } = await supabase.storage.from('project-files').remove([storagePath])
  if (storageError) {
    console.error('Failed to delete from storage', storageError)
    throw new Error('Could not delete file from storage')
  }

  // Remove metadata
  const { error: dbError } = await supabase.from('project_files').delete().match({ id: fileId, project_id: projectId })
  if (dbError) {
    console.error('Failed to delete file metadata', dbError)
    throw new Error('Could not delete file record')
  }

  revalidatePath(`/dashboard/projects/${projectId}`)
}
