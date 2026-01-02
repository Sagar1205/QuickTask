import Link from 'next/link'
import AuthForm from '@/components/AuthForm'

export default function Register() {
  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center px-4">
      <AuthForm type="register" />

      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Already registered?{' '}
        <Link
          href="/login"
          className="text-blue-600 hover:underline dark:text-blue-400"
        >
          Login
        </Link>
      </p>
    </div>
  )
}