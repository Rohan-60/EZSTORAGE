'use client'

import { useState } from 'react'
import { formatCurrency, formatDate, getStatusColor, cn } from '@/lib/utils'

export default function AdminDashboard() {
    // Sample data - In production, fetch from Supabase
    const kpiData = [
        {
            title: 'Total Revenue (Month)',
            value: formatCurrency(145850),
            change: '+12.5%',
            positive: true,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
        {
            title: 'Active Orders',
            value: '24',
            change: '+8',
            positive: true,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            ),
        },
        {
            title: 'Warehouse Utilization',
            value: '78%',
            change: '+5%',
            positive: true,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
        },
        {
            title: 'Active Drivers',
            value: '8/12',
            change: '4 available',
            positive: false,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
            ),
        },
    ]

    const ordersByStatus = [
        { status: 'Pending', count: 8, color: 'bg-yellow-500' },
        { status: 'Scheduled', count: 12, color: 'bg-purple-500' },
        { status: 'In Transit', count: 4, color: 'bg-indigo-500' },
        { status: 'Completed', count: 156, color: 'bg-green-500' },
    ]

    const recentOrders = [
        { id: 'ORD-2026-0045', customer: 'John Tan', type: 'Pickup', status: 'scheduled', date: '2026-02-14', amount: 120 },
        { id: 'ORD-2026-0044', customer: 'Mary Lim', type: 'Delivery', status: 'in_transit', date: '2026-02-13', amount: 180 },
        { id: 'ORD-2026-0043', customer: 'David Wong', type: 'Both', status: 'completed', date: '2026-02-13', amount: 250 },
        { id: 'ORD-2026-0042', customer: 'Sarah Ng', type: 'Pickup', status: 'pending', date: '2026-02-15', amount: 120 },
        { id: 'ORD-2026-0041', customer: 'Michael Chen', type: 'Delivery', status: 'confirmed', date: '2026-02-14', amount: 150 },
    ]

    const warehouses = [
        { name: 'Tuas Mega Storage', total: 100, occupied: 82, percentage: 82 },
        { name: 'Changi Business Park', total: 75, occupied: 58, percentage: 77 },
        { name: 'Woodlands Industrial', total: 50, occupied: 35, percentage: 70 },
    ]

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiData.map((kpi, index) => (
                    <div key={index} className="card card-hover metric-card">
                        <div>
                            <p className="text-sm text-secondary-600 mb-1">{kpi.title}</p>
                            <p className="text-3xl font-bold text-secondary-900 mb-2">{kpi.value}</p>
                            <p className={cn(
                                'text-sm font-medium',
                                kpi.positive ? 'text-success' : 'text-secondary-500'
                            )}>
                                {kpi.change}
                            </p>
                        </div>
                        <div className="metric-icon bg-primary-100">
                            <div className="text-primary-600">
                                {kpi.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Revenue Chart Placeholder */}
                <div className="card lg:col-span-2">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">Revenue Trend (Last 6 Months)</h3>
                    <div className="h-64 bg-secondary-50 rounded-lg flex items-center justify-center border-2 border-dashed border-secondary-300">
                        <div className="text-center text-secondary-500">
                            <svg className="w-16 h-16 mx-auto mb-3 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <p className="font-medium">Revenue Chart (Recharts)</p>
                            <p className="text-sm mt-1">Install react query to fetch live data</p>
                        </div>
                    </div>
                </div>

                {/* Orders by Status */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-6">Orders by Status</h3>
                    <div className="space-y-4">
                        {ordersByStatus.map((item, index) => (
                            <div key={index}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-secondary-700">{item.status}</span>
                                    <span className="text-sm font-semibold text-secondary-900">{item.count}</span>
                                </div>
                                <div className="h-2 bg-secondary-100 rounded-full overflow-hidden">
                                    <div
                                        className={cn(item.color, 'h-full transition-all duration-300')}
                                        style={{ width: `${(item.count / 180) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Warehouse Capacity */}
            <div className="card">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">Warehouse Capacity</h3>
                <div className="grid md:grid-cols-3 gap-6">
                    {warehouses.map((warehouse, index) => (
                        <div key={index} className="space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-medium text-secondary-900">{warehouse.name}</p>
                                    <p className="text-sm text-secondary-600 mt-1">
                                        {warehouse.occupied} / {warehouse.total} units
                                    </p>
                                </div>
                                <span className="text-2xl font-bold text-primary-600">{warehouse.percentage}%</span>
                            </div>
                            <div className="h-3 bg-secondary-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300"
                                    style={{ width: `${warehouse.percentage}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Orders Table */}
            <div className="card">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-secondary-900">Recent Orders</h3>
                    <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                        View All →
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr className="table-header">
                                <th className="table-cell text-left font-semibold text-secondary-700">Order ID</th>
                                <th className="table-cell text-left font-semibold text-secondary-700">Customer</th>
                                <th className="table-cell text-left font-semibold text-secondary-700">Type</th>
                                <th className="table-cell text-left font-semibold text-secondary-700">Status</th>
                                <th className="table-cell text-left font-semibold text-secondary-700">Date</th>
                                <th className="table-cell text-right font-semibold text-secondary-700">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map((order) => (
                                <tr key={order.id} className="table-row">
                                    <td className="table-cell font-medium text-primary-600">{order.id}</td>
                                    <td className="table-cell text-secondary-900">{order.customer}</td>
                                    <td className="table-cell">
                                        <span className="badge badge-primary capitalize">{order.type}</span>
                                    </td>
                                    <td className="table-cell">
                                        <span className={cn('badge capitalize', getStatusColor(order.status))}>
                                            {order.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="table-cell text-secondary-600">{formatDate(order.date)}</td>
                                    <td className="table-cell text-right font-medium text-secondary-900">
                                        {formatCurrency(order.amount)}
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
