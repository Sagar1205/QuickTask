export function formatAuditLog(log: any, currentUserId?: string) {
  const isYou = log.actor_id === currentUserId

  const actor = isYou ? 'You' : log.actor?.email?.split('@')[0] ?? 'Someone'

  switch (log.action) {
    case 'list_created':
      return `${actor} created the list`

    case 'list_updated':
      return `${actor} updated the list`

    case 'list_deleted':
      return `${actor} deleted the list`

    case 'member_added':
      return `${actor} shared the list`

    case 'member_removed':
      return `${actor} removed a member`

    case 'task_created':
      return `${actor} added a task "${log.metadata?.title}"`

    case 'task_updated':
      return `${actor} updated a task`

    case 'task_deleted':
      return `${actor} deleted a task "${log.metadata?.title}"`

    default:
      return `${actor} performed an action`
  }
}