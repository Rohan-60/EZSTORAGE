'use client'

import { formatDate, getStatusColor, cn } from '@/lib/utils'
import { useOrders, useUpdateOrder } from '@/lib/hooks/useSupabase'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

export default function DriverPanel() {
    const { user } = useAuth()
    const { data: allOrders, isLoading } = useOrders()
    const updateOrderMutation = useUpdateOrder()

    // Filter orders assigned to current driver (for demo, show all unassigned + in_transit orders)
    const todaysJobs = allOrders?.filter((o: any) =>
        o.status === 'scheduled' || o.status === 'in_transit'
    ) || []

    const completedJobs = allOrders?.filter((o: any) =>
        o.status === 'completed' &&
        new Date(o.updated_at).toDateString() === new Date().toDateString()
    ) || []

    // Stats
    const stats = {
        todaysJobs: todaysJobs.length,
        completed: completedJobs.length,
        status: todaysJobs.length > 0 ? 'On Duty' : 'Available',
    }

    const handleStartJob = async (orderId: string) => {
        try {
            await updateOrderMutation.mutateAsync({
                id: orderId,
                updates: { status: 'in_transit' },
            })
            toast.success('Job started! Status updated to In Transit')
        } catch (error: any) {
            toast.error(error.message || 'Failed to start job')
        }
    }

    const handleCompleteJob = async (orderId: string) => {
        try {
            await updateOrderMutation.mutateAsync({
                id: orderId,
                updates: { status: 'completed' },
            })
            toast.success('Job completed successfully!')
        } catch (error: any) {
            toast.error(error.message || 'Failed to complete job')
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                    <p className="mt-4 text-secondary-600">Loading your jobs...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h2 className="text-2xl font-bold text-secondary-900">Driver Dashboard</h2>
                <p className="text-secondary-600 mt-1">Today's Jobs - {user?.email?.split('@')[0] || 'Driver'}</p>
            </div>

            {/* Driver Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card bg-primary-50 border-2 border-primary-200">
                    <p className="text-primary-700 text-sm mb-1">Today's Jobs</p>
                    <p className="text-3xl font-bold text-primary-600">{stats.todaysJobs}</p>
                </div>
                <div className="card bg-green-50 border-2 border-green-200">
                    <p className="text-green-700 text-sm mb-1">Completed</p>
                    <p className="text-3xl font-bold text-success">{stats.completed}</p>
                </div>
                <div className="card bg-purple-50 border-2 border-purple-200">
                    <p className="text-purple-700 text-sm mb-1">Status</p>
                    <p className="text-xl font-bold text-purple-600">{stats.status}</p>
                </div>
                <div className="card bg-yellow-50 border-2 border-yellow-200">
                    <p className="text-yellow-700 text-sm mb-1">Vehicle</p>
                    <p className="text-xl font-bold text-yellow-700">SGX1234A</p>
                </div>
            </div>

            {/* Upcoming Jobs */}
            <div className="card">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">Upcoming Jobs</h3>
                <div className="space-y-4">
                    {todaysJobs.length > 0 ? todaysJobs.map((job: any) => (
                        <div
                            key={job.id}
                            className="border-2 border-secondary-200 rounded-xl p-5 hover:border-primary-300 transition-all"
                        >
                            {/* Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="font-bold text-lg text-secondary-900">{job.order_number}</p>
                                    <p className="text-secondary-600 mt-1">
                                        {job.customer?.first_name} {job.customer?.last_name}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className={cn('badge capitalize', getStatusColor(job.status))}>
                                        {job.status.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>

                            {/* Job Details */}
                            <div className="bg-secondary-50 rounded-lg p-4 space-y-3">
                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <div className="flex-1">
                                        <p className="text-sm text-secondary-600">Address</p>
                                        <p className="font-medium text-secondary-900">
                                            {job.pickup_address || job.delivery_address || 'Address not provided'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <p className="text-sm text-secondary-600">Scheduled Date</p>
                                        <p className="font-medium text-secondary-900">{formatDate(job.scheduled_date)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    <div>
                                        <p className="text-sm text-secondary-600">Job Type</p>
                                        <p className="font-medium text-secondary-900 capitalize">{job.job_type}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                {job.status === 'scheduled' && (
                                    <button
                                        onClick={() => handleStartJob(job.id)}
                                        className="btn btn-success flex items-center justify-center gap-2"
                                        disabled={updateOrderMutation.isPending}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Start Job
                                    </button>
                                )}
                                {job.status === 'in_transit' && (
                                    <button
                                        onClick={() => handleCompleteJob(job.id)}
                                        className="btn btn-success flex items-center justify-center gap-2"
                                        disabled={updateOrderMutation.isPending}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Complete Job
                                    </button>
                                )}
                                {job.customer?.phone && (
                                    <a
                                        href={`tel:${job.customer.phone}`}
                                        className="btn btn-primary flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        Call Customer
                                    </a>
                                )}
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-12 text-secondary-500">
                            <p>No jobs assigned for today</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Completed Jobs */}
            <div className="card">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">Completed Today</h3>
                <div className="space-y-2">
                    {completedJobs.length > 0 ? completedJobs.map((job: any) => (
                        <div
                            key={job.id}
                            className="border border-secondary-200 rounded-lg p-4 flex justify-between items-center"
                        >
                            <div>
                                <p className="font-medium text-secondary-900">{job.order_number}</p>
                                <p className="text-sm text-secondary-600 mt-1">
                                    {job.customer?.first_name} {job.customer?.last_name}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="badge badge-success">Completed</span>
                                <p className="text-xs text-secondary-600 mt-1">{formatDate(job.updated_at)}</p>
                            </div>
                        </div>
                    )) : (
                        <p className="text-sm text-secondary-500 text-center py-8">No completed jobs today</p>
                    )}
                </div>
            </div>

            {/* Upload Proof Section */}
            <div className="card bg-primary-50 border-2 border-primary-200">
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">Upload Proof of Delivery</h3>
                <p className="text-sm text-secondary-600 mb-4">
                    Take a photo of delivered items or signed receipt
                </p>
                <button className="btn btn-primary w-full flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Take Photo
                </button>
            </div>
        </div>
    )
}
