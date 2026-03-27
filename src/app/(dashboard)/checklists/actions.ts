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
