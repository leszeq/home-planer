'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2, AlertTriangle, X } from 'lucide-react'
import { deleteProject } from '@/app/(dashboard)/dashboard/projects/[id]/actions'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

export function DeleteProjectButton({ projectId, isShared }: { projectId: string, isShared: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  if (isShared) return null

  const handleDelete = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsDeleting(true)
    
    const result = await deleteProject(projectId)
    if (result && result.error) {
       setIsDeleting(false)
       alert(result.error)
       setIsOpen(false)
       return
    }

    router.push('/dashboard/projects')
  }

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(true)
  }

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(false)
  }

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon"
        className="hidden sm:flex print:hidden relative z-20 w-8 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        onClick={handleOpen}
        title="Usuń projekt"
      >
        <Trash2 className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-destructive/20 shadow-2xl shadow-destructive/10 animate-fade-in relative z-50 overflow-hidden">
            <CardHeader className="relative pb-4 border-b bg-destructive/5 text-destructive">
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-4 top-4 opacity-70 hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                onClick={handleClose}
                disabled={isDeleting}
              >
                <X className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-destructive/20 rounded-full">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Usuwanie Projektu</CardTitle>
                  <CardDescription className="text-destructive/70 mt-1">Tej akcji nie można cofnąć</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm font-medium mb-3">
                Czy na pewno chcesz usunąć ten projekt? Usunięte zostaną bezpowrotnie wszystkie:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground ml-2">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-destructive/50" /> Etapy budowy i harmonogram</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-destructive/50" /> Wpisy wydatków z budżetu</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-destructive/50" /> Listy zadań i "to-do"</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-destructive/50" /> Załączone dokumenty i zdjęcia</li>
              </ul>
            </CardContent>
            <CardFooter className="flex gap-3 justify-end border-t pt-4 bg-muted/20">
              <Button variant="outline" onClick={handleClose} disabled={isDeleting}>
                Anuluj
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                Tak, usuń trwale
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  )
}
