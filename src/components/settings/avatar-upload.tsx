'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { User, Camera, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useTranslation } from '@/lib/i18n/LanguageContext'

import { toast } from 'sonner'

interface AvatarUploadProps {
  uid: string
  url: string | null
  onUpload: (url: string) => void
}

export function AvatarUpload({ uid, url, onUpload }: AvatarUploadProps) {
  const { t } = useTranslation()
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    const toastId = toast.loading(t('settings.profile.uploading') || 'Przesyłanie...')
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error(t('settings.profile.errors.select_image'))
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `${uid}/${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
      onUpload(data.publicUrl)
      toast.success(t('settings.profile.success.upload_success') || 'Zdjęcie zostało zaktualizowane!', { id: toastId })
    } catch (error: any) {
      toast.error(error.message || t('settings.profile.errors.upload_failed'), { id: toastId })
      console.error('Upload Error:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-6 mb-8 group">
      <div className="relative w-24 h-24 rounded-2xl bg-secondary overflow-hidden border-2 border-border/50 group-hover:border-primary/50 transition-all shadow-lg">
        {url ? (
          <Image
            src={url}
            alt="Avatar"
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <User className="w-10 h-10 opacity-30" />
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}
      </div>

      <div>
        <h4 className="font-semibold text-foreground mb-1">{t('settings.profile.photo_title')}</h4>
        <p className="text-sm text-muted-foreground mb-3">{t('settings.profile.photo_desc')}</p>
        <div className="relative">
          <input
            type="file"
            id="avatar"
            accept="image/*"
            className="hidden"
            onChange={uploadAvatar}
            disabled={uploading}
          />
          <label htmlFor="avatar">
            <Button 
                type="button" 
                variant="outline" 
                className="cursor-pointer h-9 px-4 text-sm"
                asChild
            >
              <span>
                <Camera className="w-4 h-4 mr-2" />
                {t('settings.profile.change_photo')}
              </span>
            </Button>
          </label>
        </div>
      </div>
    </div>
  )
}
