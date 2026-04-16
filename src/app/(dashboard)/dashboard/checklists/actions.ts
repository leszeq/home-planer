'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { CHECKLIST_TEMPLATES, ChecklistTemplate } from "@/lib/checklist-templates"
import { checkPermission } from "@/lib/permissions"

export async function createChecklistFromTemplate(
  projectId: string,
  stageId: string | null,
  templateId: string,
  locale: string = 'pl'
) {
  await checkPermission(projectId)
  const supabase = await createClient()
  
  const templates = (CHECKLIST_TEMPLATES as any)[locale] || CHECKLIST_TEMPLATES.pl
  const template = templates.find((t: any) => t.id === templateId) as ChecklistTemplate | undefined
  
  if (!template) throw new Error("Template not found")

  const { data: checklist, error: clError } = await supabase
    .from('checklists')
    .insert({ name: template.name, project_id: projectId, stage_id: stageId })
    .select()
    .single()

  if (clError) throw clError

  const items = template.items.map((content: string, index: number) => ({
    checklist_id: checklist.id,
    content,
    order: index,
    is_done: false,
  }))

  const { error: itemsError } = await supabase.from('checklist_items').insert(items)
  if (itemsError) throw itemsError

  revalidatePath('/dashboard/checklists')
  revalidatePath(`/dashboard/projects/${projectId}`)

  // Return the new checklist with items
  const { data: fullChecklist } = await supabase
    .from('checklists')
    .select('*, checklist_items(*)')
    .eq('id', checklist.id)
    .single()
    
  return fullChecklist
}

export async function toggleChecklistItem(itemId: string, isDone: boolean, projectId: string) {
  await checkPermission(projectId)
  const supabase = await createClient()
  await supabase.from('checklist_items').update({ is_done: isDone }).match({ id: itemId })
  
  const { data: item } = await supabase.from('checklist_items').select('checklist_id').eq('id', itemId).single()
  if (item) await syncStageStatus(item.checklist_id, projectId)

  revalidatePath(`/dashboard/checklists`)
  revalidatePath(`/dashboard/projects/${projectId}`)
}

export async function deleteChecklist(checklistId: string) {
  const supabase = await createClient()
  
  // Get projectId first
  const { data: checklist } = await supabase.from('checklists').select('project_id').eq('id', checklistId).single()
  if (checklist) await checkPermission(checklist.project_id)

  await supabase.from('checklists').delete().match({ id: checklistId })
  revalidatePath('/dashboard/checklists')
  if (checklist) revalidatePath(`/dashboard/projects/${checklist.project_id}`)
}

export async function createCustomChecklist(
  projectId: string,
  stageId: string | null,
  name: string,
  items: string[]
) {
  await checkPermission(projectId)
  const supabase = await createClient()

  // Get current max order
  const { data: existing } = await supabase
    .from('checklists')
    .select('order')
    .match({ project_id: projectId })
    .order('order', { ascending: false })
    .limit(1)
    .single()

  const nextOrder = (existing?.order ?? -1) + 1

  const { data: checklist, error } = await supabase
    .from('checklists')
    .insert({ name, project_id: projectId, stage_id: stageId, order: nextOrder })
    .select()
    .single()

  if (error) throw error

  if (items.length > 0) {
    const rows = items.filter(i => i.trim()).map((content, index) => ({
      checklist_id: checklist.id,
      content: content.trim(),
      order: index,
      is_done: false,
    }))
    await supabase.from('checklist_items').insert(rows)
  }

  revalidatePath('/dashboard/checklists')
  revalidatePath(`/dashboard/projects/${projectId}`)

  // Return the new checklist with items for optimistic UI
  const { data: fullChecklist } = await supabase
    .from('checklists')
    .select('*, checklist_items(*)')
    .eq('id', checklist.id)
    .single()
    
  return fullChecklist
}

export async function addChecklistItem(checklistId: string, content: string, projectId: string) {
  await checkPermission(projectId)
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('checklist_items')
    .select('order')
    .match({ checklist_id: checklistId })
    .order('order', { ascending: false })
    .limit(1)
    .single()

  const nextOrder = (existing?.order ?? -1) + 1

  await supabase.from('checklist_items').insert({
    checklist_id: checklistId,
    content,
    order: nextOrder,
    is_done: false,
  })

  await syncStageStatus(checklistId, projectId)

  revalidatePath('/dashboard/checklists')
  revalidatePath(`/dashboard/projects/${projectId}`)
}

export async function updateChecklistsOrder(projectId: string, orderedIds: string[]) {
  await checkPermission(projectId)
  const supabase = await createClient()
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from('checklists').update({ order: index }).match({ id })
    )
  )
  revalidatePath(`/dashboard/checklists`)
  revalidatePath(`/dashboard/projects/${projectId}`)
}

export async function updateChecklistItemsOrder(checklistId: string, orderedIds: string[]) {
  const supabase = await createClient()
  const { data: cl } = await supabase.from('checklists').select('project_id').eq('id', checklistId).single()
  if (cl) await checkPermission(cl.project_id)

  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from('checklist_items').update({ order: index }).match({ id })
    )
  )
  revalidatePath(`/dashboard/checklists`)
  if (cl) revalidatePath(`/dashboard/projects/${cl.project_id}`)
}

export async function deleteChecklistItem(itemId: string) {
  const supabase = await createClient()
  
  const { data: item } = await supabase.from('checklist_items').select('checklist_id, checklists(project_id)').eq('id', itemId).single()
  const projectId = (item?.checklists as any)?.project_id
  if (projectId) await checkPermission(projectId)

  const checklistId = item?.checklist_id

  await supabase.from('checklist_items').delete().match({ id: itemId })
  
  if (checklistId) await syncStageStatus(checklistId, projectId)

  revalidatePath('/dashboard/checklists')
  if (projectId) revalidatePath(`/dashboard/projects/${projectId}`)
}

async function syncStageStatus(checklistId: string, projectId: string) {
  const supabase = await createClient()
  
  const { data: checklist } = await supabase.from('checklists').select('stage_id').eq('id', checklistId).single()
  if (!checklist || !checklist.stage_id) return
  
  const { data: siblingChecklists } = await supabase.from('checklists').select('id').eq('stage_id', checklist.stage_id)
  if (!siblingChecklists || siblingChecklists.length === 0) return
  
  const checklistIds = siblingChecklists.map(c => c.id)
  
  const { data: items } = await supabase.from('checklist_items').select('is_done').in('checklist_id', checklistIds)
  
  let newStatus = 'todo'
  if (items && items.length > 0) {
    const total = items.length
    const done = items.filter(i => i.is_done).length
    if (done === total) newStatus = 'done'
    else if (done > 0) newStatus = 'in_progress'
  }
  
  const { data: stage } = await supabase.from('stages').select('status').eq('id', checklist.stage_id).single()
  
  if (stage && stage.status !== newStatus) {
    await supabase.from('stages').update({ status: newStatus }).eq('id', checklist.stage_id)
    revalidatePath(`/dashboard/projects/${projectId}`)
  }
}
