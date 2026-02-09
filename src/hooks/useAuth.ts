import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import type { AppRole } from '@/types/database'

async function fetchProfileAndRole(userId: string) {
  const [profileResult, roleResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single(),
    supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single(),
  ])

  return {
    profile: profileResult.data ?? null,
    role: (roleResult.data?.role as AppRole) ?? null,
  }
}

export function useAuth() {
  const {
    session,
    user,
    profile,
    role,
    loading,
    setSession,
    setProfile,
    setRole,
    setLoading,
    reset,
  } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)

      if (session?.user) {
        fetchProfileAndRole(session.user.id).then(({ profile, role }) => {
          setProfile(profile)
          setRole(role)
          setLoading(false)
        })
      } else {
        setLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)

      if (session?.user) {
        fetchProfileAndRole(session.user.id).then(({ profile, role }) => {
          setProfile(profile)
          setRole(role)
          setLoading(false)
        })
      } else {
        reset()
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [setSession, setProfile, setRole, setLoading, reset])

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  async function signUp(email: string, password: string, fullName: string) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    })
    if (error) throw error
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    reset()
  }

  async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
  }

  return {
    session,
    user,
    profile,
    role,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }
}
