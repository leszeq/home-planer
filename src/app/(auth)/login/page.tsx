import { LoginClientView } from '@/components/auth/login-client-view'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string, error?: string, mode?: 'login' | 'register' | 'magiclink' }>
}) {
  const awaitedParams = await searchParams;
  return (
    <LoginClientView 
      initialMode={awaitedParams.mode || 'register'} 
      error={awaitedParams.error} 
      message={awaitedParams.message} 
    />
  )
}
