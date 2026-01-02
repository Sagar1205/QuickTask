import Link from 'next/link'
import AuthForm from '@/components/AuthForm'

export default function Login() {
  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center px-4">
      <AuthForm type="login" />

      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        New user?{' '}
        <Link
          href="/register"
          className="text-blue-600 hover:underline dark:text-blue-400"
        >
          Register
        </Link>
      </p>
    </div>
  )
}