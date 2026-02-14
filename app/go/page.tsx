'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DirectAccessPage() {
    const router = useRouter()

    useEffect(() => {
        // Immediate redirect - no auth checks
        router.push('/dashboard/admin')
    }, [router])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                <p className="text-xl font-semibold text-gray-700">Redirecting to dashboard...</p>
                <p className="text-sm text-gray-500 mt-2">If not redirected, <a href="/dashboard/admin" className="text-blue-600 underline">click here</a></p>
            </div>
        </div>
    )
}
