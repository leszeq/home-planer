import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ProjectDetailLoading() {
  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" disabled>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <Skeleton className="h-10 w-64" />
        <div className="ml-auto flex items-center gap-2">
            <Skeleton className="h-10 w-32 rounded-xl" />
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="h-24">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-6 w-28" />
                </div>
                <Skeleton className="w-8 h-8 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Timeline Skeleton */}
      <Card className="h-20">
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

      {/* Content Grid Skeleton */}
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-8">
          {/* List Skeleton 1 */}
          <Card className="h-[400px]">
             <CardHeader>
               <Skeleton className="h-6 w-32" />
             </CardHeader>
             <CardContent className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-14 w-full rounded-xl" />
                ))}
             </CardContent>
          </Card>
          {/* List Skeleton 2 */}
          <Card className="h-[300px]">
             <CardHeader>
               <Skeleton className="h-6 w-32" />
             </CardHeader>
             <CardContent className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-12 w-full rounded-xl" />
                ))}
             </CardContent>
          </Card>
        </div>
        <div className="space-y-8">
           {/* Long List Skeleton */}
           <Card className="h-[730px]">
             <CardHeader>
               <Skeleton className="h-6 w-32" />
             </CardHeader>
             <CardContent className="space-y-3">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
