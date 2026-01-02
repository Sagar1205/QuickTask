'use client'

import { ThemeProvider } from 'next-themes'
import Header from './Header'
import Toaster from './Toaster'
import AuthGuard from './AuthGuard'
import { UserProvider } from './UserContext'

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
    >
      <UserProvider>
        <AuthGuard>
          <Header />
          <main className="pt-14 px-4 sm:px-6 max-w-7xl mx-auto">
            {children}
          </main>
          <Toaster />
        </AuthGuard>
      </UserProvider>
    </ThemeProvider>
  )
}