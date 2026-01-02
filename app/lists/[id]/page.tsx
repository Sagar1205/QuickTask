'use client'

import { useParams } from 'next/navigation'
import TaskList from "@/components/TasksList"

export default function ListPage() {
  const params = useParams()
  const listId = params.id as string

  return <TaskList listId={listId} />
}