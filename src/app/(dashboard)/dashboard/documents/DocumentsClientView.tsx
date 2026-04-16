'use client'

import { useState } from 'react'
import { FileText, Copy, Check, ChevronDown, ChevronUp, FolderOpen, LayoutTemplate, Filter, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import { cn } from '@/lib/utils'
import { DocumentList, Document } from '@/components/documents/document-list'
import { UploadDocumentModal } from '@/components/documents/upload-document-modal'
import { DocumentTemplate } from '@/lib/document-templates'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DocumentsClientViewProps {
  initialDocuments: Document[]
  templates: DocumentTemplate[]
  projects: { id: string, name: string }[]
  hideHeader?: boolean
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

export function DocumentsClientView({ 
  initialDocuments, 
  templates, 
  projects,
  hideHeader = false 
}: DocumentsClientViewProps) {
  const { t } = useTranslation()
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const projectNames = projects.reduce((acc, p) => ({ ...acc, [p.id]: p.name }), {} as Record<string, string>)

  const filteredDocuments = initialDocuments.filter(doc => {
    const matchesProject = selectedProjectId === 'all' || doc.project_id === selectedProjectId
    const q = searchQuery.toLowerCase()
    const matchesSearch = !q ||
      doc.name.toLowerCase().includes(q) ||
      (doc.project_id && projectNames[doc.project_id]?.toLowerCase().includes(q)) ||
      doc.type.toLowerCase().includes(q) ||
      doc.status.toLowerCase().includes(q)
    return matchesProject && matchesSearch
  })

  const filteredTemplates = templates.filter(template => {
    const q = searchQuery.toLowerCase()
    return !q ||
      template.title.toLowerCase().includes(q) ||
      template.description.toLowerCase().includes(q)
  })

  return (
    <div className={cn("max-w-5xl mx-auto space-y-8 pb-12 animate-fade-in")}>
      {!hideHeader && (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <h2 className="text-4xl font-extrabold tracking-tight">{t('documents.page_title')}</h2>
            <p className="text-muted-foreground mt-2 text-lg max-w-2xl">
              {t('documents.page_subtitle')}
            </p>
          </div>
        </div>
      )}

      {/* Unified Filter Bar — matches /dashboard/expenses and /dashboard/checklists */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-card p-4 rounded-xl border border-border/50 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Szukaj dokumentu…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-secondary/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground hidden sm:inline-block">
              {t('dashboard.filter')}
            </span>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger className="w-full sm:w-[200px] h-10 rounded-lg font-medium bg-background">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 opacity-50" />
                  <SelectValue placeholder={t('documents.filter_all_projects')} />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('documents.filter_all_projects')}</SelectItem>
                {projects.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          {filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-xl bg-muted/5">
              <FileText className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground text-sm">Brak szablonów pasujących do wyszukiwania.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredTemplates.map(template => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
