'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  return redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const origin = (await headers()).get('origin')

  if (password.length < 8) {
    return redirect(`/login?error=${encodeURIComponent('Hasło musi mieć co najmniej 8 znaków.')}&mode=register`)
  }
  if (!/\d/.test(password)) {
    return redirect(`/login?error=${encodeURIComponent('Hasło musi zawierać co najmniej jedną cyfrę.')}&mode=register`)
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return redirect(`/login?error=${encodeURIComponent('Hasło musi zawierać co najmniej jeden znak specjalny.')}&mode=register`)
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return redirect(`/login?error=${encodeURIComponent(error.message)}&mode=register`)
  }

  return redirect(`/login?message=${encodeURIComponent('Potwierdź swój adres email, aby się zalogować.')}&mode=login`)
}

export async function loginWithMagicLink(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const origin = (await headers()).get('origin')

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return redirect(`/login?error=${encodeURIComponent(error.message)}&mode=magiclink`)
  }

  return redirect(`/login?message=${encodeURIComponent('Link logowania został wysłany na Twój email.')}&mode=magiclink`)
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return redirect('/login')
}
