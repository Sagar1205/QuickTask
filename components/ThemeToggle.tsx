'use client'

import { useTheme } from 'next-themes'
import { FaSun, FaMoon } from 'react-icons/fa'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="
        relative
        flex
        items-center
        w-14
        h-7
        rounded-full
        bg-gray-300
        dark:bg-gray-700
        transition-colors
        duration-300
        cursor-pointer
      "
    >
      <span
        className={`
          absolute
          left-1
          flex
          h-5
          w-5
          items-center
          justify-center
          rounded-full
          bg-white
          text-yellow-500
          transition-transform
          duration-300
          ${isDark ? 'translate-x-7 text-gray-800' : ''}
        `}
      >
        {isDark ? <FaMoon size={12} /> : <FaSun size={12} />}
      </span>
    </button>
  )
}
