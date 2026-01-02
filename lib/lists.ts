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
  role: 'viewer' | 'editor'
) {
  const { error } = await supabase
    .from('list_members')
    .insert({
      list_id: listId,
      user_id: userId,
      role,
    })

  return { error }
}