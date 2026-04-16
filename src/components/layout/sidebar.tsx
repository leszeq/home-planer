'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  FolderKanban,
  Receipt,
  ClipboardList,
  Settings,
  LogOut,
  HardHat,
  ChevronRight,
  FileText,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from '@/app/(auth)/login/actions'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import { LanguageSwitcher } from '@/components/common/language-switcher'

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname()
  const { t } = useTranslation()

  const navItems = [
    { label: t('common.dashboard'), icon: LayoutDashboard, href: '/dashboard' },
    { label: t('common.projects'), icon: FolderKanban, href: '/dashboard/projects' },
    { label: t('common.expenses'), icon: Receipt, href: '/dashboard/expenses' },
    { label: t('common.checklists'), icon: ClipboardList, href: '/dashboard/checklists' },
    { label: t('common.documents'), icon: FileText, href: '/dashboard/documents' },
    { label: t('common.settings'), icon: Settings, href: '/dashboard/settings' },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 pt-7 pb-6 border-b border-[var(--sidebar-border)]">
        <Link href="/dashboard" className="flex items-center gap-3 group" onClick={onLinkClick}>
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-primary shadow-lg group-hover:shadow-[var(--shadow-glow)] transition-shadow">
            <HardHat className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="block text-sm font-bold text-white tracking-wide uppercase leading-none">{t('common.brand_name_1')}</span>
            <span className="block text-[10px] text-[var(--sidebar-muted)] tracking-widest uppercase mt-0.5">{t('common.brand_name_2')}</span>
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
              onClick={onLinkClick}
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

      {/* Footer / Sign out & Language */}
      <div className="px-3 pb-5 pt-3 border-t border-[var(--sidebar-border)] space-y-2">
        <LanguageSwitcher className="bg-[var(--sidebar-accent)]/30 border-none" />
        
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--sidebar-muted)] hover:text-white hover:bg-destructive/20 transition-all group"
          >
            <LogOut className="w-4.5 h-4.5 shrink-0 group-hover:text-destructive" />
            {t('common.logout')}
          </button>
        </form>
      </div>
    </div>
  )
}

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Close drawer on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <>
      {/* Desktop Sidebar — always visible on md+ */}
      <aside className="hidden md:flex flex-col h-screen w-64 sidebar-bg border-r border-[var(--sidebar-border)] flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile: Hamburger trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 flex items-center justify-center w-10 h-10 rounded-xl bg-sidebar border border-[var(--sidebar-border)] shadow-lg text-white"
        aria-label="Otwórz menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile: Backdrop overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile: Slide-in Drawer */}
      <aside
        className={cn(
          'md:hidden fixed top-0 left-0 h-full w-72 z-50 sidebar-bg border-r border-[var(--sidebar-border)] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Close button inside drawer */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-[var(--sidebar-muted)] hover:text-white hover:bg-[var(--sidebar-accent)]/40 transition-colors"
          aria-label="Zamknij menu"
        >
          <X className="w-4 h-4" />
        </button>

        <SidebarContent onLinkClick={() => setIsOpen(false)} />
      </aside>
    </>
  )
}
