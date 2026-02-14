'use client'

import { useState } from 'react'
import { formatDate, getStatusColor, cn } from '@/lib/utils'
import { useOrders, useStaff, useCustomers, useCreateOrder, useUpdateOrder, useAssignDriver } from '@/lib/hooks/useSupabase'
import toast from 'react-hot-toast'

export default function OperationsPanel() {
    const [showCreateOrder, setShowCreateOrder] = useState(false)
    const [selectedFilter, setSelectedFilter] = useState('all')
    const [assigningOrder, setAssigningOrder] = useState<string | null>(null)

    // Fetch data
    const { data: allOrders, isLoading: ordersLoading } = useOrders()
    const { data: staff, isLoading: staffLoading } = useStaff()
    const { data: customers, isLoading: customersLoading } = useCustomers()

    // Mutations
    const createOrderMutation = useCreateOrder()
    const updateOrderMutation = useUpdateOrder()
    const assignDriverMutation = useAssignDriver()

    // Filter drivers
    const drivers = staff?.filter((s: any) => s.role === 'driver') || []
    const availableDrivers = drivers.filter((d: any) => d.is_active)

    // Filter orders based on selected filter
    const orders = selectedFilter === 'all'
        ? allOrders
        : allOrders?.filter((o: any) => o.status === selectedFilter)

    // Calculate stats
    const stats = {
        pending: allOrders?.filter((o: any) => o.status === 'pending').length || 0,
        scheduled: allOrders?.filter((o: any) => o.status === 'scheduled').length || 0,
        in_transit: allOrders?.filter((o: any) => o.status === 'in_transit').length || 0,
        completed_today: allOrders?.filter((o: any) =>
            o.status === 'completed' &&
            new Date(o.updated_at).toDateString() === new Date().toDateString()
        ).length || 0,
    }

    // Form state
    const [formData, setFormData] = useState({
        customer_id: '',
        job_type: '',
        scheduled_date: '',
        time_slot: 'morning',
        pickup_address: '',
        notes: '',
    })

    const handleCreateOrder = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.customer_id || !formData.job_type || !formData.scheduled_date) {
            toast.error('Please fill in all required fields')
            return
        }

        try {
            await createOrderMutation.mutateAsync({
                customer_id: formData.customer_id,
                job_type: formData.job_type,
                scheduled_date: formData.scheduled_date,
                pickup_address: formData.pickup_address,
                notes: formData.notes,
                status: 'pending',
            })

            toast.success('Order created successfully!')
            setShowCreateOrder(false)
            setFormData({
                customer_id: '',
                job_type: '',
                scheduled_date: '',
                time_slot: 'morning',
                pickup_address: '',
                notes: '',
            })
        } catch (error: any) {
            toast.error(error.message || 'Failed to create order')
        }
    }

    const handleAssignDriver = async (orderId: string, driverId: string) => {
        try {
            await assignDriverMutation.mutateAsync({ orderId, driverId })
            toast.success('Driver assigned successfully!')
            setAssigningOrder(null)
        } catch (error: any) {
            toast.error(error.message || 'Failed to assign driver')
        }
    }

    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        try {
            await updateOrderMutation.mutateAsync({
                id: orderId,
                updates: { status: newStatus },
            })
            toast.success('Status updated successfully!')
        } catch (error: any) {
            toast.error(error.message || 'Failed to update status')
        }
    }

    if (ordersLoading || staffLoading || customersLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                    <p className="mt-4 text-secondary-600">Loading operations data...</p>
                </div>
            </div>
        )
    }

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
                    <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="card">
                    <p className="text-secondary-600 text-sm mb-1">Scheduled</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.scheduled}</p>
                </div>
                <div className="card">
                    <p className="text-secondary-600 text-sm mb-1">In Transit</p>
                    <p className="text-3xl font-bold text-indigo-600">{stats.in_transit}</p>
                </div>
                <div className="card">
                    <p className="text-secondary-600 text-sm mb-1">Completed Today</p>
                    <p className="text-3xl font-bold text-success">{stats.completed_today}</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Orders List */}
                <div className="card lg:col-span-2">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">Active Orders</h3>

                    {/* Filters */}
                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={() => setSelectedFilter('all')}
                            className={cn(
                                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                                selectedFilter === 'all'
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                            )}
                        >
                            All Orders
                        </button>
                        <button
                            onClick={() => setSelectedFilter('pending')}
                            className={cn(
                                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                                selectedFilter === 'pending'
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                            )}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => setSelectedFilter('scheduled')}
                            className={cn(
                                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                                selectedFilter === 'scheduled'
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                            )}
                        >
                            Scheduled
                        </button>
                        <button
                            onClick={() => setSelectedFilter('in_transit')}
                            className={cn(
                                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                                selectedFilter === 'in_transit'
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                            )}
                        >
                            In Transit
                        </button>
                    </div>

                    <div className="space-y-3">
                        {orders && orders.length > 0 ? orders.map((order: any) => (
                            <div key={order.id} className="border border-secondary-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="font-semibold text-secondary-900">{order.order_number}</p>
                                        <p className="text-sm text-secondary-600 mt-1">
                                            {order.customer?.first_name} {order.customer?.last_name}
                                        </p>
                                    </div>
                                    <span className={cn('badge capitalize', getStatusColor(order.status))}>
                                        {order.status.replace('_', ' ')}
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <p className="text-secondary-500">Type</p>
                                        <p className="font-medium text-secondary-900 capitalize mt-1">{order.job_type}</p>
                                    </div>
                                    <div>
                                        <p className="text-secondary-500">Driver</p>
                                        <p className="font-medium text-secondary-900 mt-1">
                                            {order.driver ? (
                                                `${order.driver.first_name} ${order.driver.last_name}`
                                            ) : (
                                                <span className="text-warning">Unassigned</span>
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-secondary-500">Scheduled</p>
                                        <p className="font-medium text-secondary-900 mt-1">{formatDate(order.scheduled_date)}</p>
                                    </div>
                                </div>

                                <div className="mt-3 pt-3 border-t border-secondary-100 flex gap-2">
                                    {!order.assigned_driver_id && assigningOrder === order.id ? (
                                        <div className="flex gap-2 flex-1">
                                            <select
                                                onChange={(e) => handleAssignDriver(order.id, e.target.value)}
                                                className="input text-sm flex-1"
                                                defaultValue=""
                                            >
                                                <option value="" disabled>Select driver...</option>
                                                {availableDrivers.map((driver: any) => (
                                                    <option key={driver.id} value={driver.id}>
                                                        {driver.first_name} {driver.last_name} - {driver.vehicle_number}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={() => setAssigningOrder(null)}
                                                className="btn-sm btn-secondary text-xs"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            {!order.assigned_driver_id && (
                                                <button
                                                    onClick={() => setAssigningOrder(order.id)}
                                                    className="btn-sm btn-primary text-xs"
                                                >
                                                    Assign Driver
                                                </button>
                                            )}
                                            {order.status === 'pending' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(order.id, 'scheduled')}
                                                    className="btn-sm btn-secondary text-xs"
                                                >
                                                    Mark Scheduled
                                                </button>
                                            )}
                                            {order.status === 'scheduled' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(order.id, 'in_transit')}
                                                    className="btn-sm btn-secondary text-xs"
                                                >
                                                    Start Transit
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-12 text-secondary-500">
                                <p>No orders found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Available Drivers */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">Available Drivers</h3>
                    <div className="space-y-3">
                        {availableDrivers.map((driver: any) => (
                            <div key={driver.id} className="border border-secondary-200 rounded-lg p-3">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-success" />
                                    <div className="flex-1">
                                        <p className="font-medium text-secondary-900 text-sm">
                                            {driver.first_name} {driver.last_name}
                                        </p>
                                        <p className="text-xs text-secondary-500">{driver.vehicle_number}</p>
                                    </div>
                                </div>
                                <p className="text-xs text-secondary-600 capitalize">
                                    Status: <span className="font-medium">Available</span>
                                </p>
                            </div>
                        ))}
                        {availableDrivers.length === 0 && (
                            <p className="text-sm text-secondary-500 text-center py-4">No available drivers</p>
                        )}
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

                        <form onSubmit={handleCreateOrder} className="p-6 space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-2">Customer *</label>
                                    <select
                                        className="input"
                                        value={formData.customer_id}
                                        onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                                        required
                                    >
                                        <option value="">Select customer...</option>
                                        {customers?.map((customer: any) => (
                                            <option key={customer.id} value={customer.id}>
                                                {customer.first_name} {customer.last_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-2">Job Type *</label>
                                    <select
                                        className="input"
                                        value={formData.job_type}
                                        onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                                        required
                                    >
                                        <option value="">Select type...</option>
                                        <option value="pickup">Pickup</option>
                                        <option value="delivery">Delivery</option>
                                        <option value="both">Both</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-2">Scheduled Date *</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={formData.scheduled_date}
                                        onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-2">Time Slot</label>
                                    <select
                                        className="input"
                                        value={formData.time_slot}
                                        onChange={(e) => setFormData({ ...formData, time_slot: e.target.value })}
                                    >
                                        <option value="morning">Morning (9AM - 12PM)</option>
                                        <option value="afternoon">Afternoon (1PM - 5PM)</option>
                                        <option value="evening">Evening (5PM - 8PM)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-2">Pickup Address</label>
                                <input
                                    type="text"
                                    placeholder="Enter pickup address"
                                    className="input"
                                    value={formData.pickup_address}
                                    onChange={(e) => setFormData({ ...formData, pickup_address: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-2">Special Notes</label>
                                <textarea
                                    className="input"
                                    rows={3}
                                    placeholder="Any special instructions..."
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-secondary-200">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateOrder(false)}
                                    className="btn btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={createOrderMutation.isPending}
                                >
                                    {createOrderMutation.isPending ? 'Creating...' : 'Create Order'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
