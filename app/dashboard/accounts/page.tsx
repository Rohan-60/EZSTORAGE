'use client'

import { formatCurrency, formatDate, getStatusColor, cn } from '@/lib/utils'

export default function AccountsPanel() {
    const paymentStats = [
        { label: 'Outstanding', value: formatCurrency(4850), color: 'text-error' },
        { label: 'Received (Month)', value: formatCurrency(45200), color: 'text-success' },
        { label: 'Pending', value: formatCurrency(2340), color: 'text-warning' },
        { label: 'Total Revenue', value: formatCurrency(145850), color: 'text-primary-600' },
    ]

    const payments = [
        { id: 'PAY-2026-0123', customer: 'John Tan', type: 'Monthly Rental', amount: 194.40, status: 'completed', date: '2026-02-10', method: 'online' },
        { id: 'PAY-2026-0122', customer: 'Mary Lim', type: 'Monthly Rental', amount: 302.40, status: 'pending', date: '2026-02-13', method: null },
        { id: 'PAY-2026-0121', customer: 'Sarah Ng', type: 'Order Fee', amount: 129.60, status: 'completed', date: '2026-02-10', method: 'card' },
        { id: 'PAY-2026-0120', customer: 'David Wong', type: 'Deposit', amount: 540.00, status: 'completed', date: '2026-02-08', method: 'bank_transfer' },
        { id: 'PAY-2026-0119', customer: 'Michael Chen', type: 'Monthly Rental', amount: 280.00, status: 'processing', date: '2026-02-12', method: 'online' },
    ]

    const overduePayments = [
        { customer: 'Legacy Customer A', amount: 450.00, dueDate: '2026-02-01', daysOverdue: 12 },
        { customer: 'Legacy Customer B', amount: 280.00, dueDate: '2026-02-05', daysOverdue: 8 },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-secondary-900">Accounts & Payments</h2>
                <p className="text-secondary-600 mt-1">Financial tracking and invoice management</p>
            </div>

            {/* Payment Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {paymentStats.map((stat, index) => (
                    <div key={index} className="card">
                        <p className="text-secondary-600 text-sm mb-1">{stat.label}</p>
                        <p className={cn('text-2xl font-bold', stat.color)}>{stat.value}</p>
                    </div>
                ))}
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
                                {overduePayments.map((payment, index) => (
                                    <div key={index} className="flex justify-between items-center bg-white rounded-lg p-3">
                                        <div>
                                            <p className="font-medium text-secondary-900">{payment.customer}</p>
                                            <p className="text-sm text-secondary-600">{payment.daysOverdue} days overdue</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-error">{formatCurrency(payment.amount)}</p>
                                            <p className="text-xs text-secondary-500">Due: {formatDate(payment.dueDate)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Payment Breakdown Chart */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">Payment Methods</h3>
                    <div className="space-y-3">
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-secondary-600">Online</span>
                                <span className="text-sm font-semibold">45%</span>
                            </div>
                            <div className="h-2 bg-secondary-100 rounded-full">
                                <div className="h-full w-[45%] bg-primary-500 rounded-full" />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-secondary-600">Card</span>
                                <span className="text-sm font-semibold">30%</span>
                            </div>
                            <div className="h-2 bg-secondary-100 rounded-full">
                                <div className="h-full w-[30%] bg-success rounded-full" />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-secondary-600">Bank Transfer</span>
                                <span className="text-sm font-semibold">20%</span>
                            </div>
                            <div className="h-2 bg-secondary-100 rounded-full">
                                <div className="h-full w-[20%] bg-info rounded-full" />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-secondary-600">Cash</span>
                                <span className="text-sm font-semibold">5%</span>
                            </div>
                            <div className="h-2 bg-secondary-100 rounded-full">
                                <div className="h-full w-[5%] bg-warning rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="card lg:col-span-2">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">Quick Actions</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                        <button className="btn btn-primary flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Generate Invoice
                        </button>
                        <button className="btn btn-secondary flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Export Report
                        </button>
                        <button className="btn btn-secondary flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                            Process Refund
                        </button>
                        <button className="btn btn-secondary flex items-center justify-center gap-2">
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
                        <select className="input py-2 text-sm">
                            <option>All Status</option>
                            <option>Pending</option>
                            <option>Completed</option>
                            <option>Processing</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Search..."
                            className="input py-2 text-sm w-64"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr className="table-header">
                                <th className="table-cell text-left font-semibold text-secondary-700">Payment ID</th>
                                <th className="table-cell text-left font-semibold text-secondary-700">Customer</th>
                                <th className="table-cell text-left font-semibold text-secondary-700">Type</th>
                                <th className="table-cell text-left font-semibold text-secondary-700">Status</th>
                                <th className="table-cell text-left font-semibold text-secondary-700">Method</th>
                                <th className="table-cell text-left font-semibold text-secondary-700">Date</th>
                                <th className="table-cell text-right font-semibold text-secondary-700">Amount</th>
                                <th className="table-cell text-right font-semibold text-secondary-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map((payment) => (
                                <tr key={payment.id} className="table-row">
                                    <td className="table-cell font-medium text-primary-600">{payment.id}</td>
                                    <td className="table-cell text-secondary-900">{payment.customer}</td>
                                    <td className="table-cell text-secondary-600">{payment.type}</td>
                                    <td className="table-cell">
                                        <span className={cn('badge capitalize', getStatusColor(payment.status))}>
                                            {payment.status}
                                        </span>
                                    </td>
                                    <td className="table-cell">
                                        {payment.method ? (
                                            <span className="capitalize text-secondary-700">{payment.method.replace('_', ' ')}</span>
                                        ) : (
                                            <span className="text-secondary-400">-</span>
                                        )}
                                    </td>
                                    <td className="table-cell text-secondary-600">{formatDate(payment.date)}</td>
                                    <td className="table-cell text-right font-medium text-secondary-900">
                                        {formatCurrency(payment.amount)}
                                    </td>
                                    <td className="table-cell text-right">
                                        <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
