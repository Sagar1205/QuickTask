'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useUser } from '@/components/UserContext'

const PUBLIC_ROUTES = ['/', '/login', '/register']

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useUser()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return 

    if (!user && !PUBLIC_ROUTES.includes(pathname)) {
      router.replace('/')
      return
    }

    if (user && (pathname === '/' || pathname === '/login' || pathname === '/register')) {
      router.replace('/dashboard')
    }
  }, [user, loading, pathname, router])

  if (loading) return null

  return <>{children}</>
}