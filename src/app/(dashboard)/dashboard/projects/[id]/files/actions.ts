'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { checkPermission } from "@/lib/permissions"
import { ActionResponse } from "@/lib/types/actions"
import { logActivity } from "@/lib/activity-logger"

export async function addFileRecord(
  projectId: string, 
  name: string, 
  storagePath: string, 
  contentType: string, 
  sizeBytes: number,
  stageId: string | null = null
): Promise<ActionResponse<{ id: string }>> {
  try {
    await checkPermission(projectId)
    const supabase = await createClient()
    const { data, error } = await supabase.from('project_files').insert({
      project_id: projectId,
      name,
      storage_path: storagePath,
      content_type: contentType,
      size_bytes: sizeBytes,
      stage_id: stageId
    }).select('id').single()
    
    if (error) return { success: false, error: error.message }
    
    await logActivity(projectId, 'upload_file', 'file', undefined, { name, size: sizeBytes })
    revalidatePath(`/dashboard/projects/${projectId}`)
    return { success: true, data: { id: data.id } }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteFile(projectId: string, fileId: string, storagePath: string): Promise<ActionResponse> {
  try {
    await checkPermission(projectId)
    const supabase = await createClient()
    
    // Get file name before delete for logging
    const { data: file } = await supabase.from('project_files').select('name').eq('id', fileId).single()
    
    // 1. Delete DB Record
    const { error: dbError } = await supabase.from('project_files').delete().match({ id: fileId })
    if (dbError) return { success: false, error: dbError.message }

    // 2. Delete from Storage
    const { error: storageError } = await supabase.storage
      .from('project-files')
      .remove([storagePath])
    
    if (storageError) {
      // Log the storage failure but return success since record is gone
      console.error(`Storage cleanup failure for ${storagePath}:`, storageError)
    }

    await logActivity(projectId, 'delete_file', 'file', fileId, { name: file?.name })
    revalidatePath(`/dashboard/projects/${projectId}`)
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteMultipleFiles(projectId: string, fileData: { id: string, path: string }[]): Promise<ActionResponse> {
  try {
    await checkPermission(projectId)
    const supabase = await createClient()
    
    const fileIds = fileData.map(f => f.id)
    const storagePaths = fileData.map(f => f.path)

    // 1. Delete DB Records
    const { error: dbError } = await supabase.from('project_files').delete().in('id', fileIds)
    if (dbError) return { success: false, error: dbError.message }

    // 2. Delete from Storage
    const { error: storageError } = await supabase.storage
      .from('project-files')
      .remove(storagePaths)
    
    if (storageError) console.error(`Storage cleanup failure for batch:`, storageError)

    await logActivity(projectId, 'delete_file', 'file', undefined, { 
      count: fileIds.length,
      isBulk: true
    })
    
    revalidatePath(`/dashboard/projects/${projectId}`)
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function updateFileStage(projectId: string, fileId: string, stageId: string | null): Promise<ActionResponse> {
  try {
    await checkPermission(projectId)
    const supabase = await createClient()
    const { error } = await supabase.from('project_files').update({ stage_id: stageId }).match({ id: fileId })
    
    if (error) return { success: false, error: error.message }
    
    await logActivity(projectId, 'update_file_stage', 'file', fileId, { stage_id: stageId })
    revalidatePath(`/dashboard/projects/${projectId}`)
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
