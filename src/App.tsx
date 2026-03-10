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
import SetterActivityPage from '@/pages/SetterActivityPage'
import FinancesPage from '@/pages/FinancesPage'
import UsersPage from '@/pages/UsersPage'
import MessagingPage from '@/pages/MessagingPage'
import FormationsPage from '@/pages/FormationsPage'
import FormationDetailPage from '@/pages/FormationDetailPage'
import SettingsPage from '@/pages/SettingsPage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import NotFoundPage from '@/pages/NotFoundPage'
import CSMLandingPage from '@/pages/CSMLandingPage'
import CloserCallsPage from '@/pages/CloserCallsPage'
import SocialContentPage from '@/pages/SocialContentPage'
import InstagramPage from '@/pages/InstagramPage'
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
          <Route path="/recrutement-csm" element={<CSMLandingPage />} />

          {/* Protected routes */}
          <Route element={<RouteGuard />}>
            <Route element={<Layout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/eleves" element={<ClientsPage />} />
              <Route path="/eleves/:id" element={<ClientDetailPage />} />
              <Route path="/pipeline" element={<LeadsPage />} />
              <Route path="/calendrier" element={<CallCalendarPage />} />
              <Route path="/activite" element={<SetterActivityPage />} />
              <Route path="/finances" element={<FinancesPage />} />
              <Route path="/messaging" element={<MessagingPage />} />
              <Route path="/formations" element={<FormationsPage />} />
              <Route path="/formations/:id" element={<FormationDetailPage />} />
              <Route
                path="/users"
                element={
                  <RoleGuard module="users">
                    <UsersPage />
                  </RoleGuard>
                }
              />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/documentation" element={<DocumentationPage />} />
              <Route
                path="/closer-calls"
                element={
                  <RoleGuard module="closer-calls">
                    <CloserCallsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/social-content"
                element={
                  <RoleGuard module="social-content">
                    <SocialContentPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/instagram"
                element={
                  <RoleGuard module="instagram">
                    <InstagramPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/analytics"
                element={
                  <RoleGuard module="analytics">
                    <AnalyticsPage />
                  </RoleGuard>
                }
              />
            </Route>
          </Route>

          {/* 404 catch-all */}
          <Route path="*" element={<NotFoundPage />} />
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
