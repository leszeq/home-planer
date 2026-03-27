'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { CHECKLIST_TEMPLATES } from "@/lib/checklist-templates"

export async function createChecklistFromTemplate(
  projectId: string,
  stageId: string | null,
  templateId: string
) {
  const supabase = await createClient()
  const template = CHECKLIST_TEMPLATES.find(t => t.id === templateId)
  if (!template) throw new Error("Template not found")

  const { data: checklist, error: clError } = await supabase
    .from('checklists')
    .insert({ name: template.name, project_id: projectId, stage_id: stageId })
    .select()
    .single()

  if (clError) throw clError

  const items = template.items.map((content, index) => ({
    checklist_id: checklist.id,
    content,
    order: index,
    is_done: false,
  }))

  const { error: itemsError } = await supabase.from('checklist_items').insert(items)
  if (itemsError) throw itemsError

  revalidatePath('/dashboard/checklists')
}

export async function toggleChecklistItem(itemId: string, isDone: boolean, projectId: string) {
  const supabase = await createClient()
  await supabase.from('checklist_items').update({ is_done: isDone }).match({ id: itemId })
  revalidatePath(`/dashboard/checklists`)
}

export async function deleteChecklist(checklistId: string) {
  const supabase = await createClient()
  await supabase.from('checklists').delete().match({ id: checklistId })
  revalidatePath('/dashboard/checklists')
}

export async function createCustomChecklist(
  projectId: string,
  stageId: string | null,
  name: string,
  items: string[]
) {
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
}

export async function addChecklistItem(checklistId: string, content: string, projectId: string) {
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

  revalidatePath('/dashboard/checklists')
}

export async function updateChecklistsOrder(projectId: string, orderedIds: string[]) {
  const supabase = await createClient()
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from('checklists').update({ order: index }).match({ id })
    )
  )
  revalidatePath(`/dashboard/checklists`)
}

export async function updateChecklistItemsOrder(checklistId: string, orderedIds: string[]) {
  const supabase = await createClient()
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from('checklist_items').update({ order: index }).match({ id })
    )
  )
  revalidatePath(`/dashboard/checklists`)
}

export async function deleteChecklistItem(itemId: string) {
  const supabase = await createClient()
  await supabase.from('checklist_items').delete().match({ id: itemId })
  revalidatePath('/dashboard/checklists')
}

