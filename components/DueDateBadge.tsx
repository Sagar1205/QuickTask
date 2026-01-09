export function DueDateBadge({ dueDate }: { dueDate?: string }) {
  if (!dueDate) return <span
        className="text-[11px] leading-none text-green-700 dark:text-green-800"
        title="No due date"
      >
        No due date
      </span>

  const now = new Date()
  const date = new Date(dueDate)
  const isOverdue = date.setHours(23, 59, 59, 999) < now.getTime()

  return (
    <span
      className={`
        text-[11px] leading-none h-full flex items-center
        ${
          isOverdue
            ? 'text-red-600 dark:text-red-400'
            : 'text-gray-700 dark:text-gray-400'
        }
      `}
      title={`Due ${date.toDateString()}`}
    >
      <span>Due:</span> {date.toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
      })}
    </span>
  )
}