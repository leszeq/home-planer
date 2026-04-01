'use client'

import { formatDistanceToNow } from 'date-fns'
import { pl, enUS } from 'date-fns/locale'
import { 
  FileText, 
  Trash2, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  UserPlus, 
  UserMinus, 
  FileUp, 
  Tag,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import { cn } from '@/lib/utils'

export interface ActivityLog {
  id: string
  project_id: string
  user_id: string
  action: string
  entity_type: string
  entity_id: string | null
  details: any
  created_at: string
  profiles?: {
    full_name: string
  }
}

interface ActivityFeedProps {
  logs: ActivityLog[]
  className?: string
  hideCard?: boolean
}

export function ActivityFeed({ logs, className, hideCard = false }: ActivityFeedProps) {
  const { t, locale } = useTranslation()
  const dateLocale = locale === 'pl' ? pl : enUS

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create_expense':
      case 'create_stage':
      case 'create_project':
        return <PlusCircle className="w-4 h-4 text-emerald-500" />
      case 'delete_expense':
      case 'delete_stage':
      case 'delete_file':
      case 'delete_project':
      case 'remove_member':
        return <Trash2 className="w-4 h-4 text-red-500" />
      case 'update_stage_status':
        return <CheckCircle2 className="w-4 h-4 text-blue-500" />
      case 'update_stage_dates':
        return <Clock className="w-4 h-4 text-amber-500" />
      case 'upload_file':
        return <FileUp className="w-4 h-4 text-primary" />
      case 'invite_member':
        return <UserPlus className="w-4 h-4 text-indigo-500" />
      case 'update_file_stage':
        return <Tag className="w-4 h-4 text-muted-foreground" />
      default:
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />
    }
  }

  const formatActionMessage = (log: ActivityLog) => {
    const details = log.details || {}
    const name = details.name || details.desc || details.email || '...'
    
    switch (log.action) {
      case 'create_expense':
        return t('activity.create_expense', { name, amount: details.amount }) || `Dodano wydatek: ${name} (${details.amount} zł)`
      case 'delete_expense':
        return details.isBulk 
          ? t('activity.delete_expense_bulk', { count: details.count }) || `Usunięto zbiorczo ${details.count} wydatków`
          : t('activity.delete_expense', { name }) || `Usunięto wydatek: ${name}`
      case 'create_stage':
        return t('activity.create_stage', { name }) || `Utworzono etap: ${name}`
      case 'delete_stage':
        return t('activity.delete_stage', { name }) || `Usunięto etap: ${name}`
      case 'update_stage_status':
        return t('activity.update_stage_status', { name, status: details.status }) || `Zmieniono status etapu ${name} na ${details.status}`
      case 'upload_file':
        return t('activity.upload_file', { name }) || `Wgrano plik: ${name}`
      case 'delete_file':
        return details.isBulk
          ? t('activity.delete_file_bulk', { count: details.count }) || `Usunięto zbiorczo ${details.count} plików`
          : t('activity.delete_file', { name }) || `Usunięto plik: ${name}`
      case 'invite_member':
        return t('activity.invite_member', { email: details.email }) || `Zaproszono użytkownika: ${details.email}`
      case 'remove_member':
        return t('activity.remove_member', { email: details.email }) || `Usunięto użytkownika: ${details.email}`
      default:
        return log.action.replace('_', ' ')
    }
  }

  const content = (
    <div className={cn("flex flex-col gap-4", !hideCard ? "h-[500px]" : "")}>
      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground italic">
          <Clock className="w-8 h-8 mb-2 opacity-20" />
          <p className="text-sm">{t('activity.no_logs') || 'Brak zarejestrowanej historii'}</p>
        </div>
      ) : (
        <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-muted-foreground/10 before:to-transparent pr-2 custom-scrollbar overflow-y-auto">
          {logs.map((log) => (
            <div key={log.id} className="relative flex items-start gap-4 group">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-card border border-border shadow-sm flex items-center justify-center z-10 group-hover:border-primary/30 transition-colors">
                {getActionIcon(log.action)}
              </div>
              <div className="flex-1 pt-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
                  <p className="text-sm font-bold text-foreground/90 truncate pr-4">
                    {formatActionMessage(log)}
                  </p>
                  <time className="text-[10px] text-muted-foreground font-semibold tabular-nums sm:shrink-0">
                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: dateLocale })}
                  </time>
                </div>
                <p className="text-[10px] text-muted-foreground/70 font-medium">
                  {log.profiles?.full_name || 'System'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  if (hideCard) return content

  return (
    <Card className={cn("flex flex-col h-full border border-border shadow-sm", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold tracking-tight">{t('activity.title') || 'Historia zmian'}</CardTitle>
        <CardDescription className="text-sm font-medium">{t('activity.subtitle') || 'Najnowsze wydarzenia w projekcie'}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pt-2">
        {content}
      </CardContent>
    </Card>
  )
}
