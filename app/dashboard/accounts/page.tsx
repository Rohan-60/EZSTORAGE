'use client'

import { useState } from 'react'
import { formatCurrency, formatDate, getStatusColor, cn } from '@/lib/utils'
import { usePayments, useUpdatePayment } from '@/lib/hooks/useSupabase'
import toast from 'react-hot-toast'

export default function AccountsPanel() {
    const [selectedStatus, setSelectedStatus] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')

    // Fetch data
    const { data: allPayments, isLoading } = usePayments()

    // Mutations
    const updatePaymentMutation = useUpdatePayment()

    // Filter payments
    let filteredPayments = allPayments || []
    if (selectedStatus !== 'all') {
        filteredPayments = filteredPayments.filter((p: any) => p.status === selectedStatus)
    }
    if (searchQuery) {
        filteredPayments = filteredPayments.filter((p: any) =>
            p.payment_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.customer?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.customer?.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }

    // Calculate stats
    const stats = {
        outstanding: allPayments?.filter((p: any) => p.status === 'pending')
            .reduce((sum: number, p: any) => sum + (p.total_amount || 0), 0) || 0,
        received: allPayments?.filter((p: any) => p.status === 'completed')
            .reduce((sum: number, p: any) => sum + (p.total_amount || 0), 0) || 0,
        pending: allPayments?.filter((p: any) => p.status === 'processing')
            .reduce((sum: number, p: any) => sum + (p.total_amount || 0), 0) || 0,
        total: allPayments?.reduce((sum: number, p: any) => sum + (p.total_amount || 0), 0) || 0,
    }

    // Overdue payments (pending for more than 30 days)
    const overduePayments = allPayments?.filter((p: any) => {
        if (p.status !== 'pending') return false
        const daysDiff = Math.floor((new Date().getTime() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24))
        return daysDiff > 30
    }).map((p: any) => ({
        ...p,
        daysOverdue: Math.floor((new Date().getTime() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24))
    })) || []

    const handleUpdatePaymentStatus = async (paymentId: string, newStatus: string) => {
        try {
            await updatePaymentMutation.mutateAsync({
                id: paymentId,
                updates: { status: newStatus },
            })
            toast.success('Payment status updated!')
        } catch (error: any) {
            toast.error(error.message || 'Failed to update payment')
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                    <p className="mt-4 text-secondary-600">Loading payment data...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-secondary-900">Accounts & Payments</h2>
                <p className="text-secondary-600 mt-1">Financial tracking and invoice management</p>
            </div>

            {/* Payment Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card">
                    <p className="text-secondary-600 text-sm mb-1">Outstanding</p>
                    <p className="text-2xl font-bold text-error">{formatCurrency(stats.outstanding)}</p>
                </div>
                <div className="card">
                    <p className="text-secondary-600 text-sm mb-1">Received (Total)</p>
                    <p className="text-2xl font-bold text-success">{formatCurrency(stats.received)}</p>
                </div>
                <div className="card">
                    <p className="text-secondary-600 text-sm mb-1">Processing</p>
                    <p className="text-2xl font-bold text-warning">{formatCurrency(stats.pending)}</p>
                </div>
                <div className="card">
                    <p className="text-secondary-600 text-sm mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-primary-600">{formatCurrency(stats.total)}</p>
                </div>
            </div>

            {/* Overdue Payments Alert */}
            {overduePayments.length > 0 && (
                <div className="card bg-red-50 border-2 border-error">
                    <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-error flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div className="flex-1">
                            <h3 className="font-semibold text-error mb-2">Overdue Payments Alert</h3>
                            <div className="space-y-2">
                                {overduePayments.map((payment: any) => (
                                    <div key={payment.id} className="flex justify-between items-center bg-white rounded-lg p-3">
                                        <div>
                                            <p className="font-medium text-secondary-900">
                                                {payment.customer?.first_name} {payment.customer?.last_name}
                                            </p>
                                            <p className="text-sm text-secondary-600">{payment.daysOverdue} days overdue</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-error">{formatCurrency(payment.total_amount || 0)}</p>
                                            <p className="text-xs text-secondary-500">Due: {formatDate(payment.created_at)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Payment Methods Chart - Calculated from data */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">Payment Methods</h3>
                    <div className="space-y-3">
                        {['online', 'card', 'bank_transfer', 'cash'].map((method) => {
                            const count = allPayments?.filter((p: any) => p.payment_method === method).length || 0
                            const total = allPayments?.length || 1
                            const percentage = Math.round((count / total) * 100)
                            return (
                                <div key={method}>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm text-secondary-600 capitalize">{method.replace('_', ' ')}</span>
                                        <span className="text-sm font-semibold">{percentage}%</span>
                                    </div>
                                    <div className="h-2 bg-secondary-100 rounded-full">
                                        <div
                                            className={cn(
                                                'h-full rounded-full',
                                                method === 'online' && 'bg-primary-500',
                                                method === 'card' && 'bg-success',
                                                method === 'bank_transfer' && 'bg-info',
                                                method === 'cash' && 'bg-warning'
                                            )}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="card lg:col-span-2">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">Quick Actions</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                        <button
                            onClick={() => toast.success('Invoice generation coming soon!')}
                            className="btn btn-primary flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Generate Invoice
                        </button>
                        <button
                            onClick={() => toast.success('Report export coming soon!')}
                            className="btn btn-secondary flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Export Report
                        </button>
                        <button
                            onClick={() => toast.success('Refund processing coming soon!')}
                            className="btn btn-secondary flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                            Process Refund
                        </button>
                        <button
                            onClick={() => toast.success('Email reminders sent!')}
                            className="btn btn-secondary flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            Send Reminders
                        </button>
                    </div>
                </div>
            </div>

            {/* Payments Table */}
            <div className="card">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-secondary-900">Recent Transactions</h3>
                    <div className="flex gap-2">
                        <select
                            className="input py-2 text-sm"
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="processing">Processing</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Search..."
                            className="input py-2 text-sm w-64"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr className="table-header">
                                <th className="table-cell text-left font-semibold text-secondary-700">Payment ID</th>
                                <th className="table-cell text-left font-semibold text-secondary-700">Customer</th>
                                <th className="table-cell text-left font-semibold text-secondary-700">Status</th>
                                <th className="table-cell text-left font-semibold text-secondary-700">Method</th>
                                <th className="table-cell text-left font-semibold text-secondary-700">Date</th>
                                <th className="table-cell text-right font-semibold text-secondary-700">Amount</th>
                                <th className="table-cell text-right font-semibold text-secondary-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPayments.length > 0 ? filteredPayments.map((payment: any) => (
                                <tr key={payment.id} className="table-row">
                                    <td className="table-cell font-medium text-primary-600">{payment.payment_number}</td>
                                    <td className="table-cell text-secondary-900">
                                        {payment.customer?.first_name} {payment.customer?.last_name}
                                    </td>
                                    <td className="table-cell">
                                        <span className={cn('badge capitalize', getStatusColor(payment.status))}>
                                            {payment.status}
                                        </span>
                                    </td>
                                    <td className="table-cell">
                                        {payment.payment_method ? (
                                            <span className="capitalize text-secondary-700">{payment.payment_method.replace('_', ' ')}</span>
                                        ) : (
                                            <span className="text-secondary-400">-</span>
                                        )}
                                    </td>
                                    <td className="table-cell text-secondary-600">{formatDate(payment.created_at)}</td>
                                    <td className="table-cell text-right font-medium text-secondary-900">
                                        {formatCurrency(payment.total_amount || 0)}
                                    </td>
                                    <td className="table-cell text-right">
                                        {payment.status === 'pending' && (
                                            <button
                                                onClick={() => handleUpdatePaymentStatus(payment.id, 'completed')}
                                                className="text-success hover:text-green-700 text-sm font-medium"
                                                disabled={updatePaymentMutation.isPending}
                                            >
                                                Mark Paid
                                            </button>
                                        )}
                                        {payment.status === 'processing' && (
                                            <button
                                                onClick={() => handleUpdatePaymentStatus(payment.id, 'completed')}
                                                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                                                disabled={updatePaymentMutation.isPending}
                                            >
                                                Complete
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="table-cell text-center py-8 text-secondary-500">
                                        No payments found
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
