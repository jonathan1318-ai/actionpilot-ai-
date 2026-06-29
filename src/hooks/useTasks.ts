import { useCallback } from 'react'
import { listMyTasks, listOrgTasks, updateTaskStatus } from '@/services/firebase/tasks'
import { useTaskStore } from '@/store/task.store'
import { useAuthStore } from '@/store/auth.store'
import type { TaskStatus } from '@/types'

export function useTasks() {
  const { tasks, loading, setTasks, setLoading, upsertTask } = useTaskStore()
  const user = useAuthStore(s => s.user)

  const fetchMyTasks = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await listMyTasks(user.orgId, user.uid)
      setTasks(data)
    } finally {
      setLoading(false)
    }
  }, [user, setTasks, setLoading])

  const fetchOrgTasks = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await listOrgTasks(user.orgId)
      setTasks(data)
    } finally {
      setLoading(false)
    }
  }, [user, setTasks, setLoading])

  const changeStatus = useCallback(async (taskId: string, status: TaskStatus) => {
    await updateTaskStatus(taskId, status)
    const task = tasks.find(t => t.taskId === taskId)
    if (task) upsertTask({ ...task, status })
  }, [tasks, upsertTask])

  return { tasks, loading, fetchMyTasks, fetchOrgTasks, changeStatus }
}
