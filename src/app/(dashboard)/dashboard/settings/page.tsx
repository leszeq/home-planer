import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsClientView } from '@/components/settings/settings-client-view'
import { Suspense } from 'react'
import { SettingsSkeleton } from '@/components/projects/project-skeletons'
import { Settings } from 'lucide-react'

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
      {/* Zero-Flicker Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Settings className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ustawienia konta</h1>
          <p className="text-muted-foreground mt-1">
            Zarządzaj swoim profilem i ustawieniami bezpieczeństwa
          </p>
        </div>
      </div>

      <Suspense fallback={<SettingsSkeleton />}>
        <SettingsDataSection />
      </Suspense>
    </div>
  )
}
