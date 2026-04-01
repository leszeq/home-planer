'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card'
import { Plus, X, UploadCloud, Loader2, FileText, PenTool, Tag } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import { createClient } from '@/lib/supabase/client'
import { addDocumentRecord, requestSignatureAction } from '@/app/(dashboard)/dashboard/documents/actions'
import { useRouter } from 'next/navigation'
import { useFileUpload } from '@/hooks/use-file-upload'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from '@/lib/utils'

interface Project {
  id: string
  name: string
}

export function UploadDocumentModal() {
  const { t } = useTranslation()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>('none')
  const [docName, setDocName] = useState('')
  const [mode, setMode] = useState<'scan' | 'esign'>('scan')
  const [signerEmail, setSignerEmail] = useState('')
  const [signerName, setSignerName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isEsignSending, setIsEsignSending] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [userId, setUserId] = useState<string>('')

  // 1. Setup User ID and Projects
  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
      
      const { data } = await supabase.from('projects').select('id, name').order('name')
      if (data) setProjects(data)
    }
    if (isOpen) init()
    else {
      setFile(null)
      setDocName('')
      setSignerEmail('')
      setSignerName('')
      setSelectedProjectId('none')
    }
  }, [isOpen])

  // 2. Setup Upload Hook
  const { uploadFiles, isUploading: isScanUploading } = useFileUpload({
    userId,
    onSuccess: () => {
      router.refresh()
      setIsOpen(false)
    }
  })

  // 3. Handlers
  const handleScanUpload = async () => {
    if (!docName || !file) {
      toast.error(t('documents.error_missing_fields') || 'Brakujące dane')
      return
    }

    const projectId = selectedProjectId === 'none' ? "" : selectedProjectId
    
    await uploadFiles(
      [file],
      (f, storagePath) => addDocumentRecord(projectId, docName, 'scan', storagePath),
      `${userId}/documents` // Global documents path
    )
  }

  const handleEsignRequest = async () => {
    if (!docName || !file || !signerName || !signerEmail) {
      toast.error(t('documents.error_missing_fields') || 'Brakujące dane')
      return
    }

    setIsEsignSending(true)
    const toastId = toast.loading(t('documents.sending_request') || 'Wysyłanie prośby...')
    try {
      const projectId = selectedProjectId === 'none' ? "" : selectedProjectId
      const response = await requestSignatureAction(projectId, docName, signerName, signerEmail, file)
      
      if (response.success) {
        toast.success(t('common.success'), { id: toastId })
        router.refresh()
        setIsOpen(false)
      } else {
        toast.error(response.error || t('common.error'), { id: toastId })
      }
    } catch (e: any) {
      toast.error(e.message || t('common.error'), { id: toastId })
    } finally {
      setIsEsignSending(false)
    }
  }

  const handleUpload = () => {
    if (mode === 'scan') handleScanUpload()
    else handleEsignRequest()
  }

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="gap-2 rounded-xl shadow-md card-hover font-bold">
        <Plus className="w-4 h-4" />
        {t('documents.add_document')}
      </Button>
    )
  }

  const isAnyLoading = isScanUploading || isEsignSending

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-lg shadow-xl border-border/50 animate-in zoom-in-95 duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight">{t('documents.add_document')}</CardTitle>
            <CardDescription className="font-medium">{t('documents.add_document_desc')}</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full">
            <X className="w-5 h-5 text-muted-foreground" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-2">
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-secondary/50 rounded-xl border border-border/50">
            <button
              onClick={() => setMode('scan')}
              disabled={isAnyLoading}
              className={cn(
                "flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all",
                mode === 'scan' ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <FileText className="w-4 h-4" />
              {t('documents.mode_scan')}
            </button>
            <button
              onClick={() => setMode('esign')}
              disabled={isAnyLoading}
              className={cn(
                "flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all",
                mode === 'esign' ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <PenTool className="w-4 h-4" />
              {t('documents.mode_esign')}
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                {t('documents.doc_name')}
              </label>
              <Input
                placeholder={t('documents.doc_name_placeholder')}
                value={docName}
                disabled={isAnyLoading}
                onChange={(e) => setDocName(e.target.value)}
                className="rounded-lg h-11 font-medium bg-secondary/30"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                {t('documents.select_project')}
              </label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId} disabled={isAnyLoading}>
                <SelectTrigger className="h-11 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 opacity-50" />
                    <SelectValue placeholder={t('documents.no_project')} />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('documents.no_project')}</SelectItem>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {mode === 'esign' ? (
              <div className="space-y-4 pt-2 p-4 bg-primary/5 rounded-xl border border-primary/10">
                <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                  <PenTool className="w-4 h-4" />
                  {t('documents.esign_setup')}
                </h4>
                <div className="grid gap-3">
                  <Input
                    placeholder={t('documents.signer_name_placeholder')}
                    value={signerName}
                    disabled={isAnyLoading}
                    onChange={(e) => setSignerName(e.target.value)}
                    className="rounded-lg h-10 bg-card border-primary/20"
                  />
                  <Input
                    placeholder={t('documents.signer_email')}
                    type="email"
                    value={signerEmail}
                    disabled={isAnyLoading}
                    onChange={(e) => setSignerEmail(e.target.value)}
                    className="rounded-lg h-10 bg-card border-primary/20"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground italic">
                  {t('documents.esign_provider_info', { provider: 'BoldSign' })}
                </p>
              </div>
            ) : (
              <div 
                onClick={() => !isAnyLoading && fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all bg-secondary/20 hover:bg-secondary/40 hover:border-primary/50",
                  file ? "border-primary bg-primary/5" : "border-border",
                  isAnyLoading && "opacity-50 cursor-not-allowed"
                )}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  disabled={isAnyLoading}
                  accept=".pdf,image/*"
                  onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
                />
                <UploadCloud className={cn("w-10 h-10", file ? "text-primary" : "text-muted-foreground")} />
                <div className="text-center">
                  <p className="text-sm font-bold">
                    {file ? file.name : t('documents.click_to_upload')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('documents.file_types_desc')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex gap-3 pt-4 border-t border-border/50">
          <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={isAnyLoading} className="flex-1 rounded-xl text-muted-foreground font-bold">
            {t('common.cancel')}
          </Button>
          <Button 
            disabled={isAnyLoading} 
            onClick={handleUpload}
            className="flex-1 rounded-xl font-bold shadow-md shadow-primary/20"
          >
            {isAnyLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {mode === 'esign' ? t('documents.send_to_sign') : t('documents.upload_scan')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
