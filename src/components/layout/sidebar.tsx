'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FolderKanban,
  Receipt,
  ClipboardList,
  Settings,
  LogOut,
  HardHat,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from '@/app/(auth)/login/actions'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Projekty', icon: FolderKanban, href: '/dashboard/projects' },
  { label: 'Wydatki', icon: Receipt, href: '/dashboard/expenses' },
  { label: 'Checklisty', icon: ClipboardList, href: '/dashboard/checklists' },
  { label: 'Ustawienia', icon: Settings, href: '/dashboard/settings' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex flex-col h-screen w-64 sidebar-bg border-r border-[var(--sidebar-border)] flex-shrink-0">
      {/* Logo */}
      <div className="px-5 pt-7 pb-6 border-b border-[var(--sidebar-border)]">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-primary shadow-lg group-hover:shadow-[var(--shadow-glow)] transition-shadow">
            <HardHat className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="block text-sm font-bold text-white tracking-wide uppercase leading-none">Planer</span>
            <span className="block text-[10px] text-[var(--sidebar-muted)] tracking-widest uppercase mt-0.5">Budowy</span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item, i) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{ animationDelay: `${i * 60}ms` }}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group animate-fade-in-up',
                isActive
                  ? 'bg-[var(--sidebar-accent)] text-white'
                  : 'text-[var(--sidebar-muted)] hover:text-white hover:bg-[var(--sidebar-accent)]/60'
              )}
            >
              <item.icon className={cn('w-4.5 h-4.5 shrink-0', isActive ? 'text-primary' : 'text-[var(--sidebar-muted)] group-hover:text-white')} />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-primary opacity-70" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer / Sign out */}
      <div className="px-3 pb-5 pt-3 border-t border-[var(--sidebar-border)]">
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--sidebar-muted)] hover:text-white hover:bg-destructive/20 transition-all group"
          >
            <LogOut className="w-4.5 h-4.5 shrink-0 group-hover:text-destructive" />
            Wyloguj się
          </button>
        </form>
      </div>
    </aside>
  )
}
