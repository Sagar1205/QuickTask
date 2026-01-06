'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { useUser } from './UserContext'

type Task = {
  id?: string
  title: string
  description: string
  priority: string
  due_date: string
}

type Props = {
  open: boolean
  onClose: () => void
  listId: string
  task?: Task | null
}

export default function TaskModal({ open, onClose, listId, task }: Props) {
  const { user } = useUser()
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [priority, setPriority] = useState<string>('1')
  const [dueDate, setDueDate] = useState<string>('')
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description ?? '')
      setPriority(task.priority ?? '1')
      setDueDate(task.due_date ?? '')
    } else {
      reset()
    }
  }, [task])

  const reset = () => {
    setTitle('')
    setDescription('')
    setPriority('1')
    setDueDate('')
  }

  if (!open) return null

  const handleSubmit = async () => {
    if (!title.trim()) return
    let res = null;
    setLoading(true);

    if (task?.id) {
      // UPDATE
      res = await supabase
        .from('tasks')
        .update({
          title,
          description,
          priority: Number(priority),
          due_date: dueDate || null,
        })
        .eq('id', task.id)
    } else {
      // CREATE
      res = await supabase.from('tasks').insert({
        title,
        description,
        priority,
        due_date: dueDate || null,
        list_id: listId,
        position: 0,
      }).select()

      if(!res.error){
        const task = res.data[0];
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'task_created',
            listId,
            actorUserId: user?.id,
            actorEmail: user?.email,
            taskTitle: task?.title
          }),
        })
      }
    }

    setLoading(false)
    if(res.error){
      toast.error(res.error.message)
    }else{
      if(task?.id){
        toast.success('Task updated successfully')
      }else{
        toast.success('Task added successfully')
      }
      reset()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60">
      <div
        className="
          w-full sm:max-w-md mx-4 rounded-lg p-5 space-y-4
          bg-white text-gray-900
          dark:bg-gray-900 dark:text-gray-100
          shadow-lg
        "
      >
        {/* Header */}
        <h2 className="text-lg font-semibold">
          {task ? 'Edit Task' : 'New Task'}
        </h2>

        {/* Title */}
        <input
          className="
            w-full rounded border p-2
            bg-white text-gray-900 border-gray-300
            dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700
            focus:outline-none focus:ring-2 focus:ring-blue-500
          "
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        {/* Description */}
        <textarea
          className="
            w-full rounded border p-2 resize-none min-h-[80px]
            bg-white text-gray-900 border-gray-300
            dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700
            focus:outline-none focus:ring-2 focus:ring-blue-500
          "
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />

        {/* Priority + Due Date */}
        <div className="flex gap-2">
          <select
            className="
              w-1/2 rounded border p-2
              bg-white text-gray-900 border-gray-300
              dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
            value={priority}
            onChange={e => setPriority(e.target.value)}
          >
            <option value="0">Low</option>
            <option value="1">Medium</option>
            <option value="2">High</option>
          </select>

          <input
            type="date"
            className="
              w-1/2 rounded border p-2
              bg-white text-gray-900 border-gray-300
              dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="
              px-4 py-1.5 rounded border
              text-gray-700 border-gray-300
              hover:bg-gray-100
              dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800
              transition cursor-pointer
            "
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="
              px-4 py-1.5 rounded
              bg-blue-600 text-white
              hover:bg-blue-700
              transition cursor-pointer
            "
          >
            {loading ? (
              <>
                <FontAwesomeIcon icon={faCircleNotch} spin />
              </>
            ) : (
              task ? 'Update' : 'Add'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}