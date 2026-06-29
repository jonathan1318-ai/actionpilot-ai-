import { create } from 'zustand'
import type { Task } from '@/types'

interface TaskState {
  tasks: Task[]
  loading: boolean
  setTasks: (tasks: Task[]) => void
  setLoading: (loading: boolean) => void
  upsertTask: (task: Task) => void
  removeTask: (taskId: string) => void
}

export const useTaskStore = create<TaskState>(set => ({
  tasks:   [],
  loading: false,
  setTasks:   tasks   => set({ tasks }),
  setLoading: loading => set({ loading }),
  upsertTask: task => set(state => {
    const idx = state.tasks.findIndex(t => t.taskId === task.taskId)
    if (idx === -1) return { tasks: [task, ...state.tasks] }
    const next = [...state.tasks]
    next[idx] = task
    return { tasks: next }
  }),
  removeTask: taskId => set(state => ({ tasks: state.tasks.filter(t => t.taskId !== taskId) })),
}))
