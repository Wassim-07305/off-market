import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth-store'
import { Skeleton } from '@/components/ui/skeleton'

export function RouteGuard() {
  const user = useAuthStore((state) => state.user)
  const loading = useAuthStore((state) => state.loading)

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        {/* Top bar skeleton */}
        <div className="flex h-14 items-center border-b border-border bg-card px-6">
          <Skeleton className="h-6 w-32" />
          <div className="ml-auto flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        <div className="flex flex-1">
          {/* Sidebar skeleton */}
          <div className="flex w-60 flex-col gap-2 border-r border-border bg-card p-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-md" />
            ))}
          </div>

          {/* Main content skeleton */}
          <div className="flex-1 p-6">
            <Skeleton className="mb-6 h-8 w-64" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
              ))}
            </div>
            <Skeleton className="mt-6 h-64 w-full rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
