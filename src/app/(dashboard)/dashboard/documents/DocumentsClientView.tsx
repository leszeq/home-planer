'use client'

import { useState } from 'react'
import { FileText, Copy, Check, ChevronDown, ChevronUp, FolderOpen, LayoutTemplate } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import { cn } from '@/lib/utils'
import { DocumentList, Document } from '@/components/documents/document-list'
import { UploadDocumentModal } from '@/components/documents/upload-document-modal'
import { DocumentTemplate } from '@/lib/document-templates'

interface DocumentsClientViewProps {
  initialDocuments: Document[]
  templates: DocumentTemplate[]
  projects: { id: string, name: string }[]
}

function TemplateCard({ template }: { template: DocumentTemplate }) {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(template.content.trim())
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text', err)
    }
  }

  return (
    <Card className={cn("transition-all duration-200", isExpanded && "ring-1 ring-primary/20 shadow-md")}>
      <div 
        className="cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{template.title}</CardTitle>
                <CardDescription className="mt-1">{template.description}</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="shrink-0 group">
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
              )}
            </Button>
          </div>
        </CardHeader>
      </div>
      
      {isExpanded && (
        <CardContent className="pt-0 pb-6">
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t('documents.template_content_label')}</h4>
              <Button 
                variant={isCopied ? "primary" : "outline"} 
                size="sm" 
                onClick={(e) => { e.stopPropagation(); handleCopy(); }}
                className={cn("h-8 gap-2", isCopied && "bg-green-600 hover:bg-green-600")}
              >
                {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {isCopied ? t('documents.copied') : t('documents.copy_content')}
              </Button>
            </div>
            
            <div className="bg-secondary/30 rounded-xl p-6 font-mono text-xs leading-relaxed whitespace-pre-wrap text-muted-foreground border border-border/50">
              {template.content.trim()}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export function DocumentsClientView({ initialDocuments, templates, projects }: DocumentsClientViewProps) {
  const { t } = useTranslation()
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all')

  const filteredDocuments = initialDocuments.filter(doc => 
    selectedProjectId === 'all' || doc.project_id === selectedProjectId
  )
  
  const projectNames = projects.reduce((acc, p) => ({ ...acc, [p.id]: p.name }), {})

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex-1">
          <h2 className="text-4xl font-extrabold tracking-tight">{t('documents.page_title')}</h2>
          <p className="text-muted-foreground mt-2 text-lg max-w-2xl">
            {t('documents.page_subtitle')}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-xl border w-full sm:w-auto">
            <span className="text-xs font-semibold px-3 uppercase text-muted-foreground hidden sm:inline-block">
              {t('dashboard.filter')}
            </span>
            <select 
              className="bg-transparent text-sm font-medium focus:outline-none p-1.5 min-w-[160px]"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              <option value="all">{t('documents.filter_all_projects')}</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <UploadDocumentModal />
        </div>
      </div>

      <Tabs defaultValue="my-documents" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md bg-muted/50 p-1 rounded-xl border">
          <TabsTrigger value="my-documents" className="rounded-lg gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <FolderOpen className="w-4 h-4" />
            {t('documents.tab_my_documents')}
          </TabsTrigger>
          <TabsTrigger value="templates" className="rounded-lg gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <LayoutTemplate className="w-4 h-4" />
            {t('documents.tab_templates')}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="my-documents" className="mt-8">
          <DocumentList 
            documents={filteredDocuments} 
            projectNames={projectNames} 
          />
        </TabsContent>
        
        <TabsContent value="templates" className="mt-8">
          <div className="grid gap-4">
            {templates.map(template => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
