import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/settings/profile-form'
import { SecurityForm } from '@/components/settings/security-form'
import { Settings, Shield, User as UserIcon } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Settings className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Ustawienia Konta</h2>
          <p className="text-muted-foreground mt-1">
            Zarządzaj swoimi danymi, zdjęciem profilowym i bezpieczeństwem.
          </p>
        </div>
      </div>

      <div className="bg-card/50 border border-border/50 rounded-3xl overflow-hidden glass shadow-xl shadow-primary/5">
        <Tabs defaultValue="profile" className="w-full">
          <div className="px-8 pt-8 border-b border-border/50 bg-secondary/20">
            <TabsList className="bg-secondary/40 p-1 rounded-xl mb-0 h-auto gap-1">
              <TabsTrigger 
                value="profile" 
                className="rounded-lg py-2 px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
              >
                <UserIcon className="w-4 h-4 mr-2" />
                Mój Profil
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="rounded-lg py-2 px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
              >
                <Shield className="w-4 h-4 mr-2" />
                Bezpieczeństwo
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-8">
            <TabsContent value="profile" className="mt-0">
              <ProfileForm user={user} profile={profile} />
            </TabsContent>
            
            <TabsContent value="security" className="mt-0">
              <SecurityForm />
            </TabsContent>
          </div>
        </Tabs>
      </div>

    </div>
  )
}

