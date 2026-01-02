'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { PriorityIcon } from './PriorityIcon'
import { DueDateBadge } from './DueDateBadge'

type SortableTaskProps = {
  task: any
  className?: string
}

export default function SortableTask({ task, className }: SortableTaskProps) {
  const { setNodeRef, attributes, listeners, transform, transition } =
    useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  const combinedClasses = `
    flex justify-between p-2 w-full rounded border
    bg-gray-50 text-gray-900
    dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700
    hover:bg-white dark:hover:bg-gray-900
    transition-colors
    ${task.completed ? 'line-through opacity-60' : ''}
    ${className}
  `

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={combinedClasses}
    >
      <span
        {...attributes}
        {...listeners}
        className="mr-2 cursor-grab touch-none"
      >
        ⠿
      </span>

      <span className="flex-1">{task.title}</span>
      <div className="flex flex-col items-end shrink-0">
        <PriorityIcon priority={task.priority} />
        <DueDateBadge dueDate={task.due_date} />
      </div>
    </div>
  )
}