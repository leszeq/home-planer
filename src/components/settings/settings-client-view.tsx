'use client'

import { ProfileForm } from '@/components/settings/profile-form'
import { SecurityForm } from '@/components/settings/security-form'
import { Settings, Shield, User as UserIcon } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslation } from '@/lib/i18n/LanguageContext'

interface SettingsPageProps {
  user: any
  profile: any
  hideHeader?: boolean
}

export function SettingsClientView({ 
  user, 
  profile,
  hideHeader = false 
}: SettingsPageProps) {
  const { t } = useTranslation()

  return (
    <div className={`w-full space-y-12 ${hideHeader ? "" : "max-w-4xl mx-auto py-8"}`}>
      {/* Header */}
      {!hideHeader && (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('settings.account_settings')}</h1>
            <p className="text-muted-foreground mt-1">
              {t('settings.account_subtitle')}
            </p>
          </div>
        </div>
      )}

      <div className="bg-card/50 border border-border/50 rounded-3xl overflow-hidden glass shadow-xl shadow-primary/5">
        <Tabs defaultValue="profile" className="w-full">
          <div className="px-8 pt-8 border-b border-border/50 bg-secondary/20">
            <TabsList className="bg-secondary/40 p-1 rounded-xl mb-0 h-auto gap-1">
              <TabsTrigger 
                value="profile" 
                className="rounded-lg py-2 px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
              >
                <UserIcon className="w-4 h-4 mr-2" />
                {t('settings.profile_tab')}
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="rounded-lg py-2 px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
              >
                <Shield className="w-4 h-4 mr-2" />
                {t('settings.security_tab')}
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
