import { formatAuditLog } from '@/lib/auditFormatter'

type AuditLog = {
  id: string
  action: string
  entity_type: string
  metadata: any
  created_at: string
  actor_id: string | null
}

type LogsModalProps = {
  isOpen: boolean
  onClose: () => void
  logs: AuditLog[]
  currentUserId?: string
}

export default function LogsModal({ isOpen, onClose, logs, currentUserId }: LogsModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 dark:bg-black/60">
      <div className="bg-white w-full sm:max-w-md mx-4 rounded-lg shadow-lg p-4 max-h-[80vh] overflow-y-auto dark:bg-gray-900 dark:text-gray-100">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Activity Logs</h2>
          <button onClick={onClose} className="text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 cursor-pointer rounded p-1">✕</button>
        </div>

        {/* Logs */}
        <div className="space-y-3">
          {logs.length === 0 && <p className="text-sm text-gray-500">No activity yet</p>}
          {logs.map(log => (
            <div key={log.id} className="flex items-start gap-3 text-sm">
              <div className="mt-1 h-2 w-2 rounded-full bg-gray-400" />
              <div>
                <p className="text-gray-600 dark:text-gray-300">{formatAuditLog(log, currentUserId)}</p>
                <p className="text-xs text-gray-500">{new Date(log.created_at).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}