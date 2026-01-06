import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch, faRemove, faTrash } from '@fortawesome/free-solid-svg-icons'

const PERMISSIONS = ['viewer', 'editor']

type ListMember = {
  user_id: string
  email: string
  role: 'viewer' | 'editor'
}

export type UserSearchResult = {
  id: string
  email: string
}

type ShareModalProps = {
  isOpen: boolean
  onClose: () => void
  existingMembers: ListMember[]
  searchUsers: (query: string) => Promise<UserSearchResult[]>
  onShare: (user: UserSearchResult, role: 'viewer' | 'editor') => Promise<void>
  onRevoke: (user: any) => Promise<void>
}

export default function ShareModal({
  isOpen,
  onClose,
  onShare,
  existingMembers = [],
  searchUsers,
  onRevoke
}: ShareModalProps) {
  const [query, setQuery] = useState<string>('')
  const [results, setResults] = useState<UserSearchResult[]>([])
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null)
  const [permission, setPermission] = useState<'viewer' | 'editor'>('viewer')
  const [loading, setLoading] = useState<boolean>(false)
  const [revokeLoading, setRevokeLoading] = useState<boolean>(false)
  const [memberId, setMemberId] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  const handleSearch = async (value: string) => {
    setQuery(value)
    if (!value) {
      setResults([])
      return
    }

    const users = await searchUsers(value)
    setResults(users)
  }

  const handleAdd = async () => {
    if (!selectedUser) return
    setLoading(true)
    await onShare(selectedUser, permission)
    setSelectedUser(null)
    setQuery('')
    setResults([])
    setLoading(false)
  }

  const handleRevoke = async (member: any) => {
    setRevokeLoading(true)
    setMemberId(member.user_id)
    await onRevoke(member)
    setRevokeLoading(false)
    setMemberId(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center dark:bg-black/60">
      <div className="bg-white w-full sm:max-w-md mx-4 rounded-lg shadow-lg p-4 dark:bg-gray-900 dark:text-gray-100">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Share list</h2>
          <button onClick={onClose} className="text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 cursor-pointer rounded p-1">✕</button>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by email"
            className="w-full border border-gray-300 dark:border-gray-700 rounded p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />

          {results.length > 0 && (
            <div className="absolute z-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded w-full mt-1 max-h-40 overflow-auto">
              {results.map(user => (
                <div
                  key={user.id}
                  onClick={() => {
                    setSelectedUser(user)
                    setQuery(user.email)
                    setResults([])
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                >
                  {/* {user.email} */}
                  <div className="flex items-center gap-1">
                    <div
                      className="h-8 w-8 rounded-full
                        bg-blue-800 text-white
                        flex items-center justify-center
                        text-sm font-semibold"
                    >
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {user.email}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Permission */}
        <div className="flex items-center gap-2 mt-3">
          <select
            value={permission}
            onChange={(e) => setPermission(e.target.value as 'viewer' | 'editor')}
            className="border rounded p-2 flex-1 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            {PERMISSIONS.map(p => (
              <option key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>

          <button
            onClick={handleAdd}
            disabled={!selectedUser || loading}
            className="bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded disabled:opacity-50 cursor-pointer"
          >
            Add
          </button>
        </div>
        {/* Existing members */}
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">People with access</p>
          <div className="space-y-2">
            {existingMembers.map(member => (
              <div
                key={member.user_id}
                className="flex justify-between items-center text-sm group"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-8 w-8 rounded-full bg-blue-800 text-white
                              flex items-center justify-center
                              text-sm font-semibold"
                  >
                    {member.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">
                    {member.email}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-gray-500 dark:text-gray-400 capitalize">
                    {member.role}
                  </span>

                  <button
                    onClick={() => handleRevoke(member)}
                    // disabled={!isOwner || member.user_id === user?.id}
                    title="Remove member"
                    className="
                      opacity-40 group-hover:opacity-100
                      text-red-600 hover:text-red-700
                      disabled:opacity-30 disabled:cursor-not-allowed
                      transition cursor-pointer
                    "
                  >
                    {(revokeLoading && memberId === member.user_id) ? (
                      <>
                        <FontAwesomeIcon icon={faCircleNotch} spin />
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faTrash} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}