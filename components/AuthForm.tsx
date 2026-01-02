'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'

export default function AuthForm({ type }: { type: 'login' | 'register' }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { data, error } =
      type === "login"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) {
      toast.error(error.message);
      setLoading(false)
      return;
    }
    if (type === "login") {
      setLoading(false)
      toast.success("Login successful");
      router.push('/dashboard')
    } else {
      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          email: data.user.email
        });
      }
      setLoading(false)
      toast.success("Check your email to confirm signup");
      router.push('/login')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:max-w-sm mx-4">
      <input
        className="border border-gray-300 dark:border-gray-700 p-2 w-full rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        placeholder="Email"
        onChange={e => setEmail(e.target.value)}
      />
      <input
        className="border border-gray-300 dark:border-gray-700 p-2 w-full rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        type="password"
        placeholder="Password"
        onChange={e => setPassword(e.target.value)}
      />
      <button className="w-full p-2 bg-black text-white rounded cursor-pointer dark:bg-white dark:text-black">
        {loading ? (
          <>
            <FontAwesomeIcon icon={faCircleNotch} spin />
          </>
        ) : (
          type === 'login' ? 'Login' : 'Register'
        )}
      </button>
    </form>
  )
}