'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Users, Mail, UserPlus, Shield, X, Loader2 } from 'lucide-react'
import { inviteMember, removeMember, updateMemberRole } from '@/app/(dashboard)/dashboard/projects/[id]/actions'
import { useTranslation } from '@/lib/i18n/LanguageContext'

interface ProjectMember {
  id: string
  project_id: string
  user_id: string | null
  email: string
  role: string
  created_at: string
}

export function TeamManagement({ 
  projectId, 
  ownerId, 
  ownerName,
  ownerEmail,
  currentUserId,
  members,
  userRole,
  hideCard = false
}: { 
  projectId: string
  ownerId: string
  ownerName?: string
  ownerEmail?: string
  currentUserId: string
  members: ProjectMember[]
  userRole?: string
  hideCard?: boolean
}) {
  const { t } = useTranslation()
  const [isInviting, setIsInviting] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('editor')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canManage = currentUserId === ownerId || userRole === 'owner' || userRole === 'editor'

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    // Prosta walidacja na duplikat
    if (members.some(m => m.email === inviteEmail.toLowerCase())) {
      setError(t('team.error_duplicate'))
      setLoading(false)
      return
    }

    const { error: actionError } = await inviteMember(projectId, inviteEmail, inviteRole)
    if (actionError) {
      setError(actionError)
    } else {
      setInviteEmail('')
      setIsInviting(false)
    }
    setLoading(false)
  }

  const handleRoleChange = async (memberId: string, newRole: string) => {
    await updateMemberRole(projectId, memberId, newRole)
  }

  const handleRemove = async (memberId: string) => {
    if (confirm(t('team.remove_member_confirm'))) {
      await removeMember(projectId, memberId)
    }
  }

  const content = (
    <div className="space-y-4">
      {isInviting && (
        <form onSubmit={handleInvite} className="p-4 bg-secondary/30 rounded-lg border border-border/50 animate-fade-in mb-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-semibold">{t('team.invite_title')}</h4>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsInviting(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-col gap-3">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                required
                type="email"
                placeholder={t('team.invite_placeholder')}
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
            <div className="flex gap-2">
              <select 
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value)}
                className="h-10 px-3 bg-background border border-input rounded-md text-sm flex-1"
              >
                <option value="editor">{t('common.editor')}</option>
                <option value="viewer">{t('common.viewer')}</option>
              </select>
              <Button type="submit" disabled={loading} className="h-10">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('team.invite')}
              </Button>
            </div>
          </div>
          {error && (
            <p className="text-xs text-destructive mt-3">{error}</p>
          )}
        </form>
      )}

      <div className="space-y-2">
        {/* Owner Row (Fixed) */}
        <div className="flex items-center justify-between p-3 rounded border bg-background">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium">{t('team.main_owner')}</p>
              <p className="text-xs text-muted-foreground whitespace-nowrap">
                {currentUserId === ownerId ? t('team.you') : (ownerName || ownerEmail || t('common.owner'))}
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2 py-1 bg-primary/10 text-primary rounded capitalize">
            {t('common.owner')}
          </span>
        </div>

        {/* Invited Members */}
        {members.map(member => (
          <div key={member.id} className="flex items-center justify-between p-3 rounded border border-border/50 bg-background/50">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-muted-foreground">
                <Users className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate max-w-[150px]">{member.email}</p>
                <p className="text-xs text-muted-foreground">
                  {member.user_id ? t('team.connected') : t('team.waiting')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {canManage ? (
                <select 
                  value={member.role}
                  onChange={e => handleRoleChange(member.id, e.target.value)}
                  className="h-7 px-2 text-[10px] bg-transparent border border-input rounded-md font-medium capitalize"
                >
                  <option value="editor">{t('common.editor')}</option>
                  <option value="viewer">{t('common.viewer')}</option>
                </select>
              ) : (
                <span className="text-[10px] border px-2 py-1 rounded capitalize">
                  {member.role === 'editor' ? t('common.editor') : t('common.viewer')}
                </span>
              )}
              {canManage && (
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleRemove(member.id)}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        ))}

        {members.length === 0 && !isInviting && (
          <p className="text-xs text-muted-foreground italic mt-4 text-center">{t('team.no_members')}</p>
        )}
      </div>
    </div>
  )

  if (hideCard) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t('team.manage_team')}</h3>
          {canManage && !isInviting && (
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setIsInviting(true)}>
              <UserPlus className="w-3.5 h-3.5 mr-2" />
              {t('team.add_person')}
            </Button>
          )}
        </div>
        {content}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b mb-4 bg-muted/30">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            {t('team.title')}
          </CardTitle>
          <CardDescription className="mt-1">
            {t('team.description')}
          </CardDescription>
        </div>
        {canManage && !isInviting && (
          <Button size="sm" onClick={() => setIsInviting(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            {t('team.invite')}
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="pt-2">
        {content}
      </CardContent>
    </Card>
  )
}
