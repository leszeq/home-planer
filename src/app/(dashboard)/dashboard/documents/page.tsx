'use client'

import { useState } from 'react'
import { FileText, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DOCUMENT_TEMPLATES, DocumentTemplate } from '@/lib/document-templates'
import { cn } from '@/lib/utils'

function DocumentCard({ template }: { template: DocumentTemplate }) {
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
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Treść wzoru</h4>
              <Button 
                variant={isCopied ? "primary" : "outline"} 
                size="sm" 
                onClick={handleCopy}
                className={cn("h-8 gap-2", isCopied && "bg-[var(--accent-green)] hover:bg-[var(--accent-green)]")}
              >
                {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {isCopied ? 'Skopiowano' : 'Kopiuj treść'}
              </Button>
            </div>
            
            <div className="bg-secondary/30 rounded-xl p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground border border-border/50">
              {template.content.trim()}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export default function DocumentsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-fade-in-up">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Wzory Umów 📝</h2>
        <p className="text-muted-foreground mt-2 text-lg">
          Gotowe szablony dokumentów i umów budowlanych. Skopiuj treść, uzupełnij swoje dane i podpisz z wykonawcą.
        </p>
      </div>

      <div className="grid gap-4">
        {DOCUMENT_TEMPLATES.map(template => (
          <DocumentCard key={template.id} template={template} />
        ))}
      </div>
    </div>
  )
}
