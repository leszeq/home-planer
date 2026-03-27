'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Stages Actions
export async function createStage(projectId: string, name: string, order: number) {
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
  const supabase = await createClient()
  const { error } = await supabase.from('stages').update({ status }).match({ id: stageId })
  if (error) throw error
  revalidatePath(`/dashboard/projects/${projectId}`)
}

export async function deleteStage(projectId: string, stageId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('stages').delete().match({ id: stageId })
  if (error) throw error
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
  const supabase = await createClient()
  const { error } = await supabase.from('expenses').insert({
    project_id: projectId,
    ...data
  })
  if (error) throw error
  revalidatePath(`/dashboard/projects/${projectId}`)
}

export async function deleteExpense(projectId: string, expenseId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('expenses').delete().match({ id: expenseId })
  if (error) throw error
  revalidatePath(`/dashboard/projects/${projectId}`)
}
