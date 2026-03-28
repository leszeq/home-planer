'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { updatePassword } from '@/app/(dashboard)/dashboard/settings/actions'
import { ShieldCheck, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/LanguageContext'

export function SecurityForm() {
  const { t } = useTranslation()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPass, setShowPass] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsSaving(true)
    setError(null)
    setSuccess(false)
    
    const result = await updatePassword(formData)
    
    setIsSaving(false)
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      // Reset form usually handled by input clearing or redirecting, 
      // but here we just show success.
    }
  }

  return (
    <div className="max-w-md space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
        <ShieldCheck className="w-5 h-5 text-primary" />
        <p className="text-sm text-foreground font-medium">
          {t('settings.password_hint')}
        </p>
      </div>

      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('settings.current_password')}</label>
          <div className="relative">
            <Input 
              name="oldPassword" 
              type={showPass ? "text" : "password"} 
              required 
              className="h-11 pr-10"
            />
            <button 
              type="button" 
              onClick={() => setShowPass(!showPass)} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2 border-t border-border/50 pt-4">
          <label className="text-sm font-medium">{t('settings.new_password')}</label>
          <div className="relative">
            <Input 
              name="password" 
              type={showPass ? "text" : "password"} 
              required 
              className="h-11 pr-10"
            />
            <button 
              type="button" 
              onClick={() => setShowPass(!showPass)} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t('settings.confirm_new_password')}</label>
          <div className="relative">
            <Input 
              name="confirmPassword" 
              type={showPass ? "text" : "password"} 
              required 
              className="h-11 pr-10"
            />
            <button 
              type="button" 
              onClick={() => setShowPass(!showPass)} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 text-sm font-medium bg-destructive/10 text-destructive border border-destructive/20 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 text-sm font-medium bg-[var(--accent-green)]/10 text-[var(--accent-green)] border border-[var(--accent-green)]/20 rounded-lg">
            <ShieldCheck className="w-4 h-4" />
            {t('settings.password_success')}
          </div>
        )}

        <Button type="submit" variant="glow" disabled={isSaving} className="h-11 w-full">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : t('settings.update_password')}
        </Button>
      </form>
    </div>
  )
}
