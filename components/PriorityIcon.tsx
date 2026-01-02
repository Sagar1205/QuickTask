import { HiChevronDoubleUp, HiChevronDown, HiChevronUp, HiMenuAlt4 } from 'react-icons/hi'

export function PriorityIcon({ priority }: { priority: string }) {
  const baseClass = 'h-4 w-4'
  if (priority == '2') {
    return (
      <div className="flex text-red-500 dark:text-red-400">
        <HiChevronDoubleUp className={baseClass} />
      </div>
    )
  }

  if (priority == '1') {
    return (
      <div className="flex text-yellow-500 dark:text-yellow-400">
        <HiMenuAlt4 className={baseClass} />
      </div>
    )
  }

  if (priority == '0') {
    return (
      <div className="flex text-green-500 dark:text-green-400">
        <HiChevronDown className={baseClass} />
      </div>
    )
  }

  return null
}