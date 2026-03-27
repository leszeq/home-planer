'use client'

import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"

export function PrintButton() {
  return (
    <Button 
      variant="outline" 
      onClick={() => window.print()}
      className="hidden sm:flex print:hidden bg-background"
    >
      <FileText className="w-4 h-4 mr-2" />
      Eksportuj PDF
    </Button>
  )
}
