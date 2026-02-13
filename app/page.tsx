import Link from 'next/link'

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center p-4">
            <div className="max-w-4xl mx-auto text-center space-y-8">
                {/* Logo / Brand */}
                <div className="space-y-4">
                    <h1 className="text-7xl font-bold text-secondary-900 tracking-tight">
                        EZSTORAGE
                    </h1>
                    <div className="h-2 w-48 mx-auto bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"></div>
                    <p className="text-xl text-secondary-600 max-w-2xl mx-auto mt-6">
                        Professional Operations Management System for Logistics & Storage Excellence
                    </p>
                </div>

                {/* Feature Cards */}
                <div className="grid md:grid-cols-3 gap-6 mt-12">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-shadow">
                        <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h3 className="font-semibold text-lg mb-2">Real-time Analytics</h3>
                        <p className="text-secondary-600 text-sm">Track orders, revenue, and warehouse utilization in real-time</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-shadow">
                        <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 className="font-semibold text-lg mb-2">Smart Warehouse Management</h3>
                        <p className="text-secondary-600 text-sm">Efficiently manage storage units and inventory</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-shadow">
                        <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <h3 className="font-semibold text-lg mb-2">Role-based Access</h3>
                        <p className="text-secondary-600 text-sm">Secure authentication for admins, drivers, and warehouse staff</p>
                    </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex gap-4 justify-center mt-12">
                    <Link
                        href="/login"
                        className="px-8 py-4 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        Sign In to Dashboard
                    </Link>
                    <Link
                        href="/demo"
                        className="px-8 py-4 bg-white text-secondary-900 rounded-xl font-semibold hover:bg-secondary-50 transition-all border-2 border-secondary-200"
                    >
                        View Demo
                    </Link>
                </div>

                {/* Tech Stack Badge */}
                <div className="mt-16 pt-8 border-t border-secondary-200">
                    <p className="text-sm text-secondary-500 mb-3">Powered by</p>
                    <div className="flex items-center justify-center gap-6 text-secondary-400 text-sm">
                        <span>Next.js 15</span>
                        <span>•</span>
                        <span>Supabase</span>
                        <span>•</span>
                        <span>PostgreSQL</span>
                        <span>•</span>
                        <span>TypeScript</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
