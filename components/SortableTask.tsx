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
    flex flex-col justify-between p-2 w-full rounded border
    bg-gray-50 text-gray-900
    dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700
    hover:bg-white dark:hover:bg-gray-900
    transition-colors mb-1 text-[15px] group
    ${task.completed ? 'line-through opacity-60 hover:no-underline' : ''}
    ${className}
  `

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={combinedClasses}
    >
      <div className='flex items-center'>
        <span
          {...attributes}
          {...listeners}
          className="mr-1 cursor-grab touch-none"
        >
          ⠿
        </span>
        <div className='flex justify-between flex-1'>
          <span className="flex-1 leading-[1.2] mt-[2.5px]">{task.title}</span>
          <div className="flex flex-col justify-start items-end">
            <PriorityIcon priority={task.priority} />
            <DueDateBadge dueDate={task.due_date} />
          </div>
        </div>
      </div>
      {!task.completed && <span className="mt-[2px] flex-1 text-xs text-gray-400 dark:text-gray-600 leading-none">{task.description}</span>}
    </div>
  )
}