import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isRecovery, setIsRecovery] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true)
      }
      if (session) fetchProfile(session.user.id)
      else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data)
    setLoading(false)
  }

  async function signUp(username, email, phone, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      phone,
      options: {
        data: { username }
      }
    })
    if (error) throw error
    return data
  }

  async function signIn(username, password) {
    // Look up email by username
    const { data: prof, error: lookupError } = await supabase
      .from('profiles')
      .select('email')
      .eq('username', username)
      .single()

    if (lookupError || !prof) {
      throw new Error('Username not found')
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: prof.email,
      password,
    })
    if (error) throw error
    return data
  }

  async function resetPassword(usernameOrEmail) {
    let email = usernameOrEmail
    if (!usernameOrEmail.includes('@')) {
      const { data: prof, error: lookupError } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', usernameOrEmail)
        .single()
      if (lookupError || !prof) throw new Error('Username not found')
      email = prof.email
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
  }

  async function updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
    setIsRecovery(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
    setSession(null)
    setProfile(null)
  }

  async function deleteAccount() {
    if (!session) return
    const userId = session.user.id

    // Delete all user's posts
    const { error: postsError } = await supabase
      .from('posts')
      .delete()
      .eq('user_id', userId)
    if (postsError) throw postsError

    // Delete user's profile
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)
    if (profileError) throw profileError

    // Sign out
    await supabase.auth.signOut()
    setSession(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ session, profile, loading, isRecovery, signUp, signIn, signOut, deleteAccount, resetPassword, updatePassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
