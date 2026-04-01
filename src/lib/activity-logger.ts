'use server'

import { createClient } from "@/lib/supabase/server"

export type ActivityAction = 
  | 'create_expense' | 'delete_expense' | 'update_expense'
  | 'create_stage' | 'delete_stage' | 'update_stage_status' | 'update_stage_dates'
  | 'upload_file' | 'delete_file' | 'update_file_stage'
  | 'invite_member' | 'remove_member' | 'update_member_role'
  | 'create_project' | 'delete_project'

export interface ActivityDetails {
  [key: string]: any
}

/**
 * Logs a project activity to the audit trail.
 * Should be called from Server Actions after a successful operation.
 */
export async function logActivity(
  projectId: string,
  action: ActivityAction,
  entityType: string,
  entityId?: string,
  details: ActivityDetails = {}
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return // Don't log if no user (shouldn't happen in authenticated actions)

    const { error } = await supabase.from('activity_logs').insert({
      project_id: projectId,
      user_id: user.id,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details
    })

    if (error) {
      console.error('Failed to log activity:', error)
    }
  } catch (err) {
    console.error('Activity logger error:', err)
  }
}
