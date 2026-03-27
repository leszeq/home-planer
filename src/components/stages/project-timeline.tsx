'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CalendarDays } from "lucide-react"
import { differenceInDays, format, isValid, min, max, parseISO } from "date-fns"
import { pl } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface Stage {
  id: string
  name: string
  status: string
  order: number
  start_date?: string | null
  end_date?: string | null
}

export function ProjectTimeline({ stages }: { stages: Stage[] }) {
  // Filter stages with valid dates
  const stagesWithDates = stages.filter(
    (s) => s.start_date && s.end_date && isValid(parseISO(s.start_date)) && isValid(parseISO(s.end_date))
  )

  if (stagesWithDates.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
          <CalendarDays className="w-10 h-10 mb-3 opacity-20" />
          <p className="text-sm font-medium">Brak danych do harmonogramu</p>
          <p className="text-xs mt-1">Dodaj datę rozpoczęcia i zakończenia do etapów budowy.</p>
        </CardContent>
      </Card>
    )
  }

  // Calculate timeline boundaries
  const allDates = stagesWithDates.flatMap((s) => [parseISO(s.start_date!), parseISO(s.end_date!)])
  const timelineStart = min(allDates)
  const timelineEnd = max(allDates)
  const totalDays = Math.max(differenceInDays(timelineEnd, timelineStart), 1)

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50 pb-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              Harmonogram Projektu
            </CardTitle>
            <CardDescription className="mt-1">
              Czas trwania: {totalDays} dni (od {format(timelineStart, 'dd MMM yyyy', { locale: pl })} do {format(timelineEnd, 'dd MMM yyyy', { locale: pl })})
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-4 overflow-x-auto">
          <div className="min-w-[600px] space-y-3 relative">
            {/* Grid lines background (optional) */}
            <div className="absolute inset-0 left-[30%] border-l border-border/50 flex">
               <div className="flex-1 border-r border-border/50 border-dashed opacity-50" />
               <div className="flex-1 border-r border-border/50 border-dashed opacity-50" />
               <div className="flex-1 border-r border-border/50 opacity-50" />
            </div>

            {stagesWithDates.sort((a, b) => parseISO(a.start_date!).getTime() - parseISO(b.start_date!).getTime()).map((stage, idx) => {
              const start = parseISO(stage.start_date!)
              const end = parseISO(stage.end_date!)
              
              const startOffset = differenceInDays(start, timelineStart)
              const duration = Math.max(differenceInDays(end, start), 1)
              
              const leftPercent = (startOffset / totalDays) * 100
              const widthPercent = (duration / totalDays) * 100

              return (
                <div key={stage.id} className="flex items-center relative z-10 text-sm group">
                  <div className="w-[30%] pr-4 flex-shrink-0">
                    <p className={cn("truncate font-medium text-xs md:text-sm", stage.status === 'done' ? 'text-muted-foreground line-through' : 'text-foreground')}>
                      {stage.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {format(start, 'd MMM')} - {format(end, 'd MMM')}
                    </p>
                  </div>
                  <div className="w-[70%] relative h-8 rounded-md bg-secondary/30 flex items-center">
                    <div
                      className={cn(
                        "absolute h-6 rounded-md shadow-sm transition-all duration-300 group-hover:opacity-90",
                        stage.status === 'done' 
                          ? 'bg-neutral-500' 
                          : stage.status === 'in_progress' 
                            ? 'bg-primary' 
                            : 'bg-primary/50'
                      )}
                      style={{
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                        minWidth: '4px'
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
