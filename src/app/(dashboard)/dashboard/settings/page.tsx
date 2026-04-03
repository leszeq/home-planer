import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsClientView } from '@/components/settings/settings-client-view'
import { Suspense } from 'react'
import { SettingsSkeleton } from '@/components/projects/project-skeletons'
import { Settings } from 'lucide-react'
import { ClientPageHeader } from '@/components/layout/client-page-header'

async function SettingsDataSection() {
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

  return <SettingsClientView user={user} profile={profile} hideHeader={true} />
}

export default async function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8 animate-fade-in">
      <ClientPageHeader 
        titleKey="settings.header_title" 
        descKey="settings.header_desc" 
        icon={<Settings className="w-6 h-6 text-primary" />}
      />

      <Suspense fallback={<SettingsSkeleton />}>
        <SettingsDataSection />
      </Suspense>
    </div>
  )
}
