'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface StaffInfo {
    id: string
    role: string
    staff_code: string
    first_name: string
    last_name: string
}

interface AuthContextType {
    user: User | null
    session: Session | null
    staff: StaffInfo | null
    userRole: string | null
    signIn: (email: string, password: string) => Promise<{ error: any }>
    signOut: () => Promise<void>
    loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [staff, setStaff] = useState<StaffInfo | null>(null)
    const [userRole, setUserRole] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    // Fetch staff info when user is authenticated
    const fetchStaffInfo = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('staff')
                .select('id, role, staff_code, first_name, last_name')
                .eq('auth_user_id', userId)
                .single()

            if (error) {
                console.error('Error fetching staff info:', error)
                return
            }

            if (data) {
                setStaff(data)
                setUserRole(data.role)
            }
        } catch (err) {
            console.error('Failed to fetch staff info:', err)
        }
    }

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchStaffInfo(session.user.id)
            }
            setLoading(false)
        })

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchStaffInfo(session.user.id)
            } else {
                setStaff(null)
                setUserRole(null)
            }
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    const signIn = async (email: string, password: string) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                return { error }
            }

            if (data.session) {
                setSession(data.session)
                setUser(data.user)

                // Skip staff query for now - just redirect to admin dashboard
                // The staff info will be fetched later by the useEffect
                console.log('Login successful! Redirecting to dashboard...')
                router.push('/dashboard/admin')
            }

            return { error: null }
        } catch (err) {
            console.error('Sign in failed:', err)
            return { error: err }
        }
    }

    const signOut = async () => {
        await supabase.auth.signOut()
        setUser(null)
        setSession(null)
        setStaff(null)
        setUserRole(null)
        router.push('/login')
    }

    const value = {
        user,
        session,
        staff,
        userRole,
        signIn,
        signOut,
        loading,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
