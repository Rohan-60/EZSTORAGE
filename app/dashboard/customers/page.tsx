'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCustomers, useDeleteCustomer } from '@/lib/hooks/useSupabase'
import { useAuth } from '@/contexts/AuthContext'
import { formatDate, cn } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function CustomersPage() {
    const [search, setSearch] = useState('')
    const { data: customers, isLoading } = useCustomers()
    const deleteCustomer = useDeleteCustomer()
    const { userRole } = useAuth()

    const isAdmin = userRole === 'admin'
    const isStaff = !['admin', 'operations_manager'].includes(userRole || '')

    const filtered = (customers || []).filter((c: any) => {
        if (!search) return true
        const q = search.toLowerCase()
        return (
            `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
            c.phone?.toLowerCase().includes(q) ||
            c.email?.toLowerCase().includes(q)
        )
    })

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete customer "${name}"? This cannot be undone.`)) return
        try {
            await deleteCustomer.mutateAsync(id)
            toast.success('Customer deleted')
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-secondary-900">Customers</h2>
                    <p className="text-secondary-500 mt-1">{filtered.length} customer{filtered.length !== 1 ? 's' : ''}</p>
                </div>
                {!isStaff && (
                    <Link href="/dashboard/customers/new" className="btn btn-primary flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Customer
                    </Link>
                )}
            </div>

            {/* Search */}
            <div className="card p-4">
                <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
                    </svg>
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name, phone, or email..."
                        className="input pl-10"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr className="table-header">
                                <th className="table-cell font-semibold text-secondary-700">Name</th>
                                <th className="table-cell font-semibold text-secondary-700">Phone</th>
                                <th className="table-cell font-semibold text-secondary-700">Email</th>
                                <th className="table-cell font-semibold text-secondary-700">Created</th>
                                <th className="table-cell font-semibold text-secondary-700 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length > 0 ? filtered.map((customer: any) => (
                                <tr key={customer.id} className="table-row">
                                    <td className="table-cell">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                                                <span className="text-primary-700 font-semibold text-sm">
                                                    {customer.first_name?.charAt(0)}{customer.last_name?.charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-secondary-900">
                                                    {customer.first_name} {customer.last_name}
                                                </p>
                                                <p className="text-xs text-secondary-400">{customer.customer_code}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="table-cell text-secondary-700">{customer.phone}</td>
                                    <td className="table-cell text-secondary-600">{customer.email || '—'}</td>
                                    <td className="table-cell text-secondary-500">{formatDate(customer.created_at)}</td>
                                    <td className="table-cell text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/dashboard/customers/${customer.id}`}
                                                className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                                            >
                                                View
                                            </Link>
                                            {!isStaff && (
                                                <Link
                                                    href={`/dashboard/customers/${customer.id}/edit`}
                                                    className="text-secondary-600 hover:text-secondary-900 text-sm font-medium"
                                                >
                                                    Edit
                                                </Link>
                                            )}
                                            {isAdmin && (
                                                <button
                                                    onClick={() => handleDelete(customer.id, `${customer.first_name} ${customer.last_name}`)}
                                                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                                                    disabled={deleteCustomer.isPending}
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="table-cell text-center py-16 text-secondary-400">
                                        <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {search ? 'No customers match your search' : 'No customers yet. Add your first one!'}
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
