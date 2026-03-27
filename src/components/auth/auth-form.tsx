'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { login, signup, loginWithMagicLink } from '@/app/(auth)/login/actions'
import { Mail, KeyRound, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

type AuthMode = 'login' | 'register' | 'magiclink'

export function AuthForm({ initialMode = 'login', error, message }: { initialMode?: AuthMode, error?: string, message?: string }) {
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setIsLoading(true)
    // Server actions redirect on finish, so if it resolves quickly or errors out,
    // we should leave isLoading true until the redirect or reset if an error comes back.
  }

  return (
    <div className="w-full">
      {/* Mode Tabs */}
      <div className="flex bg-secondary/30 rounded-full p-1 mb-8 border border-border/50">
        <button
          onClick={() => setMode('login')}
          className={cn(
            "flex-1 text-sm font-medium py-2 rounded-full transition-all duration-200",
            mode === 'login' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Zaloguj się
        </button>
        <button
          onClick={() => setMode('register')}
          className={cn(
            "flex-1 text-sm font-medium py-2 rounded-full transition-all duration-200",
            mode === 'register' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Zarejestruj się
        </button>
      </div>

      <div className="space-y-6">
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold tracking-tight">
            {mode === 'login' && 'Witamy z powrotem'}
            {mode === 'register' && 'Załóż darmowe konto'}
            {mode === 'magiclink' && 'Zaloguj się bez hasła'}
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            {mode === 'login' && 'Wprowadź swoje dane, aby uzyskać dostęp do panelu.'}
            {mode === 'register' && 'Dołącz do setek inwestorów, którzy kontrolują swoje budowy.'}
            {mode === 'magiclink' && 'Wpisz email, a otrzymasz bezpieczny link do jednorazowego logowania.'}
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm font-medium bg-destructive/10 text-destructive border border-destructive/20 rounded-lg">
            {error}
          </div>
        )}
        {message && (
          <div className="p-3 text-sm font-medium bg-[var(--accent-green)]/10 text-[var(--accent-green)] border border-[var(--accent-green)]/20 rounded-lg">
            {message}
          </div>
        )}

        <form action={mode === 'login' ? login : mode === 'register' ? signup : loginWithMagicLink} onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="email"
                type="email"
                placeholder="Adres e-mail"
                required
                className="pl-10 h-11"
              />
            </div>

            {mode !== 'magiclink' && (
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Hasło"
                  required
                  className="pl-10 pr-10 h-11"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>

          <Button type="submit" variant="glow" className="w-full h-11 text-base group">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <>
                {mode === 'login' ? 'Zaloguj się' : mode === 'register' ? 'Utwórz konto' : 'Wyślij link'}
                <ArrowRight className="w-4 h-4 ml-2 opacity-70 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </form>

        <div className="pt-4 text-center">
          {mode === 'magiclink' ? (
            <button onClick={() => setMode('login')} className="text-sm text-primary hover:underline">
              Wróć do logowania z hasłem
            </button>
          ) : (
             <button onClick={() => setMode('magiclink')} className="text-sm text-muted-foreground hover:text-foreground">
              Zapomniałeś hasła? Zaloguj się jednorazowym linkiem.
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
