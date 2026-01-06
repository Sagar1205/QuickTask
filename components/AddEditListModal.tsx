'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { useUser } from './UserContext'

type List = {
  id?: string
  title: string
}

type Props = {
  open: boolean
  onClose: () => void
//   onSuccess: (list: List) => void
  list?: List | null
}

export default function ListModal({
  open,
  onClose,
//   onSuccess,
  list,
}: Props) {
    const { user } = useUser()
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)

  // Prefill on edit  
  useEffect(() => {
    if (!open) return
    if (list) {
      setTitle(list.title)
    } else {
      setTitle('')
    }
  }, [list,open])

  if (!open) return null

  const handleSubmit = async () => {
    if (!title.trim()) return
    setLoading(true)
    let result = null
    if (list?.id) {
      // UPDATE
      result = await supabase
        .from('task_lists')
        .update({ title })
        .eq('id', list.id)
        .select()
        .single()
    } else {
      // CREATE
      result = await supabase
        .from('task_lists')
        .insert({ title })
        .select()
        .single()
    }
    setLoading(false)
    onClose()
    if (result.error) {
      toast.error(result.error.message)
    } else {
			if (list?.id) {
				toast.success('List updated successfully')
			} else {
				toast.success('List added successfully')
        const task = result.data;
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'list_created',
            listId: task.id,
            actorUserId: user?.id,
            actorEmail: user?.email,
            taskTitle: task?.title
          }),
        })
			}
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 dark:bg-black/60">
      <div className="bg-white w-full sm:max-w-sm mx-4 rounded-lg shadow-lg p-4 space-y-4 dark:bg-gray-900 dark:text-gray-100">
        <h2 className="text-lg font-semibold">
          {list ? 'Edit List' : 'New List'}
        </h2>

        <input
          className="border border-gray-300 dark:border-gray-700 p-2 w-full rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="List title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          autoFocus
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="border px-3 py-1 rounded cursor-pointer"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="bg-black text-white px-3 py-1 dark:bg-white dark:text-black rounded cursor-pointer"
            disabled={loading}
          >
            {loading
              ? 'Saving...'
              : list
              ? 'Update'
              : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}