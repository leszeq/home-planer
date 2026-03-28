'use client'

import { AuthForm } from '@/components/auth/auth-form'
import { HardHat } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '@/lib/i18n/LanguageContext'

export function LoginClientView({ initialMode, error, message }: { 
  initialMode: 'login' | 'register' | 'magiclink',
  error?: string,
  message?: string
}) {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-screen bg-background relative overflow-hidden">
      
      {/* Dynamic Background Glow for mobile */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10 lg:hidden" />
      
      {/* Left Panel - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex flex-col flex-1 relative bg-secondary/20 border-r border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5" />
        {/* Mock background pattern */}
        <div 
          className="absolute inset-0 opacity-20" 
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }} 
        />
        
        <div className="relative flex flex-col justify-between h-full p-12">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group w-fit">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-primary shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all">
              <HardHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="block text-xl font-bold text-foreground tracking-wide uppercase leading-none">Planer</span>
              <span className="block text-xs text-muted-foreground tracking-widest uppercase mt-0.5">Budowy</span>
            </div>
          </Link>

          <div>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-6">
              {t('auth.hero_title')} <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
                {t('auth.hero_accent')}
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              {t('auth.hero_desc')}
            </p>
          </div>

          <div className="flex gap-4 items-center">
            {/* Fake Avatars to show social proof */}
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full bg-border border-2 border-background" />
              <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-background" />
              <div className="w-10 h-10 rounded-full bg-blue-500/20 border-2 border-background" />
            </div>
            <p className="text-sm text-muted-foreground">{t('auth.social_proof')}</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 relative z-10">
        {/* Mobile Header */}
        <div className="absolute top-6 left-6 lg:hidden">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-primary shadow-lg">
              <HardHat className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="block text-sm font-bold text-foreground tracking-wide uppercase leading-none">Planer</span>
              <span className="block text-[10px] text-muted-foreground tracking-widest uppercase mt-0.5">Budowy</span>
            </div>
          </Link>
        </div>

        <div className="w-full max-w-sm animate-fade-in-up">
          <AuthForm 
            initialMode={initialMode} 
            error={error} 
            message={message} 
          />
        </div>
      </div>

    </div>
  )
}
