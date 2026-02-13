'use client'

import { useState } from 'react'
import { formatDate, getStatusColor, cn } from '@/lib/utils'

export default function OperationsPanel() {
    const [showCreateOrder, setShowCreateOrder] = useState(false)

    const orders = [
        { id: 'ORD-2026-0045', customer: 'John Tan', driver: 'Unassigned', status: 'pending', scheduled: '2026-02-14', type: 'pickup' },
        { id: 'ORD-2026-0044', customer: 'Mary Lim', driver: 'Driver One', status: 'scheduled', scheduled: '2026-02-13', type: 'delivery' },
        { id: 'ORD-2026-0043', customer: 'David Wong', driver: 'Driver Two', status: 'in_transit', scheduled: '2026-02-13', type: 'both' },
        { id: 'ORD-2026-0042', customer: 'Sarah Ng', driver: 'Unassigned', status: 'pending', scheduled: '2026-02-15', type: 'pickup' },
    ]

    const availableDrivers = [
        { id: 'STF-0004', name: 'Driver One', vehicle: 'SGX1234A', status: 'available' },
        { id: 'STF-0005', name: 'Driver Two', vehicle: 'SGX5678B', status: 'busy' },
        { id: 'STF-0006', name: 'Driver Three', vehicle: 'SGX9012C', status: 'available' },
    ]

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-secondary-900">Order Management</h2>
                    <p className="text-secondary-600 mt-1">Create, assign, and track pickup/delivery jobs</p>
                </div>
                <button
                    onClick={() => setShowCreateOrder(true)}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create New Order
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card">
                    <p className="text-secondary-600 text-sm mb-1">Pending</p>
                    <p className="text-3xl font-bold text-yellow-600">8</p>
                </div>
                <div className="card">
                    <p className="text-secondary-600 text-sm mb-1">Scheduled</p>
                    <p className="text-3xl font-bold text-purple-600">12</p>
                </div>
                <div className="card">
                    <p className="text-secondary-600 text-sm mb-1">In Transit</p>
                    <p className="text-3xl font-bold text-indigo-600">4</p>
                </div>
                <div className="card">
                    <p className="text-secondary-600 text-sm mb-1">Completed Today</p>
                    <p className="text-3xl font-bold text-success">6</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Orders List */}
                <div className="card lg:col-span-2">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">Active Orders</h3>

                    {/* Filters */}
                    <div className="flex gap-2 mb-4">
                        <button className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium">
                            All Orders
                        </button>
                        <button className="px-4 py-2 bg-secondary-100 text-secondary-700 rounded-lg text-sm font-medium hover:bg-secondary-200">
                            Pending
                        </button>
                        <button className="px-4 py-2 bg-secondary-100 text-secondary-700 rounded-lg text-sm font-medium hover:bg-secondary-200">
                            Scheduled
                        </button>
                        <button className="px-4 py-2 bg-secondary-100 text-secondary-700 rounded-lg text-sm font-medium hover:bg-secondary-200">
                            In Transit
                        </button>
                    </div>

                    <div className="space-y-3">
                        {orders.map((order) => (
                            <div key={order.id} className="border border-secondary-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="font-semibold text-secondary-900">{order.id}</p>
                                        <p className="text-sm text-secondary-600 mt-1">{order.customer}</p>
                                    </div>
                                    <span className={cn('badge capitalize', getStatusColor(order.status))}>
                                        {order.status.replace('_', ' ')}
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <p className="text-secondary-500">Type</p>
                                        <p className="font-medium text-secondary-900 capitalize mt-1">{order.type}</p>
                                    </div>
                                    <div>
                                        <p className="text-secondary-500">Driver</p>
                                        <p className="font-medium text-secondary-900 mt-1">
                                            {order.driver === 'Unassigned' ? (
                                                <span className="text-warning">Unassigned</span>
                                            ) : (
                                                order.driver
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-secondary-500">Scheduled</p>
                                        <p className="font-medium text-secondary-900 mt-1">{formatDate(order.scheduled)}</p>
                                    </div>
                                </div>

                                <div className="mt-3 pt-3 border-t border-secondary-100 flex gap-2">
                                    <button className="btn-sm btn-secondary text-xs">
                                        View Details
                                    </button>
                                    {order.driver === 'Unassigned' && (
                                        <button className="btn-sm btn-primary text-xs">
                                            Assign Driver
                                        </button>
                                    )}
                                    <button className="btn-sm btn-secondary text-xs">
                                        Update Status
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Available Drivers */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">Available Drivers</h3>
                    <div className="space-y-3">
                        {availableDrivers.map((driver) => (
                            <div key={driver.id} className="border border-secondary-200 rounded-lg p-3">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={cn(
                                        'w-2 h-2 rounded-full',
                                        driver.status === 'available' ? 'bg-success' : 'bg-warning'
                                    )} />
                                    <div className="flex-1">
                                        <p className="font-medium text-secondary-900 text-sm">{driver.name}</p>
                                        <p className="text-xs text-secondary-500">{driver.vehicle}</p>
                                    </div>
                                </div>
                                <p className="text-xs text-secondary-600 capitalize">
                                    Status: <span className="font-medium">{driver.status}</span>
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Create Order Modal */}
            {showCreateOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-secondary-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-semibold text-secondary-900">Create New Order</h3>
                                <button
                                    onClick={() => setShowCreateOrder(false)}
                                    className="text-secondary-400 hover:text-secondary-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-2">Customer</label>
                                    <select className="input">
                                        <option>Select customer...</option>
                                        <option>John Tan</option>
                                        <option>Mary Lim</option>
                                        <option>David Wong</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-2">Job Type</label>
                                    <select className="input">
                                        <option>Select type...</option>
                                        <option value="pickup">Pickup</option>
                                        <option value="delivery">Delivery</option>
                                        <option value="both">Both</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-2">Scheduled Date</label>
                                    <input type="date" className="input" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-2">Time Slot</label>
                                    <select className="input">
                                        <option>Morning (9AM - 12PM)</option>
                                        <option>Afternoon (1PM - 5PM)</option>
                                        <option>Evening (5PM - 8PM)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-2">Pickup Address</label>
                                <input type="text" placeholder="Enter pickup address" className="input" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-2">Special Notes</label>
                                <textarea className="input" rows={3} placeholder="Any special instructions..."></textarea>
                            </div>
                        </div>

                        <div className="p-6 border-t border-secondary-200 flex justify-end gap-3">
                            <button
                                onClick={() => setShowCreateOrder(false)}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                            <button className="btn btn-primary">
                                Create Order
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
