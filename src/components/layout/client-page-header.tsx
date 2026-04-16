'use client'

import { useTranslation } from '@/lib/i18n/LanguageContext'
import React from 'react'

interface ClientPageHeaderProps {
  titleKey: string
  descKey: string
  icon?: React.ReactNode
  variant?: 'default' | 'xl'
}

export function ClientPageHeader({ titleKey, descKey, icon, variant = 'default' }: ClientPageHeaderProps) {
  const { t } = useTranslation()

  if (variant === 'xl') {
    return (
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex-1 pl-14 md:pl-0">
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">{t(titleKey)}</h1>
          <p className="text-muted-foreground mt-2 text-base md:text-lg max-w-2xl">
            {t(descKey)}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4 pl-14 md:pl-0">
      {icon && (
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
      )}
      <div>
        <h1 className="text-xl md:text-3xl font-bold tracking-tight">{t(titleKey)}</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          {t(descKey)}
        </p>
      </div>
    </div>
  )
}
