'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import SortableTask from './SortableTask'
import { DndContext, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import AddEditTaskModal from "./AddEditTaskModal"
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons'
import DeleteConfirmModal from './DeleteConfirmModal'

export default function TaskList({ listId }: { listId: string }) {
  const [tasks, setTasks] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<{
    id: string
    title: string
    description: string
    priority: string
    due_date: string
  } | null>(null)
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null)
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // prevents accidental scroll drag
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  )


  useEffect(() => {
    const fetchTasks = async () => {
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('list_id', listId)
        .order('position')
        
      setTasks(data || [])
    }
    fetchTasks()

    const channel = supabase
      .channel('realtime-tasks')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        fetchTasks
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [listId])

  const handleDelete = async () => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', deleteTaskId)

    if(error){
      toast.error(error.message)
    }else{
      toast.success('Task removed successfully')
      setDeleteTaskId(null)
    }
  }

  const handleDragEnd = async (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = tasks.findIndex(t => t.id === active.id)
    const newIndex = tasks.findIndex(t => t.id === over.id)
    const reordered = arrayMove(tasks, oldIndex, newIndex)
    setTasks(reordered)

    await Promise.all(
      reordered.map((t, i) =>
        supabase.from('tasks').update({ position: i }).eq('id', t.id)
      )
    )
  }

  const updateTaskStatus = async (task: any) => {    
    const { error } = await supabase
      .from('tasks')
      .update({
        completed: !task.completed
      })
      .eq('id', task.id)

    if(error){
      toast.error(error.message)
    }else{
      toast.success("Task status updated successfully.")
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      {/* Add task */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="
          mb-4 px-4 py-2 rounded
          bg-black text-white
          hover:bg-gray-800
          dark:bg-white dark:text-black
          dark:hover:bg-gray-200
          transition-colors
          cursor-pointer
        "
      >
        + Add Task
      </button>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={tasks.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="
            flex flex-col w-full items-center gap-2
            p-2 rounded
            bg-white border
            dark:bg-gray-900 dark:border-gray-700
            transition-colors min-h-18 justify-center
          ">
            {tasks.map(task => (
              <div
                key={task.id}
                // className="
                //   flex w-full items-center gap-2
                //   p-2 rounded
                //   bg-white border
                //   dark:bg-gray-900 dark:border-gray-700
                //   transition-colors
                // "
                className="
                  flex w-full items-center gap-2
                  p-2 rounded
                  transition-colors
                "
              >
                {/* Custom radio-style checkbox */}
                <div
                  role="checkbox"
                  aria-checked={!!task.completed}
                  onClick={() => updateTaskStatus(task)}
                  className="
                    h-6 w-6 rounded-full border-2
                    flex items-center justify-center
                    cursor-pointer aspect-square
                    border-gray-400
                    dark:border-gray-500
                    hover:border-gray-600
                    dark:hover:border-gray-300
                    transition-colors
                  "
                >
                  {task.completed && (
                    <div
                      className="
                        h-3 w-3 rounded-full
                        bg-gray-600
                        dark:bg-gray-300
                      "
                    />
                  )}
                </div>

                {/* Draggable task */}
                <SortableTask
                  task={task}
                  className={task.completed ? 'opacity-60 line-through' : ''}
                />

                {/* Actions */}
                <div className="ml-auto flex items-center gap-1">
                  <FontAwesomeIcon
                    onClick={() => {
                      setEditingTask(task)
                      setIsModalOpen(true)
                    }}
                    icon={faPenToSquare}
                    className="
                      cursor-pointer
                      text-gray-500
                      hover:text-gray-800
                      dark:text-gray-400
                      dark:hover:text-gray-200
                      transition-colors
                    "
                  />

                  <FontAwesomeIcon
                    onClick={() => setDeleteTaskId(task.id)}
                    icon={faTrash}
                    className="
                      cursor-pointer
                      text-red-600
                      hover:text-red-700
                      dark:text-red-500
                      dark:hover:text-red-400
                      transition-colors
                    "
                  />
                </div>
              </div>
            ))}
            {tasks.length === 0 && <div className='text-sm text-gray-500'>
              Nothing planned. Enjoy the quiet…
            </div>}
          </div>
        </SortableContext>
      </DndContext>

      {/* Modals */}
      <AddEditTaskModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingTask(null)
        }}
        listId={listId}
        task={editingTask}
      />

      <DeleteConfirmModal
        open={!!deleteTaskId}
        title="Delete task"
        description="Are you sure you want to delete this task?"
        onCancel={() => setDeleteTaskId(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}