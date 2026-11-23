import { useState, useEffect } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
}

interface Profile {
  id: string
  user_id: string
  email: string
  full_name: string | null
  has_connected_bank: boolean
  created_at: string
  updated_at: string
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true
  })
  
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  // Fetch profile from database when user changes
  useEffect(() => {
    const fetchProfile = async () => {
      if (!authState.user?.id) {
        setProfile(null)
        return
      }

      setProfileLoading(true)
      try {
        const userId = authState.user.id
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .limit(1)
          .maybeSingle()

        if (error) {
          console.error('Error fetching profile:', error)
          setProfile(null)
        } else if (data) {
          setProfile(data)
        } else {
          const { data: created, error: insertError } = await supabase
            .from('profiles')
            .insert({
              user_id: userId,
              email: authState.user.email,
              full_name:
                authState.user.user_metadata?.full_name ||
                authState.user.user_metadata?.name ||
                authState.user.email?.split('@')[0] ||
                null,
            })
            .select('*')
            .maybeSingle()
          if (insertError) {
            console.error('Error creating profile:', insertError)
            setProfile(null)
          } else {
            setProfile(created)
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        setProfile(null)
      } finally {
        setProfileLoading(false)
      }
    }

    fetchProfile()
  }, [authState.user?.id])

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      setAuthState({
        user: session?.user ?? null,
        session: session,
        loading: false
      })
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id)
        
        setAuthState({
          user: session?.user ?? null,
          session: session,
          loading: false
        })

        // Store access token for API calls
        if (session?.access_token) {
          localStorage.setItem('auth_token', session.access_token)
        } else {
          localStorage.removeItem('auth_token')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  const signUp = async (email: string, password: string, userData?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    localStorage.removeItem('auth_token')
    return { error }
  }

  const signInWithOAuth = async (provider: 'google' | 'apple') => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    })
    return { data, error }
  }

  const refreshProfile = async () => {
    if (!authState.user?.id) return null
    
    try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', authState.user.id)
          .limit(1)
          .maybeSingle()

      if (error) {
        console.error('Error refreshing profile:', error)
        return null
      } else {
        console.log('Profile refreshed successfully:', data)
        setProfile(data)
        return data
      }
    } catch (error) {
      console.error('Error refreshing profile:', error)
      return null
    }
  }

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    signInWithOAuth,
    profile,
    profileLoading,
    refreshProfile
  }
}