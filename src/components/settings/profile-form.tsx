'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AvatarUpload } from './avatar-upload'
import { updateProfile } from '@/app/(dashboard)/dashboard/settings/actions'
import { Save, CheckCircle2, User, Phone, Mail } from 'lucide-react'

interface ProfileFormProps {
  user: any
  profile: any
}

export function ProfileForm({ user, profile }: ProfileFormProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')

  async function handleSubmit(formData: FormData) {
    setIsSaving(true)
    setSuccess(false)
    setError(null)
    
    formData.append('avatarUrl', avatarUrl)
    const result = await updateProfile(formData)
    
    setIsSaving(false)
    if (result.error) {
       setError(result.error)
    } else if (result.success) {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <AvatarUpload uid={user.id} url={avatarUrl} onUpload={setAvatarUrl} />

      <form action={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <User className="w-4 h-4 opacity-70" />
            Imię i Nazwisko
          </label>
          <Input 
            name="fullName" 
            defaultValue={profile?.full_name || ''} 
            placeholder="Jan Kowalski"
            className="h-11 shadow-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Mail className="w-4 h-4 opacity-70" />
            E-mail
          </label>
          <Input 
            value={user.email || ''} 
            disabled 
            className="h-11 bg-muted/50 cursor-not-allowed border-dashed opacity-70"
          />
          <p className="text-[10px] text-muted-foreground italic">Email można zmienić tylko w ustawieniach głównych auth.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Phone className="w-4 h-4 opacity-70" />
            Numer telefonu
          </label>
          <Input 
            name="phoneNumber" 
            defaultValue={profile?.phone_number || ''} 
            placeholder="+48 000 000 000"
            className="h-11 shadow-sm"
          />
        </div>

        <div className="md:col-span-2 pt-4 border-t border-border/50">
          {error && (
            <div className="mb-4 p-3 text-sm font-medium bg-destructive/10 text-destructive border border-destructive/20 rounded-lg">
              {error}
            </div>
          )}

          <Button type="submit" variant="glow" disabled={isSaving} className="h-11 px-8 min-w-[160px]">
            {isSaving ? 'Zapisywanie...' : (
              success ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Zapisano!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Zapisz zmiany
                </>
              )
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
