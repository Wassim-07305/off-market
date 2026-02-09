import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

import { Layout } from '@/components/layout/Layout'
import { RouteGuard } from '@/components/auth/RouteGuard'
import { RoleGuard } from '@/components/auth/RoleGuard'
import { useAuth } from '@/hooks/useAuth'

import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import DashboardPage from '@/pages/DashboardPage'
import ClientsPage from '@/pages/ClientsPage'
import ClientDetailPage from '@/pages/ClientDetailPage'
import LeadsPage from '@/pages/LeadsPage'
import CallCalendarPage from '@/pages/CallCalendarPage'
import CloserCallsPage from '@/pages/CloserCallsPage'
import SetterActivityPage from '@/pages/SetterActivityPage'
import SocialContentPage from '@/pages/SocialContentPage'
import FinancesPage from '@/pages/FinancesPage'
import InstagramPage from '@/pages/InstagramPage'
import UsersPage from '@/pages/UsersPage'
import DocumentationPage from '@/pages/DocumentationPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  useAuth()

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected routes */}
          <Route element={<RouteGuard />}>
            <Route element={<Layout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/clients" element={<ClientsPage />} />
              <Route path="/clients/:id" element={<ClientDetailPage />} />
              <Route path="/leads" element={<LeadsPage />} />
              <Route path="/call-calendar" element={<CallCalendarPage />} />
              <Route path="/closer-calls" element={<CloserCallsPage />} />
              <Route path="/setter-activity" element={<SetterActivityPage />} />
              <Route path="/social-content" element={<SocialContentPage />} />
              <Route path="/finances" element={<FinancesPage />} />
              <Route path="/instagram" element={<InstagramPage />} />
              <Route
                path="/users"
                element={
                  <RoleGuard module="users">
                    <UsersPage />
                  </RoleGuard>
                }
              />
              <Route path="/documentation" element={<DocumentationPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>

      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          duration: 4000,
        }}
      />
    </QueryClientProvider>
  )
}

export default App
