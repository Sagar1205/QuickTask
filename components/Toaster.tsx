'use client'

import { Toaster } from 'react-hot-toast'
import { useTheme } from 'next-themes'

export default function ToastProvider() {
  const { theme } = useTheme()

  return (
    <Toaster
    position="top-right"
    toastOptions={{
        style: {
        background: theme === 'dark' ? '#1f2937' : '#ffffff',
        color: theme === 'dark' ? '#f9fafb' : '#111827',
        border: theme === 'dark'
            ? '1px solid #374151'
            : '1px solid #e5e7eb',
        },
    }}
    />
  )
}