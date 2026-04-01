'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Clock, X } from 'lucide-react'
import { ActivityFeed, ActivityLog } from './activity-feed'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n/LanguageContext'

interface ActivitySheetProps {
  logs: ActivityLog[]
}

export function ActivitySheet({ logs }: ActivitySheetProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setIsOpen(true)}
        className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
        title={t('activity.title') || 'Historia zmian'}
      >
        <Clock className="w-5 h-5" />
      </Button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sheet Content */}
      <div 
        className={cn(
          "fixed right-0 top-0 h-full w-full max-w-sm bg-card border-l shadow-2xl z-50 transition-transform duration-300 ease-in-out transform overflow-hidden flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="p-4 border-b flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">{t('activity.title') || 'Historia zmian'}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors">
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 pt-6 custom-scrollbar">
          <ActivityFeed
            logs={logs}
            hideCard={true}
          />
        </div>

        <div className="p-4 border-t bg-muted/10 text-center">
            <p className="text-[10px] text-muted-foreground font-medium">
                {t('activity.subtitle') || 'Ostatnie 20 wydarzeń z życia Twojej budowy'}
            </p>
        </div>
      </div>
    </>
  )
}
