'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faTrash, faShareNodes } from '@fortawesome/free-solid-svg-icons'
import toast from 'react-hot-toast'
import DeleteConfirmModal from '@/components/DeleteConfirmModal'
import AddEditListModal from '@/components/AddEditListModal'
import CollabModal from '@/components/CollabModal'
import {
  searchUsersByEmail,
  addListMember,
  removeListMember,
} from '@/lib/lists'
import { useUser } from '@/components/UserContext'

type ListMember = {
  user_id: string
  email: string
  role: 'viewer' | 'editor'
}

type ListMemberRow = {
  user_id: string
  role: 'viewer' | 'editor'
  profiles:
    | { email: string }
    | { email: string }[]
    | null
}

export default function Dashboard() {
  const { user } = useUser()

  const [lists, setLists] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedList, setSelectedList] = useState<any | null>(null)
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null)

  const [members, setMembers] = useState<ListMember[]>([])
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [shareListId, setShareListId] = useState<string | null>(null)

  // ✅ fetch existing members when modal opens
  useEffect(() => {
    if (!isShareModalOpen) return
    const fetchMembers = async () => {
      const { data, error } = await supabase
        .from('list_members')
        .select('user_id, role, profiles(email)')
        .eq('list_id', shareListId)
        .neq('user_id', user?.id)

      if (!error && data) {
        setMembers(
          (data as ListMemberRow[]).map(m => ({
            user_id: m.user_id,
            email: Array.isArray(m.profiles)
              ? m.profiles[0]?.email ?? ''
              : m.profiles?.email ?? '',
            role: m.role,
          }))
        )
      }
    }

    fetchMembers()
  }, [isShareModalOpen, shareListId])

  useEffect(() => {
    const fetchLists = async () => {
      const { data } = await supabase
        .from('task_lists')
        .select(`
          id,
          title,
          owner_id,
          list_members (
            role,
            user_id
          )
        `)
      setLists(data || [])
    }
    fetchLists()

    const channel = supabase
      .channel('realtime-tasks')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'task_lists' },
        fetchLists
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'list_members' },
        fetchLists
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleDelete = async () => {
    const { error } = await supabase
      .from("task_lists")
      .delete()
      .eq("id",deleteTaskId)

    if(error){
      toast.error(error.message)
    }else{
      toast.success('List removed successfully')
      setDeleteTaskId(null)
    }
  }

  const handleSearchUsers = async (email: string) => {
    return await searchUsersByEmail(email,user?.id ?? null)
  }

  // ➕ passed to modal
  const handleShare = async (addUser: any, role: 'viewer' | 'editor') => {
    const { error: shareError } = await addListMember(shareListId, addUser.id, role, user?.email || '', user?.id || null)
    if (shareError) {
      toast.error('Could not add member: ' + shareError.message);
      return;
    }

    toast.success('Member added successfully');
    // refresh members after insert
    const { data, error } = await supabase
      .from('list_members')
      .select('user_id, role, profiles(email)')
      .eq('list_id', shareListId)

    setIsShareModalOpen(false)
    setShareListId(null)

    if (error || !data) {
      console.error(error)
      return
    }

    setMembers(
      data.map(m => ({
        user_id: m.user_id,
        email: m.profiles?.[0]?.email ?? '',
        role: m.role,
      }))
    )
  }

  const handleRevokePermission = async (user: any) => {
    const { error: removeErr } = await removeListMember(shareListId, user.user_id, user.email)
    if (removeErr) {
      toast.error('Could not remove member: ' + removeErr.message);
      return;
    }

    toast.success('Member removed successfully');
    const { data, error } = await supabase
      .from('list_members')
      .select('user_id, role, profiles(email)')
      .eq('list_id', shareListId)

    if (error || !data) {
      console.error(error)
      return
    }

    const membersNormalized = data?.map(m => ({
			...m,
			profile: Array.isArray(m.profiles) ? m.profiles[0] : m.profiles,
		}));

    setMembers(
      membersNormalized.map(m => ({
        user_id: m.user_id,
        email: m.profile?.email ?? '',
        role: m.role,
      }))
    )
  }

  const getMyRole = (list: any) => {
    if (list.owner_id === user?.id) return 'owner'
    const member = list.list_members?.find(
      (m: any) => m.user_id === user?.id
    )
    return member?.role ?? null
  }

  const canShare = (list: any) => {
    const role = getMyRole(list)
    return role === 'owner' || role === 'editor'
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Lists</h1>
      <button
        onClick={() => {
          setSelectedList(null)
          setIsModalOpen(true)
        }}
        className="mb-4 px-3 py-1 bg-black text-white rounded cursor-pointer dark:bg-white dark:text-black"
      >
        + New List
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 gap-5">
        {lists.map(list => (
          <div key={list.id} className="relative">
            {/* Card */}
            <div
              className="
                flex items-center justify-between
                p-3 bg-white border rounded-lg
                pr-8 dark:bg-gray-900
              "
            >
              {/* List link */}
              <Link
                href={`/lists/${list.id}`}
                className="flex-1 font-medium hover:underline"
              >
                {list.title}
              </Link>

              {/* Edit / Delete */}
              {canShare(list) && <div className="flex items-center gap-1">
                <FontAwesomeIcon
                  onClick={() => {
                    setSelectedList(list)
                    setIsModalOpen(true)
                  }}
                  icon={faPenToSquare}
                  className="cursor-pointer"
                />

                <FontAwesomeIcon
                  onClick={() => setDeleteTaskId(list.id)}
                  icon={faTrash}
                  className="cursor-pointer text-red-700"
                />
              </div>}
            </div>

            {/* Share icon – right side */}
            {canShare(list) && (
              <button
                onClick={() => {
                  setIsShareModalOpen(true)
                  setShareListId(list.id)
                }}
                // disabled={}
                className="
                  absolute top-1/2 -right-3
                  -translate-y-1/2
                  bg-white border rounded-full
                  p-2 shadow
                  hover:bg-gray-100 cursor-pointer dark:bg-black
                "
                title="Share list"
              >
                <FontAwesomeIcon icon={faShareNodes} />
              </button>
            )}
          </div>
        ))}
      </div>

      <DeleteConfirmModal
        open={!!deleteTaskId}
        title="Delete list"
        description={`Are you sure you want to delete this list?`}
        onCancel={() => setDeleteTaskId(null)}
        onConfirm={handleDelete}
      />
      <AddEditListModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedList(null)
        }}
        list={selectedList}
      />
      <CollabModal
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false)
          setShareListId(null)
        }}
        existingMembers={members}
        searchUsers={handleSearchUsers}
        onShare={handleShare}
        onRevoke={handleRevokePermission}
      />
    </div>
  )
}