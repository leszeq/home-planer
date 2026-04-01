'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import { ActionResponse } from '@/lib/types/actions'

interface UseFileUploadOptions {
  userId: string
  onSuccess?: () => void
  maxSizeMB?: number
  storageBucket?: string
}

export function useFileUpload({ 
  userId, 
  onSuccess, 
  maxSizeMB = 50,
  storageBucket = 'project-files'
}: UseFileUploadOptions) {
  const { t } = useTranslation()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const supabase = createClient()

  const uploadFiles = async (
    files: FileList | File[], 
    saveRecord: (file: File, storagePath: string) => Promise<ActionResponse>,
    customStoragePathPrefix?: string
  ) => {
    if (!files || files.length === 0) return
    
    setIsUploading(true)
    setUploadProgress(0)
    const toastId = toast.loading(t('files.uploading') || 'Przesyłanie...')

    try {
      const fileArray = Array.from(files)
      
      // 1. Validation
      for (const file of fileArray) {
        if (file.size > maxSizeMB * 1024 * 1024) {
          throw new Error(t('files.error_too_large', { name: file.name, size: maxSizeMB }) || `Plik ${file.name} jest za duży (max ${maxSizeMB}MB)`)
        }
      }

      const maxProgressPerFile = 100 / fileArray.length

      // 2. Process uploads
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i]
        const fileExt = file.name.split('.').pop()
        const randomName = Math.random().toString(36).substring(2) + '-' + Date.now()
        
        // Dynamic path based on prefix or default
        const storagePath = customStoragePathPrefix 
          ? `${customStoragePathPrefix}/${randomName}.${fileExt}`
          : `${userId}/${randomName}.${fileExt}`

        // Upload to Storage
        const { error: storageError } = await supabase.storage
          .from(storageBucket)
          .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (storageError) throw storageError

        // Save Metadata via provided callback
        const response = await saveRecord(file, storagePath)

        if (!response.success) {
          // Cleanup storage if DB save fails
          await supabase.storage.from(storageBucket).remove([storagePath])
          throw new Error(response.error)
        }

        setUploadProgress(Math.round(((i + 1) * maxProgressPerFile)))
      }

      toast.success(t('common.success') || 'Pomyślnie przesłano pliki', { id: toastId })
      if (onSuccess) onSuccess()
      
      return { success: true }
    } catch (error: any) {
      console.error('Upload hook error:', error)
      toast.error(error.message || t('common.error'), { id: toastId })
      return { success: false, error: error.message }
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return {
    uploadFiles,
    isUploading,
    uploadProgress
  }
}
