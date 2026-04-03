'use client'

import { X, Loader2, FileText, ExternalLink, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import { getBoldSignUrl } from '@/app/(dashboard)/dashboard/documents/actions'
import { toast } from 'sonner'

interface DocumentPreviewModalProps {
  document: {
    id: string
    name: string
    storage_path: string | null
    type: 'scan' | 'e-signature'
    provider_id?: string | null
    provider?: string | null
    status?: string
  } | null
  isOpen: boolean
  onClose: () => void
}

export function DocumentPreviewModal({ document, isOpen, onClose }: DocumentPreviewModalProps) {
  const { t } = useTranslation()
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isOpeningBoldSign, setIsOpeningBoldSign] = useState(false)
  const [error, setError] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    async function getSignedUrl() {
      if (!document?.storage_path || !isOpen) return
      
      setLoading(true)
      setError(false)
      try {
        const { data, error } = await supabase.storage
          .from('project-files')
          .createSignedUrl(document.storage_path, 3600)
        
        if (error || !data) throw error
        setUrl(data.signedUrl)
      } catch (err) {
        console.error('Preview error:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    if (isOpen) {
      if (document?.type === 'scan' && document?.storage_path) {
        getSignedUrl()
      } else {
        setUrl(null)
      }
    }
  }, [isOpen, document, supabase])

  const handleOpenBoldSign = async () => {
    if (!document?.id) return
    setIsOpeningBoldSign(true)
    try {
      const response = await getBoldSignUrl(document.id)
      if (response.success && response.data) {
        window.open(response.data.url, '_blank')
      } else {
        toast.error(response.error || t('common.error'))
      }
    } catch (err) {
      toast.error(t('common.error'))
    } finally {
      setIsOpeningBoldSign(false)
    }
  }

  if (!isOpen || !document) return null

  const isImage = document.storage_path?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
  const isPdf = document.storage_path?.toLowerCase().endsWith('.pdf')

  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-300">
      <Card className="w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl border-primary/20 animate-in zoom-in-95 duration-300 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-lg truncate max-w-[300px] sm:max-w-md">{document.name}</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-muted/30">
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-auto p-0 bg-muted/5 flex items-center justify-center relative group">
          {loading && (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-primary opacity-50" />
              <p className="text-sm text-muted-foreground animate-pulse">{t('common.loading')}</p>
            </div>
          )}
          
          {error && (
            <div className="text-center p-8">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
                <X className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium">{t('documents.preview_error') || 'Nie udało się załadować podglądu.'}</p>
              <p className="text-xs text-muted-foreground mt-2">{t('documents.preview_error_hint') || 'Plik może być niedostępny lub uszkodzony.'}</p>
            </div>
          )}

          {!loading && !error && url && (
            isPdf ? (
              <iframe 
                src={`${url}#toolbar=0`} 
                className="w-full h-full border-none"
                title={document.name}
              />
            ) : isImage ? (
              <img 
                src={url} 
                alt={document.name} 
                className="max-w-full max-h-full object-contain shadow-lg"
              />
            ) : (
              <div className="text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                <p className="text-sm">{t('documents.preview_not_supported') || 'Podgląd dla tego formatu nie jest wspierany.'}</p>
              </div>
            )
          )}

          {!loading && !error && document.type === 'e-signature' && (
            <div className="text-center max-w-sm p-8 bg-card border rounded-2xl shadow-xl">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-purple-600">
                <ExternalLink className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold mb-2">{t('documents.esign_preview_title') || 'Podgląd E-Podpisu'}</h3>
              <p className="text-sm text-muted-foreground mb-6">
                {t('documents.esign_preview_desc') || `Podgląd dokumentów BoldSign wymaga autoryzacji u dostawcy. Kliknij poniżej, aby otworzyć dokument.`}
              </p>
              <Button 
                onClick={handleOpenBoldSign} 
                className="w-full"
                disabled={isOpeningBoldSign}
              >
                {isOpeningBoldSign ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <ExternalLink className="w-4 h-4 mr-2" />
                )}
                {t('documents.open_in_boldsign') || 'Otwórz Dokument'}
              </Button>
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t bg-muted/10 p-4 shrink-0 flex justify-end gap-3">
          {url && (
            <Button variant="outline" asChild>
              <a href={url} download={document.name} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                {t('common.download')}
              </a>
            </Button>
          )}
          <Button onClick={onClose} variant="secondary">
            {t('common.close') || t('common.cancel')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
