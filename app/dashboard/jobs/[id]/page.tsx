'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useJobs, useDeleteJob } from '@/lib/hooks/useSupabase'
import { useAuth } from '@/contexts/AuthContext'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

const KANBAN_LABELS: Record<string, { label: string; color: string }> = {
    confirmation_details: { label: 'Confirmation Details', color: 'bg-blue-100 text-blue-800' },
    packing: { label: 'Packing', color: 'bg-purple-100 text-purple-800' },
    moving: { label: 'Moving', color: 'bg-yellow-100 text-yellow-800' },
    storage: { label: 'Storage', color: 'bg-orange-100 text-orange-800' },
    extraction: { label: 'Extraction', color: 'bg-red-100 text-red-800' },
    move_out: { label: 'Move Out', color: 'bg-green-100 text-green-800' },
}

const VENDOR_COLORS: Record<string, string> = {
    Jean: 'bg-pink-100 text-pink-800',
    GSX: 'bg-indigo-100 text-indigo-800',
    MoveMove: 'bg-teal-100 text-teal-800',
    Other: 'bg-gray-100 text-gray-700',
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
    return (
        <div>
            <p className="text-xs text-secondary-400 uppercase tracking-wide mb-0.5">{label}</p>
            <p className="text-secondary-800">{value || '—'}</p>
        </div>
    )
}

export default function JobDetailPage() {
    const { id } = useParams<{ id: string }>()
    const router = useRouter()
    const { userRole } = useAuth()
    const { data: jobs, isLoading } = useJobs()
    const deleteJob = useDeleteJob()

    const job = jobs?.find((j: any) => j.id === id)
    const isAdmin = userRole === 'admin'
    const isStaff = !['admin', 'operations_manager'].includes(userRole || '')

    const handleDelete = async () => {
        if (!confirm('Delete this job? This cannot be undone.')) return
        try {
            await deleteJob.mutateAsync(id)
            toast.success('Job deleted')
            router.push('/dashboard/jobs')
        } catch (e: any) {
            toast.error(e.message || 'Failed to delete job')
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
            </div>
        )
    }

    if (!job) {
        return (
            <div className="text-center py-24">
                <p className="text-secondary-500 text-lg">Job not found.</p>
                <Link href="/dashboard/jobs" className="text-primary-600 hover:underline mt-2 inline-block">← Back to Jobs</Link>
            </div>
        )
    }

    const col = KANBAN_LABELS[job.kanban_column] || { label: job.kanban_column, color: 'bg-gray-100 text-gray-800' }
    const vendorColor = VENDOR_COLORS[job.assigned_vendor] || VENDOR_COLORS.Other

    const fmt = (dt?: string | null) => dt ? new Date(dt).toLocaleString('en-SG', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }) : null

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/jobs" className="p-2 rounded-lg hover:bg-secondary-100">
                        <svg className="w-5 h-5 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold text-secondary-900">{job.job_number}</h2>
                            <span className={`badge ${col.color}`}>{col.label}</span>
                            <span className={`badge ${vendorColor}`}>{job.assigned_vendor}</span>
                        </div>
                        <p className="text-secondary-400 text-sm mt-0.5">Created {formatDate(job.created_at)}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {!isStaff && (
                        <Link href={`/dashboard/jobs/${id}/edit`} className="btn btn-secondary flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                        </Link>
                    )}
                    {isAdmin && (
                        <button onClick={handleDelete} className="btn btn-danger flex items-center gap-2" disabled={deleteJob.isPending}>Delete</button>
                    )}
                </div>
            </div>

            {/* Customer */}
            <div className="card">
                <h3 className="font-semibold text-secondary-800 mb-4">Customer</h3>
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="font-bold text-primary-700">
                            {job.customer?.first_name?.charAt(0)}{job.customer?.last_name?.charAt(0)}
                        </span>
                    </div>
                    <div>
                        <p className="font-medium text-secondary-900">{job.customer?.first_name} {job.customer?.last_name}</p>
                        <p className="text-sm text-secondary-500">{job.customer?.phone} · {job.customer?.email || 'No email'}</p>
                    </div>
                    <Link href={`/dashboard/customers/${job.customer_id}`} className="ml-auto text-primary-600 hover:underline text-sm font-medium">
                        View Profile →
                    </Link>
                </div>
            </div>

            {/* Job Details */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="card space-y-4">
                    <h3 className="font-semibold text-secondary-800 border-b border-secondary-100 pb-2">Job Overview</h3>
                    <InfoRow label="Job Type" value={job.job_type} />
                    <InfoRow label="Size Plan" value={job.size_plan} />
                    <InfoRow label="Volume" value={job.volume} />
                    <InfoRow label="Storage Location" value={job.storage_location} />
                </div>

                <div className="card space-y-4">
                    <h3 className="font-semibold text-secondary-800 border-b border-secondary-100 pb-2">Pickup</h3>
                    <InfoRow label="Address" value={job.pickup_address} />
                    <InfoRow label="Date & Time" value={fmt(job.pickup_timing)} />
                </div>

                <div className="card space-y-4">
                    <h3 className="font-semibold text-secondary-800 border-b border-secondary-100 pb-2">Destination</h3>
                    <InfoRow label="Address" value={job.destination_address} />
                    <InfoRow label="Date & Time" value={fmt(job.destination_timing)} />
                    <InfoRow label="Stopover" value={job.stopover} />
                </div>

                {job.internal_notes && (
                    <div className="card">
                        <h3 className="font-semibold text-secondary-800 border-b border-secondary-100 pb-2 mb-4">Internal Notes</h3>
                        <p className="text-secondary-700 whitespace-pre-wrap">{job.internal_notes}</p>
                    </div>
                )}
            </div>
        </div>
    )
}
