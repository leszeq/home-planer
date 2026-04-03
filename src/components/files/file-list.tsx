'use client'

import { useState, useRef, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UploadCloud, File, FileText, Image as ImageIcon, Trash2, Download, Loader2, Eye, Tag, Search, CheckCircle, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { addFileRecord, deleteFile, deleteMultipleFiles, updateFileStage } from '@/app/(dashboard)/dashboard/projects/[id]/files/actions'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import { DocumentPreviewModal } from '@/components/documents/document-preview-modal'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useFileUpload } from '@/hooks/use-file-upload'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from '@/lib/utils'
import { useQueryClient } from '@tanstack/react-query'

export interface ProjectFile {
  id: string
  project_id: string
  name: string
  storage_path: string
  content_type: string
  size_bytes: number
  created_at: string
  stage_id?: string | null
}

interface Stage {
  id: string
  name: string
}

function getFileIcon(contentType: string) {
  if (contentType.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-blue-500" />
  if (contentType.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />
  return <File className="w-5 h-5 text-gray-500" />
}

export function FileList({
  projectId,
  userId,
  files,
  stages = [],
  canEdit = true
}: {
  projectId: string;
  userId: string;
  files: ProjectFile[];
  stages?: Stage[];
  canEdit?: boolean;
}) {
  const { t, locale } = useTranslation()
  const [dragActive, setDragActive] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStageId, setSelectedStageId] = useState<string>('none')
  const [filterStageId, setFilterStageId] = useState<string>('all')
  const [previewFile, setPreviewFile] = useState<ProjectFile | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isDeletingBatch, setIsDeletingBatch] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const queryClient = useQueryClient()

  // 1. Filter Logic
  const filteredFiles = useMemo(() => {
    return files.filter(file => {
      const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStage = filterStageId === 'all' || file.stage_id === filterStageId
      return matchesSearch && matchesStage
    })
  }, [files, searchTerm, filterStageId])

  // 2. Selection Logic
  const toggleSelectAll = (checked: boolean) => {
    if (checked) setSelectedIds(new Set(filteredFiles.map(f => f.id)))
    else setSelectedIds(new Set())
  }

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) newSelected.delete(id)
    else newSelected.add(id)
    setSelectedIds(newSelected)
  }

  // 3. Upload Hook
  const { uploadFiles, isUploading, uploadProgress } = useFileUpload({
    userId,
    onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['project', projectId] })
       if (fileInputRef.current) fileInputRef.current.value = ''
    }
  })

  const handleFileUpload = (incomingFiles: FileList | File[]) => {
    uploadFiles(
      incomingFiles,
      (file, storagePath) => addFileRecord(
        projectId,
        file.name,
        storagePath,
        file.type,
        file.size,
        selectedStageId === 'none' ? null : selectedStageId
      ),
      `${userId}/${projectId}`
    )
  }

  // 4. Batch Actions
  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return
    setIsDeletingBatch(true)
    const toastId = toast.loading(t('common.deleting') || 'Usuwanie...')
    
    // Prep data for batch deletion (need both ID and Path for storage cleanup)
    const filesToDelete = files
      .filter(f => selectedIds.has(f.id))
      .map(f => ({ id: f.id, path: f.storage_path }))

    const response = await deleteMultipleFiles(projectId, filesToDelete)
    
    if (response.success) {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      toast.success(t('common.deleted'), { id: toastId })
      setSelectedIds(new Set())
    } else {
      toast.error(response.error || t('common.error'), { id: toastId })
    }
    setIsDeletingBatch(false)
  }

  // 5. Individual Actions
  const handleDownload = async (file: ProjectFile) => {
    const { data, error } = await supabase.storage
      .from('project-files')
      .createSignedUrl(file.storage_path, 60, { download: file.name })

    if (error || !data) {
      console.error(error)
      toast.error(t('files.error_download'))
      return
    }

    const a = document.createElement('a')
    a.href = data.signedUrl
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleUpdateStage = async (fileId: string, stageId: string) => {
    const newStageId = stageId === 'none' ? null : stageId
    const toastId = toast.loading(t('common.saving') || 'Zapisywanie...')
    const response = await updateFileStage(projectId, fileId, newStageId)
    
    if (response.success) {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      toast.success(t('common.saved') || 'Zapisano!', { id: toastId })
    } else {
      toast.error(response.error || t('common.error'), { id: toastId })
    }
  }

  const handleDeleteFile = async (file: ProjectFile) => {
    const toastId = toast.loading(t('common.deleting') || 'Usuwanie...')
    const response = await deleteFile(projectId, file.id, file.storage_path)
    
    if (response.success) {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      toast.success(t('common.deleted') || 'Usunięto!', { id: toastId })
    } else {
      toast.error(response.error || t('common.error'), { id: toastId })
    }
  }

  // Drag handlers
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files)
    }
  }

  return (
    <Card className="flex flex-col border border-border shadow-sm animate-fade-in pb-4 relative">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold tracking-tight">{t('files.title')}</CardTitle>
            <CardDescription className="text-sm font-medium">{t('files.subtitle')}</CardDescription>
          </div>
          {filteredFiles.length > 0 && canEdit && (
            <Checkbox 
              checked={selectedIds.size === filteredFiles.length && filteredFiles.length > 0} 
              onCheckedChange={(checked) => toggleSelectAll(!!checked)}
              className="mr-2"
            />
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-6 overflow-visible pt-2">
        {/* Top Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder={t('common.search') || "Szukaj..."} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 border-muted-foreground/20 bg-secondary/5 text-xs"
            />
          </div>
          <Select value={filterStageId} onValueChange={setFilterStageId}>
            <SelectTrigger className="w-full sm:w-[150px] h-9 text-xs font-bold bg-secondary/5 border-muted-foreground/20">
              <SelectValue placeholder="Wszystkie etapy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all') || "Wszystkie"}</SelectItem>
              {stages.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Dropzone */}
        {canEdit && (
          <div className="space-y-4">
            <div
              className={cn(
                "flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all duration-300",
                dragActive ? 'border-primary bg-primary/10 shadow-glow' : 'border-muted-foreground/20 bg-secondary/5 hover:border-primary/40 hover:bg-secondary/10'
              )}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors",
                dragActive ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
              )}>
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold mb-1">
                {t('files.drag_drop')}
              </p>

              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                className="hidden"
                multiple
                accept="image/*,.pdf,.doc,.docx"
              />

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md justify-center">
                <Select value={selectedStageId} onValueChange={setSelectedStageId}>
                  <SelectTrigger className="w-full sm:w-[180px] h-9 text-xs">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 opacity-50" />
                      <SelectValue placeholder={t('files.assign_stage') || "Przypisz etap"} />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t('common.none') || "Brak"}</SelectItem>
                    {stages.map(stage => (
                      <SelectItem key={stage.id} value={stage.id}>{stage.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="h-9 px-4 text-xs font-bold w-full sm:w-auto"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('files.uploading')} {uploadProgress}%
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-3.5 h-3.5 mr-2" />
                      {t('files.select_files')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* File List */}
        <div className="space-y-2 flex-1 overflow-y-auto pr-1 custom-scrollbar">
          {filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
                <File className="w-6 h-6 text-muted-foreground opacity-20" />
              </div>
              <p className="text-sm text-muted-foreground font-medium italic">
                {searchTerm ? t('common.no_search_results') || "Brak wyników wyszukiwania" : t('files.no_files_details')}
              </p>
            </div>
          ) : (
            filteredFiles.map((file, idx) => {
              const fileStage = stages.find(s => s.id === file.stage_id);

              return (
                <div
                  key={file.id}
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-xl border border-transparent bg-secondary/10 hover:bg-card hover:border-border hover:shadow-sm transition-all group animate-fade-in",
                    selectedIds.has(file.id) && "bg-primary/5",
                    idx === 0 ? "delay-75" : idx === 1 ? "delay-150" : "delay-225"
                  )}
                >
                  {canEdit && (
                    <Checkbox 
                      checked={selectedIds.has(file.id)} 
                      onCheckedChange={() => toggleSelect(file.id)}
                    />
                  )}
                  
                  <div className="w-10 h-10 rounded-lg bg-card flex items-center justify-center shadow-sm border border-border">
                    {getFileIcon(file.content_type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-bold truncate text-foreground/90" title={file.name}>{file.name}</p>
                      {fileStage && (
                        <Badge
                          variant="outline"
                          className="text-[9px] px-1.5 py-0 h-4 font-bold uppercase tracking-tighter bg-primary/5 text-primary border-primary/20 max-w-[80px] truncate"
                          title={fileStage.name}
                        >
                          {fileStage.name}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-semibold">
                      <span className="bg-muted px-1.5 py-0.5 rounded text-[9px] uppercase tracking-tighter">
                        {file.content_type.startsWith('image/') ? t('files.type_image') : 
                         file.content_type.includes('pdf') ? t('files.type_pdf') : 
                         t('files.type_document')}
                      </span>
                      <span className="opacity-30">•</span>
                      <span className="tabular-nums">{(file.size_bytes / 1024 / 1024).toFixed(2)} MB</span>
                      <span className="opacity-30">•</span>
                      <span>{new Date(file.created_at).toLocaleDateString(locale === 'pl' ? 'pl-PL' : 'en-US')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => setPreviewFile(file)} className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDownload(file)} className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors">
                      <Download className="w-4 h-4" />
                    </Button>

                    {canEdit && (
                      <div className="flex items-center gap-1">
                        <Select value={file.stage_id || 'none'} onValueChange={(val) => handleUpdateStage(file.id, val)}>
                          <SelectTrigger title="Zmień etap" className="h-8 w-8 p-0 flex items-center justify-center border-none bg-transparent hover:bg-secondary/50 focus:ring-0 [&>svg:last-child]:hidden">
                            <Tag className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors shrink-0" />
                          </SelectTrigger>
                          <SelectContent align="end">
                            <SelectItem value="none">{t('common.none')}</SelectItem>
                            {stages.map(stage => (
                              <SelectItem key={stage.id} value={stage.id}>{stage.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Button variant="ghost" size="icon" onClick={() => handleDeleteFile(file)} className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Batch Action Bar */}
        {selectedIds.size > 0 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-8 duration-300">
            <div className="flex items-center gap-4 bg-foreground text-background px-6 py-3 rounded-2xl shadow-2xl border border-border/20">
              <span className="text-sm font-bold flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                {selectedIds.size} {t('common.selected') || "Wybrano"}
              </span>
              <div className="w-px h-4 bg-muted-foreground/30" />
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleBatchDelete()}
                  disabled={isDeletingBatch}
                  className="h-8 rounded-lg hover:bg-destructive hover:text-destructive-foreground text-destructive font-bold transition-all"
                >
                  {isDeletingBatch ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                  {t('common.delete_selected') || "Usuń wybrane"}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setSelectedIds(new Set())}
                  className="h-8 w-8 hover:bg-muted/10 rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        <DocumentPreviewModal
          isOpen={!!previewFile}
          onClose={() => setPreviewFile(null)}
          document={previewFile ? {
            id: previewFile.id,
            name: previewFile.name,
            storage_path: previewFile.storage_path,
            type: 'scan'
          } : null}
        />
      </CardContent>
    </Card>
  )
}
