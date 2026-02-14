'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { signIn } = useAuth()
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const { error } = await signIn(email, password)

        if (error) {
            setError(error.message || 'Failed to sign in')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100">
            <div className="w-full max-w-md p-8">
                {/* Logo and Title */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-secondary-900 mb-2">
                        EZSTORAGE
                    </h1>
                    <div className="w-24 h-1 bg-primary-500 mx-auto mb-4"></div>
                    <p className="text-secondary-600">Operations Management System</p>
                </div>

                {/* Login Card */}
                <div className="card p-8">
                    <h2 className="text-2xl font-semibold text-secondary-900 mb-6">
                        Sign In
                    </h2>

                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="you@example.com"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-secondary-700 mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="••••••••"
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    {/* Demo Mode */}
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-secondary-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-secondary-500">Demo Mode (No Auth)</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => router.push('/dashboard/admin')}
                            className="mt-4 w-full py-3 px-4 border-2 border-primary-500 text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                        >
                            🚀 Skip Login - Go to Dashboard
                        </button>
                    </div>

                    {/* Demo Credentials */}
                    <div className="mt-6 p-4 bg-primary-50 rounded-lg">
                        <p className="text-sm font-semibold text-secondary-700 mb-2">Test Credentials:</p>
                        <div className="text-xs text-secondary-600 space-y-1">
                            <p><strong>Email:</strong> admin@test.com</p>
                            <p><strong>Password:</strong> (set when creating user in Supabase)</p>
                            <p className="mt-2 text-primary-600">💡 See QUICK_SETUP.md for setup instructions</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-secondary-500 mt-6">
                    © 2026 EZSTORAGE. All rights reserved.
                </p>
            </div>
        </div>
    )
}
