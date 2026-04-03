'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createProject(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string
  const budget = parseFloat(formData.get('budget') as string)

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const { data: project, error: projectError } = await supabase.from('projects').insert({
    name,
    budget,
    user_id: user.id
  }).select().single()

  if (projectError) throw projectError

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
  if (stagesError) throw stagesError

  revalidatePath('/dashboard/projects')
}

export async function deleteProject(id: string) {
  const supabase = await createClient()
  await supabase.from('projects').delete().match({ id })
  revalidatePath('/dashboard/projects')
}
