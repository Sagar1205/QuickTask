import { useUser } from '@/components/UserContext'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export async function searchUsersByEmail(email: string, userId: string | null) {
  if (!email) return []

  const { data, error } = await supabase
    .from('profiles')
    .select('id, email')
    .ilike('email', `%${email}%`)
    .neq('id', userId)
    .limit(10)

  if (error) {
    console.error(error)
    throw error
  }

  return data
}

export async function addListMember(
  listId: string | null,
  userId: string,
  role: 'viewer' | 'editor',
  userEmail: string,
  actorUserId: string | null
) {
  const { error } = await supabase
    .from('list_members')
    .insert({
      list_id: listId,
      user_id: userId,
      role,
    })
  if(!error){
    await fetch('/api/notifications', {
      method: 'POST',
      body: JSON.stringify({
        type: 'member_added',
        listId,
        actorEmail: userEmail,
        targetUserId: userId,
        actorUserId
      }),
    })
  }
  return { error }
}

export async function removeListMember(
  listId: string | null,
  userId: string,
  userEmail: string
) {
  const { error } = await supabase
    .from('list_members')
    .delete()
    .eq('list_id',listId)
    .eq('user_id',userId)

  if(!error){
    await fetch('/api/notifications', {
      method: 'POST',
      body: JSON.stringify({
        type: 'member_removed',
        listId,
        actorEmail: userEmail,
        targetUserId: userId,
      }),
    })
  }
  return { error }
}