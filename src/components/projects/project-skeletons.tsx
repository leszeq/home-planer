import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function StatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-skeleton-lazy">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="h-24">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function TimelineSkeleton() {
  return (
    <Card className="h-20 animate-skeleton-lazy">
      <CardContent className="h-full flex items-center px-6">
        <div className="flex-1 flex items-center gap-2">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="flex-1 flex items-center gap-2">
              <Skeleton className="h-2 w-full rounded-full" />
              <Skeleton className="h-4 w-4 rounded-full shrink-0" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function ListSkeleton({ title, height = "h-[400px]", items = 4 }: { title?: string, height?: string, items?: number }) {
  return (
    <Card className={cn("overflow-hidden border-border/50 animate-skeleton-lazy", height)}>
      <CardHeader className="pb-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48 mt-1 opacity-50" />
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: items }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-3 rounded-xl border border-border/20">
            <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2 opacity-50" />
            </div>
            <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function GridSkeleton({ items = 6 }: { items?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-skeleton-lazy">
      {Array.from({ length: items }).map((_, i) => (
        <Card key={i} className="h-[200px] border-border/40 overflow-hidden group">
          <CardHeader className="pb-3 bg-muted/20">
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2 opacity-50" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
             <div className="space-y-2">
                <div className="flex justify-between text-xs mb-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-10" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
             </div>
             <div className="flex justify-between items-center pt-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
             </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <Card className="border-border/40 overflow-hidden shadow-sm animate-skeleton-lazy">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
           <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48 opacity-50" />
           </div>
           <div className="flex gap-2">
              <Skeleton className="h-9 w-32 rounded-xl" />
              <Skeleton className="h-9 w-24 rounded-xl" />
           </div>
        </div>
        <div className="mt-4 flex gap-3">
           <Skeleton className="h-9 flex-1 rounded-lg" />
           <Skeleton className="h-9 w-40 rounded-lg" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="border-t">
          <div className="bg-muted/30 p-4 flex gap-4">
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-4 flex-1" />)}
          </div>
          <div className="divide-y divide-border/40">
            {Array.from({ length: rows }).map((_, i) => (
              <div key={i} className="p-4 flex gap-4 items-center">
                <Skeleton className="h-4 w-4 rounded shrink-0" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function SettingsSkeleton() {
  return (
    <div className="flex flex-col md:flex-row gap-8 animate-skeleton-lazy">
      <aside className="w-full md:w-64 space-y-1">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </aside>
      <main className="flex-1 space-y-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72 opacity-50" />
          </CardHeader>
          <CardContent className="space-y-6 pt-2">
             <div className="flex items-center gap-6 pb-6 border-b">
                <Skeleton className="h-20 w-20 rounded-full shrink-0" />
                <div className="space-y-2">
                   <Skeleton className="h-8 w-32" />
                   <Skeleton className="h-4 w-48 opacity-50" />
                </div>
             </div>
             <div className="grid gap-6 sm:grid-cols-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                ))}
             </div>
             <div className="flex justify-end pt-4">
                <Skeleton className="h-10 w-32 rounded-xl" />
             </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-8 animate-skeleton-lazy">
      {/* Stats Grid Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="h-28">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-7 w-28" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="w-10 h-10 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts & Projects Row Skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="h-[350px]">
          <CardHeader>
            <Skeleton className="h-5 w-40 mb-1" />
            <Skeleton className="h-4 w-32 opacity-50" />
          </CardHeader>
          <CardContent className="flex items-center justify-center h-full pb-12">
            <div className="relative w-48 h-48 rounded-full border-8 border-secondary animate-pulse flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card className="h-[350px]">
          <CardHeader>
            <Skeleton className="h-5 w-40 mb-1" />
            <Skeleton className="h-4 w-32 opacity-50" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3 rounded-xl border border-border/30 flex items-center gap-3">
                <Skeleton className="w-2 h-8 rounded-full opacity-30" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2 opacity-30" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function GenericModuleSkeleton() {
  return (
    <div className="space-y-8 animate-skeleton-lazy">
       <div className="flex flex-col md:flex-row gap-6 justify-between">
          <div className="space-y-2">
             <Skeleton className="h-9 w-48" />
             <Skeleton className="h-5 w-72 opacity-50" />
          </div>
          <Skeleton className="h-10 w-32 rounded-xl" />
       </div>
       <Card className="border-border/30 h-[400px]">
          <CardContent className="h-full flex items-center justify-center">
             <div className="space-y-4 w-full max-w-md px-10">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-5/6 opacity-50" />
                <Skeleton className="h-8 w-4/6 opacity-30" />
             </div>
          </CardContent>
       </Card>
    </div>
  )
}

export function ChecklistLoadingSkeleton({ items = 4 }: { items?: number }) {
  return (
    <div className="space-y-4 animate-skeleton-lazy">
      {/* Search/Filter Bar Skeleton */}
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-8 w-32 rounded-lg" />
        <div className="h-5 w-px bg-border/40" />
        <Skeleton className="h-7 w-20 rounded-full" />
        <Skeleton className="h-7 w-24 rounded-full opacity-50" />
        <Skeleton className="h-7 w-20 rounded-full opacity-30" />
      </div>

      {/* Banner Skeleton */}
      <div className="p-4 bg-muted/20 border border-border/20 rounded-xl flex gap-3">
        <Skeleton className="h-5 w-5 rounded-full shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-full opacity-50" />
        </div>
      </div>

      {/* Checklist Cards */}
      <div className="space-y-3">
        {Array.from({ length: items }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center gap-2 ml-1">
              <Skeleton className="h-3 w-3 rounded opacity-30" />
              <Skeleton className="h-3 w-16 opacity-30" />
            </div>
            <Card className="border-border/30 overflow-hidden shadow-sm">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton className="h-5 w-5 rounded opacity-20" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex gap-2">
                        <Skeleton className="h-2 w-16 opacity-40" />
                        <Skeleton className="h-2 w-12 opacity-40" />
                    </div>
                  </div>
                </div>
                <Skeleton className="h-8 w-8 rounded-lg opacity-20" />
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}

export function PageHeaderSkeleton() {
  return (
    <div className="animate-skeleton-lazy">
      <Skeleton className="h-9 w-48 mb-2" />
      <Skeleton className="h-5 w-72 opacity-50" />
    </div>
  )
}

import { cn } from "@/lib/utils"
