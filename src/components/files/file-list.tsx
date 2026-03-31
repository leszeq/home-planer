'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UploadCloud, File, FileText, Image as ImageIcon, Trash2, Download, Loader2, Eye, Tag } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { addFileRecord, deleteFile, updateFileStage } from '@/app/(dashboard)/dashboard/projects/[id]/files/actions'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import { DocumentPreviewModal } from '@/components/documents/document-preview-modal'
import { Badge } from '@/components/ui/badge'

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
  if (contentType.startsWith('image/')) return <ImageIcon className="w-8 h-8 text-blue-500" />
  if (contentType.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />
  return <File className="w-8 h-8 text-gray-500" />
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
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [selectedStageId, setSelectedStageId] = useState<string>('none')
  const [previewFile, setPreviewFile] = useState<ProjectFile | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleUpload = async (uploadFiles: FileList | File[]) => {
    if (!uploadFiles || uploadFiles.length === 0) return
    setIsUploading(true)
    setUploadProgress(0)

    try {
      const arr = Array.from(uploadFiles)
      const maxProgressPerFile = 100 / arr.length

      for (let i = 0; i < arr.length; i++) {
        const file = arr[i]

        // Clean filename and generate unique path
        const fileExt = file.name.split('.').pop()
        const randomName = Math.random().toString(36).substring(2) + '-' + Date.now()
        const storagePath = `${userId}/${projectId}/${randomName}.${fileExt}`

        // Upload to Storage
        const { error: storageError } = await supabase.storage
          .from('project-files')
          .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (storageError) {
          console.error('Upload error', storageError)
          alert(t('files.error_upload', { name: file.name }))
          continue
        }

        // Save Metadata
        await addFileRecord(
          projectId,
          file.name,
          storagePath,
          file.type,
          file.size,
          selectedStageId === 'none' ? null : selectedStageId
        )
        setUploadProgress(Math.round(((i + 1) * maxProgressPerFile)))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDownload = async (file: ProjectFile) => {
    const { data, error } = await supabase.storage
      .from('project-files')
      .createSignedUrl(file.storage_path, 60) // valid for 60s

    if (error || !data) {
      alert(t('files.error_download'))
      return
    }

    // Open in new tab which usually triggers download/view
    window.open(data.signedUrl, '_blank')
  }

  const handleUpdateStage = async (fileId: string, stageId: string) => {
    const newStageId = stageId === 'none' ? null : stageId
    try {
      await updateFileStage(projectId, fileId, newStageId)
    } catch (e) {
      console.error(e)
      alert(t('common.error'))
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
      handleUpload(e.dataTransfer.files)
    }
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>{t('files.title')}</CardTitle>
        <CardDescription>{t('files.subtitle')}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-6 flex-1 overflow-visible">
        {/* Dropzone */}
        {canEdit && (
          <div className="space-y-4">
            <div
              className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all ${dragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/30 hover:border-primary/50'
                }`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              <UploadCloud className={`w-10 h-10 mb-3 ${dragActive ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className="text-sm text-center font-medium mb-1">
                {t('files.drag_drop')}
              </p>
              <p className="text-xs text-muted-foreground text-center mb-4">
                {t('files.drag_drop_subtitle')}
              </p>

              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => e.target.files && handleUpload(e.target.files)}
                className="hidden"
                multiple
                accept="image/*,.pdf,.doc,.docx"
              />

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative">
                  <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground opacity-50" />
                  <select
                    value={selectedStageId}
                    onChange={(e) => setSelectedStageId(e.target.value)}
                    className="h-9 w-[180px] pl-8 pr-3 text-xs bg-secondary/30 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer font-medium"
                  >
                    <option value="none">{t('common.none') || "Brak"}</option>
                    {stages.map(stage => (
                      <option key={stage.id} value={stage.id}>{stage.name}</option>
                    ))}
                  </select>
                </div>

                <Button
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="h-9 px-4 text-xs font-bold"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('files.uploading')} {uploadProgress}%
                    </>
                  ) : t('files.select_files')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* File List */}
        <div className="space-y-3 flex-1 overflow-y-auto">
          {files.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground italic">
              {t('files.no_files_details')}
            </div>
          ) : (
            files.map(file => {
              const fileStage = stages.find(s => s.id === file.stage_id);

              return (
                <div key={file.id} className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:shadow-sm transition-all group">
                  {getFileIcon(file.content_type)}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium truncate" title={file.name}>{file.name}</p>
                      {fileStage && (
                        <Badge
                          variant="outline"
                          className="text-[9px] px-1.5 py-0 h-4 font-bold uppercase tracking-tighter bg-primary/5 text-primary border-primary/20 max-w-[125px] truncate"
                          title={fileStage.name}
                        >
                          {fileStage.name}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                      <span>{(file.size_bytes / 1024 / 1024).toFixed(2)} MB</span>
                      <span>•</span>
                      <span>{new Date(file.created_at).toLocaleDateString(locale === 'pl' ? 'pl-PL' : 'en-US')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => setPreviewFile(file)} title={t('common.preview') || "Podgląd"}>
                      <Eye className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDownload(file)} title={t('files.download')}>
                      <Download className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                    </Button>

                    {canEdit && (
                      <div className="flex items-center gap-1">
                        <div className="relative group/select">
                          <Tag className="w-4 h-4 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
                          <select
                            value={file.stage_id || 'none'}
                            onChange={(e) => handleUpdateStage(file.id, e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full"
                          >
                            <option value="none">{t('common.none')}</option>
                            {stages.map(stage => (
                              <option key={stage.id} value={stage.id}>{stage.name}</option>
                            ))}
                          </select>
                        </div>

                        <Button variant="ghost" size="icon" onClick={() => {
                          if (confirm(t('files.delete_confirm'))) {
                            deleteFile(projectId, file.id, file.storage_path)
                          }
                        }} title={t('files.delete')}>
                          <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive transition-colors" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

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
