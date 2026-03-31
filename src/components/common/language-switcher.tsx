'use client'

import { useTranslation } from '@/lib/i18n/LanguageContext'
import { cn } from '@/lib/utils'

interface LanguageSwitcherProps {
  className?: string
  variant?: 'minimal' | 'full'
  onSelect?: () => void
}

export function LanguageSwitcher({ className, variant = 'minimal', onSelect }: LanguageSwitcherProps) {
  const { locale, setLocale } = useTranslation()

  return (
    <div className={cn("flex gap-1 p-1 bg-secondary/30 rounded-lg border border-border/50 backdrop-blur-sm", className)}>
      <button
        onClick={() => {
          setLocale('pl')
          onSelect?.()
        }}
        className={cn(
          "px-2.5 py-1 rounded text-[10px] font-bold transition-all duration-200",
          locale === 'pl' 
            ? "bg-primary text-white shadow-sm scale-105" 
            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
        )}
      >
        PL
      </button>
      <button
        onClick={() => {
          setLocale('en')
          onSelect?.()
        }}
        className={cn(
          "px-2.5 py-1 rounded text-[10px] font-bold transition-all duration-200",
          locale === 'en' 
            ? "bg-primary text-white shadow-sm scale-105" 
            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
        )}
      >
        EN
      </button>
    </div>
  )
}
