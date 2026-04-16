'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FolderKanban,
  Receipt,
  ClipboardList,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n/LanguageContext'

export function MobileBottomNav() {
  const pathname = usePathname()
  const { t } = useTranslation()

  const navItems = [
    { label: t('common.dashboard'), icon: LayoutDashboard, href: '/dashboard' },
    { label: t('common.projects'), icon: FolderKanban, href: '/dashboard/projects' },
    { label: t('common.expenses'), icon: Receipt, href: '/dashboard/expenses' },
    { label: t('common.checklists'), icon: ClipboardList, href: '/dashboard/checklists' },
    { label: t('common.documents'), icon: FileText, href: '/dashboard/documents' },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-stretch bg-sidebar border-t border-[var(--sidebar-border)] shadow-[0_-4px_24px_rgba(0,0,0,0.25)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center flex-1 py-2 gap-1 text-[10px] font-semibold tracking-wide uppercase transition-colors',
              isActive
                ? 'text-primary'
                : 'text-[var(--sidebar-muted)] hover:text-white'
            )}
          >
            <item.icon className={cn('w-5 h-5', isActive && 'text-primary')} />
            <span className="leading-none">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
