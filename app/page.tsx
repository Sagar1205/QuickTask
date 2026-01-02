import Link from 'next/link'

export default function Home() {
  return (
    <main className="h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold">QuickTask</h1>
      <p className="text-gray-600">Collaborative task management</p>

      <div className="flex gap-4">
        <Link href="/login" className="px-4 py-2 bg-black text-white rounded dark:bg-white dark:text-black">
          Login
        </Link>
        <Link href="/register" className="px-4 py-2 border rounded">
          Register
        </Link>
      </div>
    </main>
  )
}