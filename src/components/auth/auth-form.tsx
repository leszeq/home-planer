'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { login, signup, loginWithMagicLink } from '@/app/(auth)/login/actions'
import { Mail, KeyRound, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n/LanguageContext'

type AuthMode = 'login' | 'register' | 'magiclink'

export function AuthForm({ initialMode = 'login', error, message }: { initialMode?: AuthMode, error?: string, message?: string }) {
  const { t } = useTranslation()
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Reset loading if error/message changes (props update from server action redirect)
  useState(() => {
    setIsLoading(false)
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setIsLoading(true)
  }

  // Map Supabase errors to translated strings
  const getErrorMessage = (err?: string) => {
    if (!err) return null
    if (err.includes('Invalid login credentials')) return t('auth.errors.invalid_credentials')
    if (err.includes('User already registered')) return t('auth.errors.user_exists')
    if (err.includes('Email not confirmed')) return t('auth.errors.email_not_confirmed')
    return err
  }

  const translatedError = getErrorMessage(error)

  return (
    <div className="w-full">
      {/* Mode Tabs */}
      <div className="flex bg-muted/50 rounded-full p-1.5 mb-8 border border-border/40 shadow-inner">
        <button
          onClick={() => {
            setMode('login')
            setIsLoading(false)
          }}
          className={cn(
            "flex-1 text-sm font-semibold py-2.5 rounded-full transition-all duration-300",
            mode === 'login' 
              ? "bg-background shadow-[0_2px_10px_rgba(0,0,0,0.1)] text-foreground scale-[1.02]" 
              : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
          )}
        >
          {t('auth.login_tab')}
        </button>
        <button
          onClick={() => {
            setMode('register')
            setIsLoading(false)
          }}
          className={cn(
            "flex-1 text-sm font-semibold py-2.5 rounded-full transition-all duration-300",
            mode === 'register' 
              ? "bg-background shadow-[0_2px_10px_rgba(0,0,0,0.1)] text-foreground scale-[1.02]" 
              : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
          )}
        >
          {t('auth.register_tab')}
        </button>
      </div>

      <div className="space-y-6">
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold tracking-tight">
            {mode === 'login' && t('auth.welcome_back')}
            {mode === 'register' && t('auth.create_account')}
            {mode === 'magiclink' && t('auth.magiclink_title')}
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            {mode === 'login' && t('auth.login_desc')}
            {mode === 'register' && t('auth.register_desc')}
            {mode === 'magiclink' && t('auth.magiclink_desc')}
          </p>
        </div>

        {translatedError && (
          <div className="p-3 text-sm font-medium bg-destructive/10 text-destructive border border-destructive/20 rounded-lg animate-in fade-in slide-in-from-top-1">
            {translatedError}
          </div>
        )}
        {message && (
          <div className="p-3 text-sm font-medium bg-[var(--accent-green)]/10 text-[var(--accent-green)] border border-[var(--accent-green)]/20 rounded-lg animate-in fade-in slide-in-from-top-1">
            {message}
          </div>
        )}

        {mode === 'login' && (
          <form action={login} onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input name="email" type="email" placeholder={t('auth.email_placeholder')} required className="pl-10 h-11" />
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input name="password" type={showPassword ? "text" : "password"} placeholder={t('auth.password_placeholder')} required className="pl-10 pr-10 h-11" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" variant="glow" className="w-full h-11 text-base group">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>{t('auth.login_button')} <ArrowRight className="w-4 h-4 ml-2 opacity-70 group-hover:translate-x-1 transition-transform" /></>
              )}
            </Button>
          </form>
        )}

        {mode === 'register' && (
          <form action={signup} onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input name="email" type="email" placeholder={t('auth.email_placeholder')} required className="pl-10 h-11" />
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input name="password" type={showPassword ? "text" : "password"} placeholder={t('auth.password_placeholder')} required className="pl-10 pr-10 h-11" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" variant="glow" className="w-full h-11 text-base group">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>{t('auth.register_button')} <ArrowRight className="w-4 h-4 ml-2 opacity-70 group-hover:translate-x-1 transition-transform" /></>
              )}
            </Button>
          </form>
        )}

        {mode === 'magiclink' && (
          <form action={loginWithMagicLink} onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input name="email" type="email" placeholder={t('auth.email_placeholder')} required className="pl-10 h-11" />
              </div>
            </div>
            <Button type="submit" variant="glow" className="w-full h-11 text-base group">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>{t('auth.send_link_button')} <ArrowRight className="w-4 h-4 ml-2 opacity-70 group-hover:translate-x-1 transition-transform" /></>
              )}
            </Button>
          </form>
        )}

        <div className="pt-4 text-center">
          {mode === 'magiclink' ? (
            <button onClick={() => setMode('login')} className="text-sm text-primary hover:underline">
              {t('auth.back_to_login')}
            </button>
          ) : (
             <button onClick={() => setMode('magiclink')} className="text-sm text-muted-foreground hover:text-foreground">
              {t('auth.forgot_password')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
