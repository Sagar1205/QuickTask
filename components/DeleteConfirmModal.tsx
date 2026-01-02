'use client'

type Props = {
  open: boolean
  title?: string
  description?: string | null
  confirmText?: string
  onCancel: () => void
  onConfirm: () => void
}

export default function DeleteConfirmModal({
  open,
  title = 'Delete Task',
  description = null,
  confirmText = 'Delete',
  onCancel,
  onConfirm,
}: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50  dark:bg-black/60">
      <div className="bg-white w-full sm:max-w-sm mx-4 rounded-lg shadow-lg p-5 space-y-2 dark:bg-gray-900 dark:text-gray-100">
        <div className="text-lg font-semibold text-red-700">{title}</div>

        {description && <div className="text-sm text-gray-600">{description}</div>}

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1 border rounded cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-3 py-1 bg-red-700 text-white rounded cursor-pointer"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}