import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

import { Layout } from '@/components/layout/Layout'
import { RouteGuard } from '@/components/auth/RouteGuard'
import { RoleGuard } from '@/components/auth/RoleGuard'
import { useAuth } from '@/hooks/useAuth'
import { Skeleton } from '@/components/ui/skeleton'

// Lazy-loaded pages for code splitting
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const ClientsPage = lazy(() => import('@/pages/ClientsPage'))
const ClientDetailPage = lazy(() => import('@/pages/ClientDetailPage'))
const LeadsPage = lazy(() => import('@/pages/LeadsPage'))
const CallCalendarPage = lazy(() => import('@/pages/CallCalendarPage'))
const SetterActivityPage = lazy(() => import('@/pages/SetterActivityPage'))
const FinancesPage = lazy(() => import('@/pages/FinancesPage'))
const UsersPage = lazy(() => import('@/pages/UsersPage'))
const MessagingPage = lazy(() => import('@/pages/MessagingPage'))
const FormationsPage = lazy(() => import('@/pages/FormationsPage'))
const FormationDetailPage = lazy(() => import('@/pages/FormationDetailPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
const CSMLandingPage = lazy(() => import('@/pages/CSMLandingPage'))
const CloserCallsPage = lazy(() => import('@/pages/CloserCallsPage'))
const SocialContentPage = lazy(() => import('@/pages/SocialContentPage'))
const InstagramPage = lazy(() => import('@/pages/InstagramPage'))
const ClientsManagePage = lazy(() => import('@/pages/ClientsManagePage'))
const DocumentationPage = lazy(() => import('@/pages/DocumentationPage'))

function PageLoader() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  )
}

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
        <Suspense fallback={<PageLoader />}>
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
                <Route
                  path="/clients"
                  element={
                    <RoleGuard module="clients">
                      <ClientsManagePage />
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
        </Suspense>
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
