import { createClient } from "@/lib/supabase/server"

export type ProjectRole = 'owner' | 'editor' | 'viewer' | 'none'

/**
 * Gets the role of the current user for a specific project.
 */
export async function getProjectRole(projectId: string): Promise<ProjectRole> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return 'none'

  // 1. Check if user is the main owner (the one who created the project)
  const { data: project } = await supabase
    .from('projects')
    .select('user_id')
    .eq('id', projectId)
    .single()

  if (project?.user_id === user.id) {
    return 'owner'
  }

  // 2. Check if user is a member of the project
  const { data: member } = await supabase
    .from('project_members')
    .select('role')
    .eq('project_id', projectId)
    .eq('user_id', user.id)
    .single()

  if (member) {
    return (member.role as ProjectRole) || 'viewer'
  }

  return 'none'
}

/**
 * Returns true if the given role allows editing content.
 */
export function canEdit(role: ProjectRole): boolean {
  return role === 'owner' || role === 'editor'
}

/**
 * Throws an error if the user does not have permission to edit the project.
 * Useful for Server Actions.
 */
export async function checkPermission(projectId: string) {
  const role = await getProjectRole(projectId)
  if (!canEdit(role)) {
    throw new Error('Brak uprawnień. Tylko Właściciel lub Edytor mogą modyfikować ten projekt.')
  }
  return { role, isOwner: role === 'owner' }
}
