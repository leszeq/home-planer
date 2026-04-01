import { useState } from 'react'
import { FileText, Trash2, Download, ExternalLink, Clock, CheckCircle2, AlertCircle, RefreshCw, Eye, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { deleteDocument, syncDocumentStatusAction, getBoldSignUrl } from '@/app/(dashboard)/dashboard/documents/actions'
import { cn } from '@/lib/utils'
import { DeleteConfirmationModal } from './delete-confirmation-modal'
import { DocumentPreviewModal } from './document-preview-modal'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

export interface Document {
  id: string
  project_id: string | null
  user_id: string
  name: string
  type: 'scan' | 'e-signature'
  status: 'draft' | 'pending' | 'signed' | 'rejected' | 'archived'
  storage_path: string | null
  provider_id: string | null
  provider: 'autenti' | 'docusign' | 'boldsign' | null
  signed_at: string | null
  created_at: string
}

interface DocumentListProps {
  documents: Document[]
  isLoading?: boolean
  projectNames?: Record<string, string>
}

export function DocumentList({ documents, isLoading, projectNames }: DocumentListProps) {
  const { t, locale } = useTranslation()
  const [isRefreshing, setIsRefreshing] = useState<string | null>(null)
  const [isOpeningUrl, setIsOpeningUrl] = useState<string | null>(null)
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null)
  const [docToDelete, setDocToDelete] = useState<Document | null>(null)
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null)
  
  const supabase = createClient()

  const handleDownload = async (e: React.MouseEvent, doc: Document) => {
    e.stopPropagation()
    if (!doc.storage_path) return
    const { data, error } = await supabase.storage
      .from('project-files')
      .createSignedUrl(doc.storage_path, 60)
      
    if (error || !data) {
      toast.error(t('common.error'))
      return
    }
    window.open(data.signedUrl, '_blank')
  }

  const handleSyncStatus = async (e: React.MouseEvent, docId: string) => {
    e.stopPropagation()
    setIsRefreshing(docId)
    const toastId = toast.loading(t('documents.syncing_status') || 'Synchronizacja statusu...')
    
    // Updated to handle ActionResponse
    const response = await syncDocumentStatusAction(docId)
    
    if (response.success) {
      toast.success(t('documents.status_synced') || 'Status zaktualizowany!', { id: toastId })
    } else {
      toast.error(response.error || t('common.error'), { id: toastId })
    }
    setIsRefreshing(null)
  }

  const handleOpenBoldSign = async (e: React.MouseEvent, documentId: string) => {
    e.stopPropagation()
    setIsOpeningUrl(documentId)
    
    // Updated to handle ActionResponse
    const response = await getBoldSignUrl(documentId)
    
    if (response.success && response.data) {
      window.open(response.data.url, '_blank')
    } else {
      toast.error(response.error || t('common.error'))
    }
    setIsOpeningUrl(null)
  }

  const handleDelete = async () => {
    if (!docToDelete) return
    setIsDeletingId(docToDelete.id)
    const toastId = toast.loading(t('common.deleting') || 'Usuwanie...')
    
    // Updated to handle ActionResponse
    const response = await deleteDocument(docToDelete.id, docToDelete.storage_path || undefined)
    
    if (response.success) {
      toast.success(t('common.deleted') || 'Usunięto!', { id: toastId })
      setDocToDelete(null)
    } else {
      toast.error(response.error || t('common.error'), { id: toastId })
    }
    setIsDeletingId(null)
  }

  const getStatusBadge = (status: Document['status'], docId: string) => {
    switch (status) {
      case 'signed':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 gap-1 font-bold text-[10px] uppercase tracking-tighter"><CheckCircle2 className="w-3 h-3" /> {t('documents.status_signed')}</Badge>
      case 'pending':
        return (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 gap-1 font-bold text-[10px] uppercase tracking-tighter">
              <Clock className="w-3 h-3" /> {t('documents.status_pending')}
            </Badge>
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-6 h-6 rounded-full hover:bg-amber-100"
              onClick={(e) => handleSyncStatus(e, docId)}
              disabled={isRefreshing === docId}
            >
              <RefreshCw className={cn("w-3 h-3 text-amber-600", isRefreshing === docId && "animate-spin")} />
            </Button>
          </div>
        )
      case 'rejected':
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20 gap-1 font-bold text-[10px] uppercase tracking-tighter"><AlertCircle className="w-3 h-3" /> {t('documents.status_rejected')}</Badge>
      default:
        return <Badge variant="outline" className="font-bold text-[10px] uppercase tracking-tighter">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-xl bg-muted/5">
        <FileText className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
        <h3 className="text-lg font-medium">{t('documents.no_documents')}</h3>
        <p className="text-muted-foreground text-sm">{t('documents.no_documents_msg')}</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {documents.map((doc) => (
          <div 
            key={doc.id} 
            className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:shadow-md hover:border-primary/20 cursor-pointer transition-all group"
            onClick={() => setPreviewDoc(doc)}
          >
            <div 
              className={cn(
                "p-3 rounded-lg flex-shrink-0 transition-colors relative",
                doc.type === 'scan' ? "bg-blue-500/10 text-blue-600 group-hover:bg-blue-500/20" : "bg-purple-500/10 text-purple-600 group-hover:bg-purple-500/20"
              )}
              title={t('documents.tooltip_preview') || "Podgląd dokumentu"}
            >
              <FileText className="w-6 h-6" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Eye className="w-4 h-4" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors" title={doc.name}>{doc.name}</p>
                {getStatusBadge(doc.status, doc.id)}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="shrink-0">{doc.type === 'scan' ? t('documents.type_scan') : t('documents.type_esign')}</span>
                <span className="shrink-0">•</span>
                <span className="shrink-0">{new Date(doc.created_at).toLocaleDateString(locale === 'pl' ? 'pl-PL' : 'en-US')}</span>
                {doc.project_id && projectNames?.[doc.project_id] && (
                  <>
                    <span className="shrink-0">•</span>
                    <span className="text-primary/70 font-medium truncate">{projectNames[doc.project_id]}</span>
                  </>
                )}
                {doc.provider && (
                  <>
                    <span className="shrink-0">•</span>
                    <span className="capitalize shrink-0">{doc.provider}</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              {doc.storage_path && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={(e) => handleDownload(e, doc)} 
                  title={t('common.download')}
                >
                  <Download className="w-4 h-4 text-muted-foreground hover:text-primary" />
                </Button>
              )}
              {doc.provider_id && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  title={t('documents.open_provider')}
                  disabled={isOpeningUrl === doc.id}
                  onClick={(e) => handleOpenBoldSign(e, doc.id)}
                >
                  {isOpeningUrl === doc.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  ) : (
                    <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-primary" />
                  )}
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={(e) => {
                  e.stopPropagation()
                  setDocToDelete(doc)
                }} 
                title={t('common.delete')}
              >
                <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <DeleteConfirmationModal 
        isOpen={!!docToDelete}
        onClose={() => setDocToDelete(null)}
        onConfirm={handleDelete}
        itemName={docToDelete?.name || ''}
        isDeleting={!!isDeletingId}
      />

      <DocumentPreviewModal 
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        document={previewDoc}
      />
    </>
  )
}
