'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCustomers, useJobsByCustomer, useDeleteCustomer } from '@/lib/hooks/useSupabase'
import { useAuth } from '@/contexts/AuthContext'
import { formatDate, cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const KANBAN_LABELS: Record<string, { label: string; color: string }> = {
    confirmation_details: { label: 'Confirmation Details', color: 'bg-blue-100 text-blue-800' },
    packing: { label: 'Packing', color: 'bg-purple-100 text-purple-800' },
    moving: { label: 'Moving', color: 'bg-yellow-100 text-yellow-800' },
    storage: { label: 'Storage', color: 'bg-orange-100 text-orange-800' },
    extraction: { label: 'Extraction', color: 'bg-red-100 text-red-800' },
    move_out: { label: 'Move Out', color: 'bg-green-100 text-green-800' },
}

export default function CustomerProfilePage() {
    const { id } = useParams<{ id: string }>()
    const router = useRouter()
    const { userRole } = useAuth()

    const { data: customers, isLoading } = useCustomers()
    const { data: jobs, isLoading: jobsLoading } = useJobsByCustomer(id)
    const deleteCustomer = useDeleteCustomer()

    const customer = customers?.find((c: any) => c.id === id)
    const isAdmin = userRole === 'admin'
    const isStaff = !['admin', 'operations_manager'].includes(userRole || '')

    const handleDelete = async () => {
        if (!confirm('Delete this customer? This cannot be undone.')) return
        try {
            await deleteCustomer.mutateAsync(id)
            toast.success('Customer deleted')
            router.push('/dashboard/customers')
        } catch (e: any) {
            toast.error(e.message || 'Failed to delete customer')
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
            </div>
        )
    }

    if (!customer) {
        return (
            <div className="text-center py-24">
                <p className="text-secondary-500 text-lg">Customer not found.</p>
                <Link href="/dashboard/customers" className="text-primary-600 hover:underline mt-2 inline-block">
                    ← Back to Customers
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/customers" className="p-2 rounded-lg hover:bg-secondary-100 transition-colors">
                        <svg className="w-5 h-5 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-primary-700 font-bold text-lg">
                                {customer.first_name?.charAt(0)}{customer.last_name?.charAt(0)}
                            </span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-secondary-900">
                                {customer.first_name} {customer.last_name}
                            </h2>
                            <p className="text-secondary-400 text-sm">{customer.customer_code}</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    {!isStaff && (
                        <Link href={`/dashboard/customers/${id}/edit`} className="btn btn-secondary flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                        </Link>
                    )}
                    {isAdmin && (
                        <button onClick={handleDelete} className="btn btn-danger flex items-center gap-2" disabled={deleteCustomer.isPending}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                        </button>
                    )}
                </div>
            </div>

            {/* Customer Info Card */}
            <div className="card">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">Contact Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-xs text-secondary-400 uppercase tracking-wide mb-1">Phone</p>
                        <p className="text-secondary-900 font-medium">{customer.phone}</p>
                    </div>
                    <div>
                        <p className="text-xs text-secondary-400 uppercase tracking-wide mb-1">Email</p>
                        <p className="text-secondary-700">{customer.email || '—'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-secondary-400 uppercase tracking-wide mb-1">Address</p>
                        <p className="text-secondary-700">
                            {customer.address_line1}
                            {customer.address_line2 && `, ${customer.address_line2}`}
                        </p>
                        <p className="text-secondary-700">{customer.city} {customer.postal_code}</p>
                    </div>
                    <div>
                        <p className="text-xs text-secondary-400 uppercase tracking-wide mb-1">Status</p>
                        <span className={cn('badge', customer.is_active ? 'badge-success' : 'badge-error')}>
                            {customer.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    <div>
                        <p className="text-xs text-secondary-400 uppercase tracking-wide mb-1">Customer Since</p>
                        <p className="text-secondary-700">{formatDate(customer.created_at)}</p>
                    </div>
                    {customer.notes && (
                        <div className="md:col-span-2">
                            <p className="text-xs text-secondary-400 uppercase tracking-wide mb-1">Notes</p>
                            <p className="text-secondary-700">{customer.notes}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Job History */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-secondary-900">
                        Job History
                        <span className="ml-2 text-sm font-normal text-secondary-400">({jobs?.length || 0} jobs)</span>
                    </h3>
                    {!isStaff && (
                        <Link
                            href={`/dashboard/jobs/new?customer_id=${id}`}
                            className="btn btn-primary text-sm flex items-center gap-1"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            New Job
                        </Link>
                    )}
                </div>
                {jobsLoading ? (
                    <div className="py-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500" />
                    </div>
                ) : jobs && jobs.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr className="table-header">
                                    <th className="table-cell font-semibold text-secondary-700">Job #</th>
                                    <th className="table-cell font-semibold text-secondary-700">Type</th>
                                    <th className="table-cell font-semibold text-secondary-700">Vendor</th>
                                    <th className="table-cell font-semibold text-secondary-700">Status</th>
                                    <th className="table-cell font-semibold text-secondary-700">Pickup</th>
                                    <th className="table-cell font-semibold text-secondary-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(jobs as any[]).map((job: any) => {
                                    const col = KANBAN_LABELS[job.kanban_column] || { label: job.kanban_column, color: 'bg-gray-100 text-gray-800' }
                                    return (
                                        <tr key={job.id} className="table-row">
                                            <td className="table-cell font-medium text-primary-600">{job.job_number}</td>
                                            <td className="table-cell">{job.job_type}</td>
                                            <td className="table-cell">{job.assigned_vendor}</td>
                                            <td className="table-cell">
                                                <span className={`badge ${col.color}`}>{col.label}</span>
                                            </td>
                                            <td className="table-cell text-secondary-600">
                                                {job.pickup_timing ? new Date(job.pickup_timing).toLocaleDateString() : '—'}
                                            </td>
                                            <td className="table-cell">
                                                <Link href={`/dashboard/jobs/${job.id}`} className="text-primary-600 hover:underline text-sm">
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-10 text-secondary-400">
                        <svg className="w-10 h-10 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        No jobs yet for this customer.
                    </div>
                )}
            </div>
        </div>
    )
}
