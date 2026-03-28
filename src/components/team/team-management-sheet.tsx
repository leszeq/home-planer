'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Users, X } from 'lucide-react'
import { TeamManagement } from './team-management'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n/LanguageContext'

interface ProjectMember {
  id: string
  project_id: string
  user_id: string | null
  email: string
  role: string
  created_at: string
}

export function TeamManagementSheet({ 
  projectId, 
  ownerId, 
  ownerName,
  ownerEmail,
  currentUserId,
  members,
  userRole
}: { 
  projectId: string
  ownerId: string
  ownerName?: string
  ownerEmail?: string
  currentUserId: string
  members: ProjectMember[]
  userRole?: string
}) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setIsOpen(true)}
        className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
        title={t('team.title')}
      >
        <Users className="w-5 h-5" />
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
          "fixed right-0 top-0 h-full w-full max-w-sm bg-card border-l shadow-2xl z-50 transition-transform duration-300 ease-in-out transform overflow-y-auto",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="p-4 border-b flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">{t('team.title')}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors">
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="p-4 pt-6">
          <TeamManagement
            projectId={projectId}
            ownerId={ownerId}
            ownerName={ownerName}
            ownerEmail={ownerEmail}
            currentUserId={currentUserId}
            members={members}
            userRole={userRole}
            hideCard={true}
          />
        </div>
      </div>
    </>
  )
}
