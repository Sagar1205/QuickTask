'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ThemeToggle } from '@/components/ThemeToggle'
import { IoLogOutOutline } from 'react-icons/io5'
import { useUser } from '@/components/UserContext'

export default function Header() {
  const { user, logout } = useUser()

  const username = user?.email ? user?.email?.split('@')[0] : ''

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 border-b
        bg-white text-gray-900 backdrop-blur
        dark:bg-black dark:text-gray-100 dark:border-gray-800"
    >
      <Link href="/dashboard" className="font-bold text-lg">
        QuickTask
      </Link>

      <div className="flex items-center gap-4 sm:gap-10">
        {user?.email && (
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              <div
                className="h-8 w-8 rounded-full
                  bg-blue-800 text-white
                  flex items-center justify-center
                  text-sm font-semibold"
              >
                {username.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {username}
              </span>
            </div>

            <button onClick={logout}>
              <div
                className="px-3 py-1 rounded border text-sm
                  border-gray-300 text-gray-700
                  hover:bg-gray-100
                  dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800
                  transition cursor-pointer hidden sm:inline"
              >
                Logout
              </div>
              <div className='sm:hidden'>
                <IoLogOutOutline className='h-7 w-7'/>
              </div>
            </button>
          </div>
        )}
        <ThemeToggle />
      </div>
    </header>
  )
}
