'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FolderKanban, Receipt, Settings, LogOut, Hammer } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { signOut } from '@/app/(auth)/login/actions'

const routes = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  {
    label: 'Projects',
    icon: FolderKanban,
    href: '/dashboard/projects',
  },
  {
    label: 'Expenses',
    icon: Receipt,
    href: '/dashboard/expenses',
  },
  {
    label: 'Settings',
    icon: Settings,
    href: '/dashboard/settings',
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full bg-card border-r w-64">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-x-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <Hammer className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">PLANER</h1>
        </Link>
      </div>
      <div className="flex flex-col flex-1 px-3 space-y-1">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-lg transition",
              pathname === route.href ? "bg-accent text-accent-foreground" : "text-muted-foreground"
            )}
          >
            <div className="flex items-center flex-1">
              <route.icon className={cn("h-5 w-5 mr-3", pathname === route.href ? "text-primary" : "text-muted-foreground")} />
              {route.label}
            </div>
          </Link>
        ))}
      </div>
      <div className="p-3 mt-auto">
        <form action={signOut}>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive" type="submit">
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
          </Button>
        </form>
      </div>
    </div>
  )
}
