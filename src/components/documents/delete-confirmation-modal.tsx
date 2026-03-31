'use client'

import { AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card'
import { useTranslation } from '@/lib/i18n/LanguageContext'

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  itemName: string
  isDeleting: boolean
}

export function DeleteConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  itemName,
  isDeleting 
}: DeleteConfirmationModalProps) {
  const { t } = useTranslation()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <Card className="w-full max-w-md shadow-2xl border-destructive/20 animate-in zoom-in-95 duration-200">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle className="text-xl text-destructive">{t('common.confirm_delete')}</CardTitle>
          <CardDescription className="pt-2">
            {t('documents.delete_confirm_msg', { name: itemName })}
            <br />
            <span className="font-semibold text-destructive/80 mt-1 block">
              {t('common.cannot_be_undone')}
            </span>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="py-2" />

        <CardFooter className="flex gap-3 pt-4 border-t bg-muted/5">
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={onClose}
            disabled={isDeleting}
          >
            {t('common.cancel')}
          </Button>
          <Button 
            variant="destructive" 
            className="flex-1 shadow-lg shadow-destructive/20" 
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('common.deleting')}
              </>
            ) : (
              t('common.delete')
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
