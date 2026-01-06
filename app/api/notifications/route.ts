import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type NotificationPayload = {
  type:
    | 'member_added'
    | 'task_created'
    | 'task_deleted'
    | 'task_updated'
  listId: string
  actorUserId: string
  actorEmail: string
  targetUserId?: string
  taskTitle?: string
}

export async function POST(req: Request) {
  try {
    const payload: NotificationPayload = await req.json()
    const {
      type,
      listId,
      actorUserId,
      actorEmail,
      targetUserId,
      taskTitle,
    } = payload

    const { data: list, error: listError } = await supabase
      .from('task_lists')
      .select('id, title, owner_id')
      .eq('id', listId)
      .single()

    if (listError || !list) {
      return NextResponse.json(
        { error: 'List not found' },
        { status: 404 }
      )
    }

    const { data: ownerProfile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', list.owner_id)
      .single()

    const { data: members } = await supabase
      .from('list_members')
      .select(`
        user_id,
        profiles(email)
      `)
      .eq('list_id', listId)


    const recipients = new Set<string>()

    // Owner
    if (list.owner_id) recipients.add(list.owner_id)

    // Members
    members?.forEach(m => recipients.add(m.user_id))

    // Remove actor
    recipients.delete(actorUserId)

    // Member added → notify only added user
    if (type === 'member_added' && targetUserId) {
      recipients.clear()
      recipients.add(targetUserId)
    }
		
		const membersNormalized = members?.map(m => ({
			...m,
			profile: Array.isArray(m.profiles) ? m.profiles[0] : m.profiles,
		}));
		const emailJobs = []
    for (const userId of recipients) {
      let email = membersNormalized?.find(m => m.user_id === userId)?.profile?.email

      if (!email && userId === list.owner_id) {
        email = ownerProfile?.email
      }
      if (!email) continue
			
      emailJobs.push({
				from: 'TaskApp <noreply@quicktask.click>',
				to: email,
				subject: `Activity in "${list.title}"`,
				html: buildEmailHtml({
					actorEmail,
					type,
					listId,
					taskTitle,
				}),
			})
    }
		
		const delay = (ms: number) => new Promise(res => setTimeout(res, ms))
		for (const email of emailJobs) {
			try {
				await resend.emails.send(email)
				await delay(600)
			} catch (err) {
				console.error('Resend error:', err)
			}
		}

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Notification failed' },
      { status: 500 }
    )
  }
}

function buildEmailHtml({
  actorEmail,
  type,
  listId,
  taskTitle,
}: {
  actorEmail: string
  type: string
  listId: string
  taskTitle?: string
}) {
  const actorName = actorEmail.split('@')[0]

  let message = ''
  switch (type) {
    case 'member_added':
      message = 'added you to a list'
      break
    case 'task_created':
      message = `created a task "${taskTitle}"`
      break
    case 'task_deleted':
      message = `deleted a task "${taskTitle}"`
      break
    case 'task_updated':
      message = `updated a task "${taskTitle}"`
      break
    default:
      message = type.replace('_', ' ')
  }

  return `
    <p>
      <strong>${actorName}</strong> ${message}
    </p>
    <p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/lists/${listId}">
        Open list
      </a>
    </p>
  `
}