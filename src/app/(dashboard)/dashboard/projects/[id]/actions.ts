'use server'

import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { revalidatePath } from "next/cache"
import { checkPermission } from "@/lib/permissions"
import { ActionResponse } from "@/lib/types/actions"
import { logActivity } from "@/lib/activity-logger"

// --- Fetch Actions ---

export async function getProjectLogsAction(projectId: string) {
  try {
    await checkPermission(projectId)
    const adminClient = createServiceRoleClient()
    const { data, error } = await adminClient
      .from('activity_logs')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(30)
      
    if (error) return { success: false, error: error.message }
    return { success: true, data: data || [] }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// --- Stages Actions ---

export async function createStage(projectId: string, name: string, order: number): Promise<ActionResponse> {
  try {
    await checkPermission(projectId)
    const supabase = await createClient()
    const { error } = await supabase.from('stages').insert({
      project_id: projectId,
      name,
      order,
      status: 'todo'
    })
    
    if (error) return { success: false, error: error.message }
    
    await logActivity(projectId, 'create_stage', 'stage', undefined, { name })
    revalidatePath(`/dashboard/projects/${projectId}`)
    revalidatePath('/dashboard/checklists')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function updateStageName(projectId: string, stageId: string, name: string): Promise<ActionResponse> {
  try {
    await checkPermission(projectId)
    const supabase = await createClient()
    const { error } = await supabase.from('stages').update({ name }).match({ id: stageId })
    
    if (error) return { success: false, error: error.message }
    
    // We can reuse update_stage or add a new log type. Let's not spam logs for every letter, but we can log it.
    await logActivity(projectId, 'update_stage_status' as any, 'stage', stageId, { name })
    revalidatePath(`/dashboard/projects/${projectId}`)
    revalidatePath('/dashboard/checklists')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function updateStageStatus(projectId: string, stageId: string, status: string): Promise<ActionResponse> {
  try {
    await checkPermission(projectId)
    const supabase = await createClient()
    const { error } = await supabase.from('stages').update({ status }).match({ id: stageId })
    
    if (error) return { success: false, error: error.message }
    
    if (status === 'done') {
      const { data: checklists } = await supabase.from('checklists').select('id').eq('stage_id', stageId)
      if (checklists && checklists.length > 0) {
        const checklistIds = checklists.map(c => c.id)
        await supabase.from('checklist_items').update({ is_done: true }).in('checklist_id', checklistIds).eq('is_done', false)
      }
    }

    await logActivity(projectId, 'update_stage_status', 'stage', stageId, { status })
    revalidatePath(`/dashboard/projects/${projectId}`)
    revalidatePath('/dashboard/checklists')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function updateStageDates(projectId: string, stageId: string, startDate: string | null, endDate: string | null): Promise<ActionResponse> {
  try {
    await checkPermission(projectId)
    const supabase = await createClient()
    const { error } = await supabase.from('stages').update({ 
      start_date: startDate, 
      end_date: endDate 
    }).match({ id: stageId })
    
    if (error) return { success: false, error: error.message }
    
    await logActivity(projectId, 'update_stage_dates', 'stage', stageId, { start: startDate, end: endDate })
    revalidatePath(`/dashboard/projects/${projectId}`)
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteStage(projectId: string, stageId: string): Promise<ActionResponse> {
  try {
    await checkPermission(projectId)
    const supabase = await createClient()
    
    // Get stage name before delete for logging
    const { data: stage } = await supabase.from('stages').select('name').eq('id', stageId).single()
    
    const { error } = await supabase.from('stages').delete().match({ id: stageId })
    if (error) return { success: false, error: error.message }
    
    await logActivity(projectId, 'delete_stage', 'stage', stageId, { name: stage?.name })
    revalidatePath(`/dashboard/projects/${projectId}`)
    revalidatePath('/dashboard/checklists')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function updateStagesOrder(projectId: string, orderedIds: string[]): Promise<ActionResponse> {
  try {
    await checkPermission(projectId)
    const supabase = await createClient()
    
    const errors = []
    for (let i = 0; i < orderedIds.length; i++) {
      const { error } = await supabase.from('stages').update({ order: i + 1 }).match({ id: orderedIds[i] })
      if (error) errors.push(error.message)
    }

    if (errors.length > 0) return { success: false, error: errors.join(', ') }
    
    revalidatePath(`/dashboard/projects/${projectId}`)
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// --- Expenses Actions ---

export async function createExpense(projectId: string, data: {
  amount: number,
  category: string,
  description: string,
  stage_id: string | null,
  date: string,
  file_id?: string | null
}): Promise<ActionResponse> {
  try {
    await checkPermission(projectId)
    const supabase = await createClient()
    const { error } = await supabase.from('expenses').insert({
      project_id: projectId,
      amount: data.amount,
      category: data.category,
      description: data.description,
      date: data.date,
      stage_id: data.stage_id || null,
      file_id: data.file_id || null
    })
    
    if (error) return { success: false, error: error.message }
    
    await logActivity(projectId, 'create_expense', 'expense', undefined, { 
      amount: data.amount, 
      category: data.category,
      desc: data.description 
    })
    
    revalidatePath(`/dashboard/projects/${projectId}`)
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteExpense(projectId: string, expenseId: string): Promise<ActionResponse> {
  try {
    await checkPermission(projectId)
    const supabase = await createClient()
    
    // Get expense details before delete for logging
    const { data: expense } = await supabase.from('expenses').select('amount, description').eq('id', expenseId).single()
    
    const { error } = await supabase.from('expenses').delete().match({ id: expenseId })
    if (error) return { success: false, error: error.message }
    
    await logActivity(projectId, 'delete_expense', 'expense', expenseId, { 
      amount: expense?.amount,
      desc: expense?.description
    })
    
    revalidatePath(`/dashboard/projects/${projectId}`)
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// New Bulk Expense Deletion
export async function deleteMultipleExpenses(projectId: string, expenseIds: string[]): Promise<ActionResponse> {
  try {
    await checkPermission(projectId)
    const supabase = await createClient()
    
    const { error } = await supabase.from('expenses').delete().in('id', expenseIds)
    if (error) return { success: false, error: error.message }
    
    await logActivity(projectId, 'delete_expense', 'expense', undefined, { 
      count: expenseIds.length,
      isBulk: true
    })
    
    revalidatePath(`/dashboard/projects/${projectId}`)
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function updateExpense(projectId: string, expenseId: string, data: {
  amount?: number,
  category?: string,
  description?: string,
  stage_id?: string | null,
  date?: string,
  file_id?: string | null
}): Promise<ActionResponse> {
  try {
    await checkPermission(projectId)
    const supabase = await createClient()
    const { error } = await supabase.from('expenses').update(data).match({ id: expenseId, project_id: projectId })
    if (error) return { success: false, error: error.message }
    
    await logActivity(projectId, 'update_expense' as any, 'expense', expenseId, { 
      desc: data.description,
      amount: data.amount
    })

    revalidatePath(`/dashboard/projects/${projectId}`)
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function updateProjectBudget(projectId: string, budget: number): Promise<ActionResponse> {
  try {
    await checkPermission(projectId)
    const supabase = await createClient()
    const { error } = await supabase.from('projects').update({ budget }).match({ id: projectId })
    if (error) return { success: false, error: error.message }
    
    await logActivity(projectId, 'update_project_budget', 'project', projectId, { budget })

    revalidatePath(`/dashboard/projects/${projectId}`)
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// --- Team Actions ---

export async function inviteMember(projectId: string, email: string, role: string): Promise<ActionResponse> {
  try {
    await checkPermission(projectId)
    const supabase = await createClient()

    const { error } = await supabase.from('project_members').insert({
      project_id: projectId,
      email: email.toLowerCase(),
      role
    })

    if (error) {
      if (error.code === '23505') return { success: false, error: 'Ten użytkownik został już zaproszony.' }
      return { success: false, error: error.message }
    }

    await logActivity(projectId, 'invite_member', 'member', undefined, { email, role })
    revalidatePath(`/dashboard/projects/${projectId}`)
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function removeMember(projectId: string, memberId: string): Promise<ActionResponse> {
  try {
    await checkPermission(projectId)
    const supabase = await createClient()
    
    // Get member email before delete for logging
    const { data: member } = await supabase.from('project_members').select('email').eq('id', memberId).single()
    
    const { error } = await supabase.from('project_members').delete().match({ id: memberId, project_id: projectId })
    if (error) return { success: false, error: error.message }
    
    await logActivity(projectId, 'remove_member', 'member', memberId, { email: member?.email })
    revalidatePath(`/dashboard/projects/${projectId}`)
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function updateMemberRole(projectId: string, memberId: string, role: string): Promise<ActionResponse> {
  try {
    await checkPermission(projectId)
    const supabase = await createClient()
    const { error } = await supabase.from('project_members').update({ role }).match({ id: memberId, project_id: projectId })
    
    if (error) return { success: false, error: error.message }
    
    await logActivity(projectId, 'update_member_role', 'member', memberId, { role })
    revalidatePath(`/dashboard/projects/${projectId}`)
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// --- Project Actions ---

export async function deleteProject(projectId: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: project } = await supabase.from('projects').select('user_id, name').match({ id: projectId }).single()
    
    if (project?.user_id !== user?.id) {
      return { success: false, error: 'Tylko główny właściciel może usunąć ten projekt.' }
    }
    
    const { error } = await supabase.from('projects').delete().match({ id: projectId })
    if (error) return { success: false, error: error.message }
    
    // Note: Log will be orphaned or deleted by CASCADE but good practice to keep it if we add soft delete later
    await logActivity(projectId, 'delete_project', 'project', projectId, { name: project?.name })
    
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// --- Category Actions ---

export async function getProjectCategories(projectId: string): Promise<{ success: boolean, data?: any[], error?: string }> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('expense_categories').select('*').match({ project_id: projectId }).order('name')
    if (error) return { success: false, error: error.message }
    return { success: true, data }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function createCategory(projectId: string, name: string): Promise<ActionResponse> {
  try {
    await checkPermission(projectId)
    const supabase = await createClient()
    const { error } = await supabase.from('expense_categories').insert({ project_id: projectId, name })
    if (error && error.code !== '23505') return { success: false, error: error.message }
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
