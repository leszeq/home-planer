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
    return redirect(`/login?error=${encodeURIComponent(error.message)}&mode=login`)
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

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  // Supabase returns a fake success if user exists to prevent email enumeration.
  // We check if identities is empty to know if the user actually already exists.
  if (!error && data?.user && (!data.user.identities || data.user.identities.length === 0)) {
    return redirect(`/login?error=${encodeURIComponent('User already registered')}&mode=login`)
  }

  if (error) {
    return redirect(`/login?error=${encodeURIComponent(error.message)}&mode=register`)
  }

  return redirect(`/login?message=${encodeURIComponent('Konto zostało utworzone. Potwierdź swój adres email, aby się zalogować.')}&mode=login`)
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
  try {
    await supabase.auth.signOut()
  } catch (err) {
    console.error('Error during sign out:', err)
  }
  return redirect('/login')
}
