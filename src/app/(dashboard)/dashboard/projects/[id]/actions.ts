'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { checkPermission } from "@/lib/permissions"

// Stages Actions
export async function createStage(projectId: string, name: string, order: number) {
  await checkPermission(projectId)
  const supabase = await createClient()
  const { error } = await supabase.from('stages').insert({
    project_id: projectId,
    name,
    order,
    status: 'todo'
  })
  if (error) throw error
  revalidatePath(`/dashboard/projects/${projectId}`)
}

export async function updateStageStatus(projectId: string, stageId: string, status: string) {
  await checkPermission(projectId)
  const supabase = await createClient()
  const { error } = await supabase.from('stages').update({ status }).match({ id: stageId })
  if (error) throw error
  revalidatePath(`/dashboard/projects/${projectId}`)
}

export async function updateStageDates(projectId: string, stageId: string, startDate: string | null, endDate: string | null) {
  await checkPermission(projectId)
  const supabase = await createClient()
  const { error } = await supabase.from('stages').update({ 
    start_date: startDate, 
    end_date: endDate 
  }).match({ id: stageId })
  if (error) throw error
  revalidatePath(`/dashboard/projects/${projectId}`)
}

export async function deleteStage(projectId: string, stageId: string) {
  await checkPermission(projectId)
  const supabase = await createClient()
  const { error } = await supabase.from('stages').delete().match({ id: stageId })
  if (error) throw error
  revalidatePath(`/dashboard/projects/${projectId}`)
}

export async function updateStagesOrder(projectId: string, orderedIds: string[]) {
  await checkPermission(projectId)
  const supabase = await createClient()
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from('stages').update({ order: index + 1 }).match({ id })
    )
  )
  revalidatePath(`/dashboard/projects/${projectId}`)
}


// Expenses Actions
export async function createExpense(projectId: string, data: {
  amount: number,
  category: string,
  description: string,
  stage_id: string | null,
  date: string
}) {
  await checkPermission(projectId)
  const supabase = await createClient()
  const { error } = await supabase.from('expenses').insert({
    project_id: projectId,
    ...data
  })
  if (error) throw error
  revalidatePath(`/dashboard/projects/${projectId}`)
}

export async function deleteExpense(projectId: string, expenseId: string) {
  await checkPermission(projectId)
  const supabase = await createClient()
  const { error } = await supabase.from('expenses').delete().match({ id: expenseId })
  if (error) throw error
  revalidatePath(`/dashboard/projects/${projectId}`)
}

// Team Actions
export async function inviteMember(projectId: string, email: string, role: string) {
  await checkPermission(projectId)
  const supabase = await createClient()

  const { error } = await supabase.from('project_members').insert({
    project_id: projectId,
    email: email.toLowerCase(),
    role
  })

  if (error) {
    if (error.code === '23505') {
      return { error: 'Ten użytkownik został już zaproszony.' }
    }
    return { error: error.message }
  }

  revalidatePath(`/dashboard/projects/${projectId}`)
  return { success: true }
}

export async function removeMember(projectId: string, memberId: string) {
  await checkPermission(projectId)
  const supabase = await createClient()
  const { error } = await supabase.from('project_members').delete().match({ id: memberId, project_id: projectId })
  if (error) throw error
  revalidatePath(`/dashboard/projects/${projectId}`)
}

export async function updateMemberRole(projectId: string, memberId: string, role: string) {
  await checkPermission(projectId)
  const supabase = await createClient()
  const { error } = await supabase.from('project_members').update({ role }).match({ id: memberId, project_id: projectId })
  if (error) throw error
  revalidatePath(`/dashboard/projects/${projectId}`)
}

// Project Actions
export async function deleteProject(projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: project } = await supabase.from('projects').select('user_id').match({ id: projectId }).single()
  
  if (project?.user_id !== user?.id) {
    return { error: 'Tylko główny właściciel może usunąć ten projekt.' }
  }
  
  const { error } = await supabase.from('projects').delete().match({ id: projectId })
  if (error) return { error: error.message }
  
  return { success: true }
}
