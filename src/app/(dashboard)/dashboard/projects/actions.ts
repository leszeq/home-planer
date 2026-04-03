'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createProject(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string
  const budget = parseFloat(formData.get('budget') as string)

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Brak autoryzacji" }
  }

  // Check for existing project with the same name
  const { data: existingProject } = await supabase
    .from('projects')
    .select('id')
    .eq('user_id', user.id)
    .ilike('name', name)
    .single()

  if (existingProject) {
    return { success: false, error: "Projekt o takiej nazwie już istnieje." }
  }

  const { data: project, error: projectError } = await supabase.from('projects').insert({
    name,
    budget,
    user_id: user.id
  }).select().single()

  if (projectError) {
    return { success: false, error: "Wystąpił błąd podczas tworzenia projektu." }
  }
  // Auto-create predefined stages
  const predefinedStages = [
    "Działka",
    "Formalności",
    "Fundamenty",
    "Stan surowy",
    "Instalacje",
    "Wykończenie"
  ]

  const stageRows = predefinedStages.map((stageName, index) => ({
    project_id: project.id,
    name: stageName,
    order: index,
    status: 'todo'
  }))

  const { error: stagesError } = await supabase.from('stages').insert(stageRows)
  if (stagesError) {
    return { success: false, error: "Projekt został utworzony, ale wystąpił błąd przy generowaniu etapów." }
  }

  revalidatePath('/dashboard/projects')
  return { success: true }
}

export async function deleteProject(id: string) {
  const supabase = await createClient()
  await supabase.from('projects').delete().match({ id })
  revalidatePath('/dashboard/projects')
}
