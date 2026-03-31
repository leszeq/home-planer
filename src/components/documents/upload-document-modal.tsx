'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card'
import { Plus, X, UploadCloud, Loader2, FileText, PenTool } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import { createClient } from '@/lib/supabase/client'
import { addDocumentRecord } from '@/app/(dashboard)/dashboard/documents/actions'
import { cn } from '@/lib/utils'

interface Project {
  id: string
  name: string
}

export function UploadDocumentModal() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [docName, setDocName] = useState('')
  const [signerEmail, setSignerEmail] = useState('')
  const [signerName, setSignerName] = useState('')
  const [mode, setMode] = useState<'scan' | 'esign'>('scan')
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      fetchProjects()
    } else {
      setSelectedFile(null)
      setDocName('')
    }
  }, [isOpen])

  const fetchProjects = async () => {
    const { data } = await supabase.from('projects').select('id, name').order('name')
    if (data) setProjects(data)
  }

  const handleFileChange = (file: File) => {
    setSelectedFile(file)
    if (!docName) {
      // Remove extension for the default doc name
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "")
      setDocName(nameWithoutExt)
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileChange(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return
    
    setIsUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user')

      if (mode === 'scan') {
        if (!selectedFile) return
        const file = selectedFile

        // 1. Upload to Storage
        const fileExt = file.name.split('.').pop()
        const randomName = `${Math.random().toString(36).substring(2)}-${Date.now()}`
        const storagePath = `${user.id}/documents/${randomName}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('project-files')
          .upload(storagePath, file)

        if (uploadError) throw uploadError

        // 2. Create Record
        await addDocumentRecord(
          selectedProjectId,
          docName || file.name,
          'scan',
          storagePath
        )
      } else {
        // 1. & 2. Initiate e-signature AND Save metadata on the server
        const { requestSignatureAction } = await import('@/app/(dashboard)/dashboard/documents/actions')
        await requestSignatureAction(
          selectedProjectId,
          docName,
          signerName,
          signerEmail,
          selectedFile
        )
      }

      setIsOpen(false)
      setDocName('')
      setSignerEmail('')
      setSignerName('')
      setSelectedProjectId('')
    } catch (err) {
      console.error(err)
      alert(t('common.error'))
    } finally {
      setIsUploading(false)
    }
  }

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="gap-2">
        <Plus className="w-4 h-4" />
        {t('documents.add_document')}
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <Card className="w-full max-w-lg shadow-2xl border-primary/10">
        <form onSubmit={handleSubmit}>
          <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/5">
            <div>
              <CardTitle className="text-xl">{t('documents.add_document')}</CardTitle>
              <CardDescription>{t('documents.add_document_desc')}</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} type="button">
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-6">
            {/* Mode Toggle */}
            <div className="flex p-1 bg-muted rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setMode('scan')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all",
                  mode === 'scan' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:bg-background/50"
                )}
              >
                <FileText className="w-4 h-4" />
                {t('documents.mode_scan')}
              </button>
              <button
                type="button"
                onClick={() => setMode('esign')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all",
                  mode === 'esign' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:bg-background/50"
                )}
              >
                <PenTool className="w-4 h-4" />
                {t('documents.mode_esign')}
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">{t('documents.doc_name')}</label>
                <Input 
                  value={docName} 
                  onChange={(e) => setDocName(e.target.value)} 
                  placeholder={t('documents.doc_name_placeholder')} 
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">{t('documents.select_project')}</label>
                <select 
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                >
                  <option value="">{t('documents.no_project')}</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Unified File Upload */}
              {selectedFile ? (
                <div className="flex items-center justify-between p-4 border rounded-xl bg-primary/5 border-primary/20 animate-in zoom-in-95">
                  <div className="flex items-center gap-3 truncate">
                    <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{selectedFile.name}</p>
                      <p className="text-[10px] text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                    className="hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div 
                  className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl border-muted-foreground/30 hover:border-primary/50 cursor-pointer transition-colors bg-muted/5 group"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-primary/50', 'bg-primary/5'); }}
                  onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-primary/50', 'bg-primary/5'); }}
                  onDrop={(e) => { e.currentTarget.classList.remove('border-primary/50', 'bg-primary/5'); onDrop(e); }}
                >
                  <UploadCloud className="w-12 h-12 mb-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  <p className="text-sm font-medium mb-1">{t('documents.click_to_upload')}</p>
                  <p className="text-xs text-muted-foreground">{t('documents.file_types_desc')}</p>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="application/pdf,image/*" 
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileChange(file)
                    }}
                  />
                </div>
              )}

              {/* Recipients - Only for E-Sign */}
              {mode === 'esign' && (
                <div className="space-y-4 p-6 border rounded-xl bg-purple-50/20 border-purple-100 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-2 text-purple-600 mb-2">
                    <PenTool className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-wider">{t('documents.esign_setup')}</span>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground">{t('documents.signer_name')}</label>
                    <Input 
                      value={signerName} 
                      onChange={(e) => setSignerName(e.target.value)} 
                      placeholder={t('documents.signer_name_placeholder')} 
                      required={mode === 'esign'}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground">{t('documents.signer_email')}</label>
                    <Input 
                      type="email"
                      value={signerEmail} 
                      onChange={(e) => setSignerEmail(e.target.value)} 
                      placeholder="jan.kowalski@email.com" 
                      required={mode === 'esign'}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground italic mt-2">
                    {t('documents.esign_provider_info', { provider: 'BoldSign' })}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="border-t bg-muted/5 pt-6">
            <Button 
              type="submit" 
              className="w-full h-11 text-base font-semibold" 
              disabled={
                isUploading || 
                !selectedFile || 
                (mode === 'esign' && (!signerName || !signerEmail))
              }
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {t('documents.uploading')}
                </>
              ) : mode === 'scan' ? t('documents.upload_scan') : t('documents.send_to_sign')}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
