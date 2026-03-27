'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UploadCloud, File, FileText, Image as ImageIcon, Trash2, Download, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { addFileRecord, deleteFile } from '@/app/(dashboard)/dashboard/projects/[id]/files/actions'

export interface ProjectFile {
  id: string
  project_id: string
  name: string
  storage_path: string
  content_type: string
  size_bytes: number
  created_at: string
}

function getFileIcon(contentType: string) {
  if (contentType.startsWith('image/')) return <ImageIcon className="w-8 h-8 text-blue-500" />
  if (contentType.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />
  return <File className="w-8 h-8 text-gray-500" />
}

export function FileList({ projectId, userId, files }: { projectId: string; userId: string; files: ProjectFile[] }) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
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
          alert('Błąd podczas przesyłania pliku: ' + file.name)
          continue
        }

        // Save Metadata
        await addFileRecord(projectId, file.name, storagePath, file.type, file.size)
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
      alert('Nie udało się wygenerować linku do pobrania.')
      return
    }
    
    // Open in new tab which usually triggers download/view
    window.open(data.signedUrl, '_blank')
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
        <CardTitle>Pliki i Dokumenty</CardTitle>
        <CardDescription>Paragony, umowy, zdjęcia z budowy</CardDescription>
      </CardHeader>
      
      <CardContent className="flex flex-col gap-6 flex-1">
        {/* Dropzone */}
        <div 
          className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition-all ${
            dragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/30 hover:border-primary/50'
          }`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <UploadCloud className={`w-10 h-10 mb-3 ${dragActive ? 'text-primary' : 'text-muted-foreground'}`} />
          <p className="text-sm text-center font-medium mb-1">
            Przeciągnij i upuść pliki tutaj
          </p>
          <p className="text-xs text-muted-foreground text-center mb-4">
            lub kliknij aby wybrać z dysku (PDF, JPG, PNG)
          </p>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => e.target.files && handleUpload(e.target.files)} 
            className="hidden" 
            multiple 
            accept="image/*,.pdf,.doc,.docx" 
          />
          
          <Button 
            variant="secondary" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Wgrywanie... {uploadProgress}%
              </>
            ) : "Wybierz pliki"}
          </Button>
        </div>

        {/* File List */}
        <div className="space-y-3 mt-2 flex-1 overflow-y-auto">
          {files.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground italic">
              Brak plików. Wgraj pierwszy dokument.
            </div>
          ) : (
            files.map(file => (
              <div key={file.id} className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:shadow-sm transition-all group">
                {getFileIcon(file.content_type)}
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" title={file.name}>{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size_bytes / 1024 / 1024).toFixed(2)} MB • {new Date(file.created_at).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" onClick={() => handleDownload(file)} title="Pobierz">
                    <Download className="w-4 h-4 text-muted-foreground hover:text-primary" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => {
                    if (confirm('Na pewno usunąć ten plik?')) {
                      deleteFile(projectId, file.id, file.storage_path)
                    }
                  }} title="Usuń">
                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
