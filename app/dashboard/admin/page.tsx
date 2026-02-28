'use client'

import Link from 'next/link'
import { formatCurrency, formatDate, getStatusColor, cn } from '@/lib/utils'
import { useDashboardStats, useOrders, useWarehouses, useJobStats } from '@/lib/hooks/useSupabase'

export default function AdminDashboard() {
    // Fetch real data from Supabase
    const { data: stats, isLoading: statsLoading } = useDashboardStats()
    const { data: orders, isLoading: ordersLoading } = useOrders()
    const { data: warehouses, isLoading: warehousesLoading } = useWarehouses()
    const { data: jobStats } = useJobStats()

    // Calculate order counts by status
    const ordersByStatus = orders ? [
        { status: 'Pending', count: orders.filter((o: any) => o.status === 'pending').length, color: 'bg-yellow-500' },
        { status: 'Scheduled', count: orders.filter((o: any) => o.status === 'scheduled').length, color: 'bg-purple-500' },
        { status: 'In Transit', count: orders.filter((o: any) => o.status === 'in_transit').length, color: 'bg-indigo-500' },
        { status: 'Completed', count: orders.filter((o: any) => o.status === 'completed').length, color: 'bg-green-500' },
    ] : []

    const totalOrders = ordersByStatus.reduce((sum, item) => sum + item.count, 0)

    // Recent orders (last 5)
    const recentOrders = orders?.slice(0, 5) || []

    // KPI Cards
    const kpiData = [
        {
            title: 'Total Revenue (Month)',
            value: stats ? formatCurrency(stats.totalRevenue) : '$0.00',
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
            value: stats?.activeOrders.toString() || '0',
            change: `+${stats?.activeOrders || 0}`,
            positive: true,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            ),
        },
        {
            title: 'Warehouse Utilization',
            value: `${stats?.warehouseUtilization || 0}%`,
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
            value: `${stats?.activeDrivers || 0}/12`,
            change: '4 available',
            positive: false,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
            ),
        },
    ]

    if (statsLoading || ordersLoading || warehousesLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                    <p className="mt-4 text-secondary-600">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Phase 1 Job Stats */}
            <div>
                <h3 className="text-sm font-semibold text-secondary-500 uppercase tracking-wider mb-3">Job Pipeline</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/dashboard/jobs" className="card card-hover flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-200 transition-colors">
                            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs text-secondary-500 mb-0.5">Outstanding Jobs</p>
                            <p className="text-3xl font-bold text-secondary-900">{jobStats?.outstanding ?? '—'}</p>
                        </div>
                    </Link>
                    <Link href="/dashboard/kanban" className="card card-hover flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition-colors">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs text-secondary-500 mb-0.5">Completed This Week</p>
                            <p className="text-3xl font-bold text-secondary-900">{jobStats?.completedThisWeek ?? '—'}</p>
                        </div>
                    </Link>
                    <Link href="/dashboard/kanban" className="card card-hover flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs text-secondary-500 mb-0.5">Completed This Month</p>
                            <p className="text-3xl font-bold text-secondary-900">{jobStats?.completedThisMonth ?? '—'}</p>
                        </div>
                    </Link>
                </div>
            </div>

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
                                        style={{ width: totalOrders > 0 ? `${(item.count / totalOrders) * 100}%` : '0%' }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Warehouse Capacity */}
                <div className="card lg:col-span-2">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">Warehouse Capacity</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        {(warehouses || []).map((warehouse: any, index) => {
                            const percentage = warehouse.total_units > 0
                                ? Math.round((warehouse.occupied_units / warehouse.total_units) * 100)
                                : 0
                            return (
                                <div key={index} className="space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-secondary-900">{warehouse.name}</p>
                                            <p className="text-sm text-secondary-600 mt-1">
                                                {warehouse.occupied_units} / {warehouse.total_units} units
                                            </p>
                                        </div>
                                        <span className="text-2xl font-bold text-primary-600">{percentage}%</span>
                                    </div>
                                    <div className="h-3 bg-secondary-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
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
                            {recentOrders.map((order: any) => (
                                <tr key={order.id} className="table-row">
                                    <td className="table-cell font-medium text-primary-600">{order.order_number}</td>
                                    <td className="table-cell text-secondary-900">
                                        {order.customer?.first_name} {order.customer?.last_name}
                                    </td>
                                    <td className="table-cell">
                                        <span className="badge badge-primary capitalize">{order.job_type}</span>
                                    </td>
                                    <td className="table-cell">
                                        <span className={cn('badge capitalize', getStatusColor(order.status))}>
                                            {order.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="table-cell text-secondary-600">{formatDate(order.scheduled_date)}</td>
                                    <td className="table-cell text-right font-medium text-secondary-900">
                                        {formatCurrency(order.service_fee || 0)}
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
