'use client'

import Link from "next/link"
import { HardHat, ArrowRight, LayoutDashboard, Folders, CheckCircle2, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n/LanguageContext"
import { LanguageSwitcher } from "@/components/common/language-switcher"

export function LandingClientView({ user }: { user: any }) {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-primary shadow-lg group-hover:shadow-primary/40 transition-shadow">
              <HardHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="block text-sm font-bold text-foreground tracking-wide uppercase leading-none">{t('common.brand_name_1')}</span>
              <span className="block text-[10px] text-muted-foreground tracking-widest uppercase mt-0.5">{t('common.brand_name_2')}</span>
            </div>
          </Link>

          <div>
            {user ? (
              <div className="flex items-center gap-4">
                <LanguageSwitcher />
                <Link href="/dashboard">
                  <Button variant="glow" size="sm" className="gap-2">
                    {t('landing.nav.dashboard_link')} <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            ) : (
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-4">
                    <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                      {t('landing.nav.login_link')}
                    </Link>
                    <Link href="/login?mode=register">
                      <Button variant="glow" size="sm">{t('landing.nav.get_started')}</Button>
                    </Link>
                  </div>
                  <div className="h-4 w-[1px] bg-border/40 hidden md:block" />
                  <LanguageSwitcher />
                </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        {/* Abstract Background Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] -z-10" />

        <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 border border-primary/20">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            {t('landing.hero.badge')}
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            {t('landing.hero.title')} <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
              {t('landing.hero.accent')}
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            {t('landing.hero.description')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={user ? "/dashboard" : "/login?mode=register"}>
              <Button variant="glow" size="lg" className="h-14 px-8 text-base w-full sm:w-auto">
                {user ? t('landing.hero.dashboard_back') : t('landing.hero.cta_primary')}
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="h-14 px-8 text-base w-full sm:w-auto bg-background/50 backdrop-blur-sm">
                {t('landing.hero.cta_secondary')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Dashboard Preview / Mockup */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="relative rounded-2xl md:rounded-[2rem] border border-border/50 bg-card/40 backdrop-blur-xl p-2 md:p-6 shadow-2xl shadow-primary/5 overflow-hidden ring-1 ring-white/10">
            {/* Fake macOS Window Buttons */}
            <div className="absolute top-4 left-6 flex gap-2 hidden md:flex">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            
            <div className="bg-background rounded-xl md:rounded-2xl border border-border/50 overflow-hidden shadow-inner h-[400px] md:h-[600px] w-full relative">
              <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-[240px_1fr] h-full">
                <div className="hidden md:block border-r border-border/50 bg-card/50 p-4">
                  <div className="h-8 w-24 bg-primary/20 rounded mb-8"></div>
                  <div className="space-y-3">
                    <div className="h-6 w-3/4 bg-border/50 rounded"></div>
                    <div className="h-6 w-full bg-primary/10 rounded"></div>
                    <div className="h-6 w-5/6 bg-border/50 rounded"></div>
                    <div className="h-6 w-4/6 bg-border/50 rounded"></div>
                  </div>
                </div>
                <div className="p-6 md:p-10 flex flex-col gap-6">
                  <div className="h-10 w-48 bg-border/50 rounded"></div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="h-24 bg-card border border-border/50 rounded-xl"></div>
                    <div className="h-24 bg-card border border-border/50 rounded-xl hidden md:block"></div>
                    <div className="h-24 bg-card border border-border/50 rounded-xl hidden md:block"></div>
                    <div className="h-24 bg-orange-500/20 border border-orange-500/30 rounded-xl"></div>
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-card border border-border/50 rounded-xl p-4">
                      <div className="h-6 w-32 bg-border/50 rounded mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-12 bg-border/30 rounded-lg"></div>
                        <div className="h-12 bg-background border border-primary/30 rounded-lg lg:scale-105 transition-transform shadow-[var(--shadow-glow)] relative z-10"></div>
                        <div className="h-12 bg-border/30 rounded-lg"></div>
                      </div>
                    </div>
                    <div className="bg-card border border-border/50 rounded-xl p-4 hidden md:block">
                      <div className="h-6 w-32 bg-border/50 rounded mb-4"></div>
                      <div className="w-full h-48 rounded-full border-[20px] border-primary/20 relative mt-8">
                         <div className="absolute inset-0 rounded-full border-[20px] border-primary" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section id="features" className="py-24 px-6 bg-secondary/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">{t('landing.features.title')}</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t('landing.features.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(250px,auto)]">
            
            {/* Feature 1 - Large */}
            <div className="md:col-span-2 bg-card border border-border/50 rounded-3xl p-8 md:p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors" />
              <TrendingDown className="w-12 h-12 text-primary mb-6" />
              <h3 className="text-2xl font-bold mb-3">{t('landing.features.budget_title')}</h3>
              <p className="text-muted-foreground max-w-md">{t('landing.features.budget_desc')}</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card border border-border/50 rounded-3xl p-8 relative overflow-hidden group">
              <CheckCircle2 className="w-10 h-10 text-[var(--accent-green)] mb-6" />
              <h3 className="text-xl font-bold mb-3">{t('landing.features.checklists_title')}</h3>
              <p className="text-muted-foreground text-sm">{t('landing.features.checklists_desc')}</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card border border-border/50 rounded-3xl p-8 relative overflow-hidden">
              <LayoutDashboard className="w-10 h-10 text-orange-400 mb-6" />
              <h3 className="text-xl font-bold mb-3">{t('landing.features.timeline_title')}</h3>
              <p className="text-muted-foreground text-sm">{t('landing.features.timeline_desc')}</p>
            </div>

            {/* Feature 4 - Large */}
            <div className="md:col-span-2 bg-card border border-border/50 rounded-3xl p-8 md:p-10 relative overflow-hidden group">
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors" />
              <Folders className="w-12 h-12 text-blue-500 mb-6" />
              <h3 className="text-2xl font-bold mb-3">{t('landing.features.files_title')}</h3>
              <p className="text-muted-foreground max-w-md">{t('landing.features.files_desc')}</p>
            </div>
            
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-24 px-6 border-t border-border/50 relative overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-primary/10 rounded-t-full blur-[100px] -z-10" />
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">
            {t('landing.cta.title')}<br/> 
            <span className="text-muted-foreground text-3xl">{t('landing.cta.subtitle')}</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-10">{t('landing.cta.description')}</p>
          <Link href="/login?mode=register">
            <Button variant="glow" size="lg" className="h-14 px-10 text-lg">
              {t('landing.cta.button')}
            </Button>
          </Link>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-8 px-6 border-t border-border/20 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-2">
          <HardHat className="w-4 h-4" />
          <span className="font-bold tracking-wider uppercase">Planer Budowy</span>
        </div>
        <p>© {new Date().getFullYear()} {t('landing.footer.rights')}</p>
      </footer>
    </div>
  )
}
