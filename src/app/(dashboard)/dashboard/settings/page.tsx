import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsClientView } from '@/components/settings/settings-client-view'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return <SettingsClientView user={user} profile={profile} />
}

