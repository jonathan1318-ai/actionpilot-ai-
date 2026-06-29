import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { OnboardingPage } from '@/pages/auth/OnboardingPage'
import { MeetingsPage } from '@/pages/MeetingsPage'
import { MeetingDetailPage } from '@/pages/MeetingDetailPage'
import { TasksPage } from '@/pages/TasksPage'
import { SchedulerPage } from '@/pages/SchedulerPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { SearchPage } from '@/pages/SearchPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'onboarding', element: <OnboardingPage /> },
    ],
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { path: 'meetings',              element: <MeetingsPage /> },
      { path: 'meetings/:meetingId',   element: <MeetingDetailPage /> },
      { path: 'tasks',                 element: <TasksPage /> },
      { path: 'scheduler',             element: <SchedulerPage /> },
      { path: 'dashboard',             element: <DashboardPage /> },
      { path: 'search',                element: <SearchPage /> },
    ],
  },
])
