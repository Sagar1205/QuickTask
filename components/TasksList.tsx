'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import SortableTask from './SortableTask'
import { DndContext, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors, DragOverlay, useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import AddEditTaskModal from "./AddEditTaskModal"
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faTrash, faHistory } from '@fortawesome/free-solid-svg-icons'
import DeleteConfirmModal from './DeleteConfirmModal'
import { useUser } from './UserContext'
import ActiveUsers from './ActiveUsers'
import LogsModal from './ActivityLogs'

const TODO_COLUMN_ID = 'todo-column'
const DONE_COLUMN_ID = 'done-column'

function TaskColumn({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={`
        p-2 rounded border min-h-28
        transition-colors
        dark:bg-gray-900 dark:border-gray-700
        ${isOver ? 'bg-blue-50 dark:bg-gray-800' : ''}
      `}
    >
      <h3 className="font-semibold mb-2">{title}</h3>
      {children}
    </div>
  )
}

export default function TaskList({ listId }: { listId: string }) {
  const { user } = useUser()

  const [tasks, setTasks] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<{
    id: string
    title: string
    description: string
    priority: string
    due_date: string
  } | null>(null)
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null)
  const [isLogsOpen, setIsLogsOpen] = useState(false)
  const [loadingData,setLoadingData] = useState<{load: boolean, ops: string}>({load: false, ops: ''})
  const [activeTask, setActiveTask] = useState<any | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // prevents accidental scroll drag
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
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

  useEffect(()=>{
    const fetchLogs = async() => {
      const { data: logs } = await supabase
        .from('audit_logs')
        .select(`*,
          actor:profiles(id, email)`)
        .order('created_at', { ascending: false })
        .limit(50)

      const logsForCurrentList = logs?.filter(
        log => log.entity_id === listId || log.metadata?.list_id === listId
      )
      setLogs(logsForCurrentList || [])
    }
    fetchLogs()
  },[listId,tasks])

  const handleDelete = async () => {
    setLoadingData({load: true, ops: 'delete'})
    const res = await supabase
      .from('tasks')
      .delete()
      .eq('id', deleteTaskId)
      .select()

    if(res.error){
      toast.error(res.error.message)
    }else{
      const deletedTask = res.data[0]
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'task_deleted',
          listId,
          actorUserId: user?.id,
          actorEmail: user?.email,
          taskTitle: deletedTask.title
        }),
      })
      toast.success('Task removed successfully')
      setDeleteTaskId(null)
    }
    setLoadingData({load: false, ops: ''})
  }

  const handleDragEnd = async ({ active, over }: any) => {
    setActiveTask(null)
    if (!over) return

    const dragged = tasks.find(t => t.id === active.id)
    if (!dragged) return

    // target column
    let targetCompleted = dragged.completed

    if (over.id === TODO_COLUMN_ID) targetCompleted = false
    if (over.id === DONE_COLUMN_ID) targetCompleted = true

    const overTask = tasks.find(t => t.id === over.id)
    if (overTask) targetCompleted = overTask.completed

    const sameColumn = dragged.completed === targetCompleted

    // same col
    if (sameColumn && overTask) {
      const columnTasks = tasks
        .filter(t => t.completed === dragged.completed)
        .sort((a, b) => a.position - b.position)

      const oldIndex = columnTasks.findIndex(t => t.id === dragged.id)
      const newIndex = columnTasks.findIndex(t => t.id === overTask.id)

      if (oldIndex === newIndex) return

      const reordered = arrayMove(columnTasks, oldIndex, newIndex)

      const updatedTasks = [
        ...tasks.filter(t => t.completed !== dragged.completed),
        ...reordered.map((t, i) => ({ ...t, position: i })),
      ]

      setTasks(updatedTasks)

      await Promise.all(
        reordered.map((t, i) =>
          supabase.from('tasks').update({ position: i }).eq('id', t.id)
        )
      )

      return
    }

    // cross col
    const movedTask = { ...dragged, completed: targetCompleted }

    const remainingTasks = tasks.filter(t => t.id !== dragged.id)

    const targetColumnTasks = remainingTasks
      .filter(t => t.completed === targetCompleted)
      .sort((a, b) => a.position - b.position)

    const newPosition = targetColumnTasks.length

    const updatedTasks = [
      ...remainingTasks,
      { ...movedTask, position: newPosition },
    ]
    setTasks(updatedTasks)

    const { error } = await supabase
      .from('tasks')
      .update({
        completed: targetCompleted,
        position: newPosition
      })
      .eq('id', dragged.id)

    if(error){
      toast.error(error.message)
    }else{
      toast.success("Task status updated successfully.")
    }
  }

  return (
    <div className="py-4 max-w-4xl mx-auto">
      <div className='flex justify-between'>
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

        <div className='flex gap-4'>
          <ActiveUsers listId={listId}/>
          <div
            onClick={() => setIsLogsOpen(true)}
            className="mb-4 px-2 flex items-center text-sm rounded cursor-pointer bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-200"
          >
            <FontAwesomeIcon icon={faHistory} className='w-10 h-10'/>
          </div>
        </div>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={event => setActiveTask(tasks.find(t => t.id === event.active.id) || null)}
        onDragEnd={handleDragEnd}
      >

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">

          {/* TODO COLUMN */}
          <TaskColumn id={TODO_COLUMN_ID} title="To Do">
            <SortableContext
              items={tasks.filter(t => !t.completed).map(t => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {tasks.filter(t => !t.completed).map(task => (
                <div key={task.id} className='flex w-full items-center gap-[3px]'>
                  <SortableTask task={task} />
                  <div className="ml-auto flex items-center">
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
              {tasks.filter(t => !t.completed)?.length === 0 && <div className='text-sm text-gray-500 mt-6 flex justify-center '>
                Nothing planned. Enjoy the quiet…
              </div>}
            </SortableContext>
          </TaskColumn>

          {/* DONE COLUMN */}
          <TaskColumn id={DONE_COLUMN_ID} title="Completed">
            <SortableContext
              items={tasks.filter(t => t.completed).map(t => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {tasks.filter(t => t.completed).map(task => (
                <div key={task.id} className='flex w-full items-center gap-[3px]'>
                  <SortableTask task={task} />
                  <div className="ml-auto flex items-center">
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
              {tasks.filter(t => t.completed)?.length === 0 && <div className='text-sm text-gray-500 mt-6 flex justify-center '>
                This side’s looking a little empty…
              </div>}
            </SortableContext>
          </TaskColumn>

        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="p-3 rounded border bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-lg">
              {activeTask.title}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

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
        loading={loadingData.load === true && loadingData.ops === 'delete'}
      />

      <LogsModal
        isOpen={isLogsOpen}
        onClose={() => setIsLogsOpen(false)}
        logs={logs ?? []}
        currentUserId={user?.id}
      />
    </div>
  )
}