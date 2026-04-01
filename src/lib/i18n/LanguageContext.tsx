'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { pl } from './locales/pl'
import { en } from './locales/en'

type Locale = 'pl' | 'en'
// Use any to prevent rigid build-time errors when a key is missing in one file.
// The code already has a runtime fallback to PL.
type Translations = any 

const translations: Record<Locale, Translations> = {
  pl,
  en
}

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, variables?: Record<string, string | number>) => any
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('pl')
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    const savedLocale = localStorage.getItem('app-locale') as Locale
    if (savedLocale && (savedLocale === 'pl' || savedLocale === 'en')) {
      setLocaleState(savedLocale)
    }
    setIsMounted(true)
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('app-locale', newLocale)
    document.documentElement.lang = newLocale
  }

  const t = (keyPath: string, variables?: Record<string, string | number>): any => {
    const keys = keyPath.split('.')
    let current: any = translations[locale]

    for (const key of keys) {
      if (current[key] === undefined) {
        // Fallback to Polish if English key is missing
        let fallback = (translations['pl'] as any)
        for (const k of keys) {
          if (fallback[k] === undefined) return keyPath
          fallback = fallback[k]
        }
        current = fallback
        break 
      }
      current = current[key]
    }

    if (typeof current !== 'string' && !Array.isArray(current)) return keyPath

    if (Array.isArray(current)) return current

    if (variables) {
      let result = current
      Object.entries(variables).forEach(([key, value]) => {
        result = result.replace(`{${key}}`, String(value))
      })
      return result
    }

    return current
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider')
  }
  return context
}
