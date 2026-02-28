'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useJobs, useDeleteJob } from '@/lib/hooks/useSupabase'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
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

export default function JobsPage() {
    const [search, setSearch] = useState('')
    const [filterVendor, setFilterVendor] = useState('all')
    const [filterType, setFilterType] = useState('all')

    const { data: jobs, isLoading } = useJobs()
    const deleteJob = useDeleteJob()
    const { userRole } = useAuth()

    const isAdmin = userRole === 'admin'
    const isStaff = !['admin', 'operations_manager'].includes(userRole || '')

    const filtered = (jobs || []).filter((j: any) => {
        const q = search.toLowerCase()
        const matchSearch = !search ||
            j.job_number?.toLowerCase().includes(q) ||
            `${j.customer?.first_name} ${j.customer?.last_name}`.toLowerCase().includes(q) ||
            j.pickup_address?.toLowerCase().includes(q)
        const matchVendor = filterVendor === 'all' || j.assigned_vendor === filterVendor
        const matchType = filterType === 'all' || j.job_type === filterType
        return matchSearch && matchVendor && matchType
    })

    const handleDelete = async (id: string, num: string) => {
        if (!confirm(`Delete job ${num}? This cannot be undone.`)) return
        try {
            await deleteJob.mutateAsync(id)
            toast.success('Job deleted')
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-secondary-900">Jobs</h2>
                    <p className="text-secondary-500 mt-1">{filtered.length} job{filtered.length !== 1 ? 's' : ''}</p>
                </div>
                {!isStaff && (
                    <Link href="/dashboard/jobs/new" className="btn btn-primary flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Job
                    </Link>
                )}
            </div>

            {/* Filters */}
            <div className="card p-4">
                <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-64">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search jobs..."
                            className="input pl-10"
                        />
                    </div>
                    <select value={filterVendor} onChange={e => setFilterVendor(e.target.value)} className="input w-auto">
                        <option value="all">All Vendors</option>
                        <option value="Jean">Jean</option>
                        <option value="GSX">GSX</option>
                        <option value="MoveMove">MoveMove</option>
                        <option value="Other">Other</option>
                    </select>
                    <select value={filterType} onChange={e => setFilterType(e.target.value)} className="input w-auto">
                        <option value="all">All Types</option>
                        <option value="Move">Move</option>
                        <option value="Store">Store</option>
                        <option value="Dispose">Dispose</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr className="table-header">
                                <th className="table-cell font-semibold text-secondary-700">Job #</th>
                                <th className="table-cell font-semibold text-secondary-700">Customer</th>
                                <th className="table-cell font-semibold text-secondary-700">Type</th>
                                <th className="table-cell font-semibold text-secondary-700">Vendor</th>
                                <th className="table-cell font-semibold text-secondary-700">Status</th>
                                <th className="table-cell font-semibold text-secondary-700">Pickup</th>
                                <th className="table-cell font-semibold text-secondary-700 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length > 0 ? filtered.map((job: any) => {
                                const col = KANBAN_LABELS[job.kanban_column] || { label: job.kanban_column, color: 'bg-gray-100 text-gray-800' }
                                const vendorColor = VENDOR_COLORS[job.assigned_vendor] || VENDOR_COLORS.Other
                                return (
                                    <tr key={job.id} className="table-row">
                                        <td className="table-cell font-medium text-primary-600">{job.job_number}</td>
                                        <td className="table-cell">
                                            <p className="font-medium text-secondary-900">
                                                {job.customer?.first_name} {job.customer?.last_name}
                                            </p>
                                            <p className="text-xs text-secondary-400">{job.customer?.phone}</p>
                                        </td>
                                        <td className="table-cell">
                                            <span className="badge badge-primary">{job.job_type}</span>
                                        </td>
                                        <td className="table-cell">
                                            <span className={`badge ${vendorColor}`}>{job.assigned_vendor}</span>
                                        </td>
                                        <td className="table-cell">
                                            <span className={`badge ${col.color}`}>{col.label}</span>
                                        </td>
                                        <td className="table-cell text-secondary-600">
                                            {job.pickup_timing ? new Date(job.pickup_timing).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                                        </td>
                                        <td className="table-cell text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/dashboard/jobs/${job.id}`} className="text-primary-600 hover:text-primary-800 text-sm font-medium">View</Link>
                                                {!isStaff && (
                                                    <Link href={`/dashboard/jobs/${job.id}/edit`} className="text-secondary-600 hover:text-secondary-900 text-sm font-medium">Edit</Link>
                                                )}
                                                {isAdmin && (
                                                    <button onClick={() => handleDelete(job.id, job.job_number)} className="text-red-500 hover:text-red-700 text-sm font-medium" disabled={deleteJob.isPending}>
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            }) : (
                                <tr>
                                    <td colSpan={7} className="table-cell text-center py-16 text-secondary-400">
                                        <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                        </svg>
                                        {search || filterVendor !== 'all' || filterType !== 'all' ? 'No jobs match your filters' : 'No jobs yet. Create your first one!'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
