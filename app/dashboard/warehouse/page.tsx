'use client'

import { useState } from 'react'
import { getStatusColor, cn } from '@/lib/utils'
import { useStorageUnits, useInventoryItems, useUpdateStorageUnit } from '@/lib/hooks/useSupabase'
import toast from 'react-hot-toast'

export default function WarehousePanel() {
    const [selectedUnit, setSelectedUnit] = useState<string | null>(null)

    // Fetch data
    const { data: storageUnits, isLoading: unitsLoading } = useStorageUnits()
    const { data: inventoryItems, isLoading: inventoryLoading } = useInventoryItems()

    // Mutations
    const updateUnitMutation = useUpdateStorageUnit()

    // Calculate stats
    const stats = {
        total: storageUnits?.length || 0,
        occupied: storageUnits?.filter((u: any) => u.status === 'occupied').length || 0,
        available: storageUnits?.filter((u: any) => u.status === 'available').length || 0,
        reserved: storageUnits?.filter((u: any) => u.status === 'reserved').length || 0,
    }

    // Get selected unit details
    const selectedUnitData = storageUnits?.find((u: any) => u.id === selectedUnit)

    // Recent inventory (last 5)
    const recentInventory = inventoryItems?.slice(0, 5) || []

    const handleUpdateStatus = async (unitId: string, newStatus: string) => {
        try {
            await updateUnitMutation.mutateAsync({
                id: unitId,
                updates: { status: newStatus },
            })
            toast.success('Unit status updated!')
        } catch (error: any) {
            toast.error(error.message || 'Failed to update status')
        }
    }

    if (unitsLoading || inventoryLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                    <p className="mt-4 text-secondary-600">Loading warehouse data...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-secondary-900">Warehouse Management</h2>
                <p className="text-secondary-600 mt-1">Unit Allocation & Inventory Tracking</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card">
                    <p className="text-secondary-600 text-sm mb-1">Total Units</p>
                    <p className="text-3xl font-bold text-secondary-900">{stats.total}</p>
                </div>
                <div className="card">
                    <p className="text-secondary-600 text-sm mb-1">Occupied</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.occupied}</p>
                </div>
                <div className="card">
                    <p className="text-secondary-600 text-sm mb-1">Available</p>
                    <p className="text-3xl font-bold text-success">{stats.available}</p>
                </div>
                <div className="card">
                    <p className="text-secondary-600 text-sm mb-1">Reserved</p>
                    <p className="text-3xl font-bold text-warning">{stats.reserved}</p>
                </div>
            </div>

            {/* Storage Unit Grid */}
            <div className="card">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-secondary-900">Storage Unit Grid</h3>
                    <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-success rounded"></div>
                            <span className="text-secondary-600">Available</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-purple-500 rounded"></div>
                            <span className="text-secondary-600">Occupied</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                            <span className="text-secondary-600">Reserved</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-orange-500 rounded"></div>
                            <span className="text-secondary-600">Maintenance</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    {storageUnits && storageUnits.length > 0 ? storageUnits.map((unit: any) => (
                        <button
                            key={unit.id}
                            onClick={() => setSelectedUnit(unit.id)}
                            className={cn(
                                'aspect-square rounded-lg border-2 p-2 transition-all hover:scale-105 flex flex-col items-center justify-center',
                                unit.status === 'available' && 'bg-green-50 border-success hover:border-green-600',
                                unit.status === 'occupied' && 'bg-purple-50 border-purple-500 hover:border-purple-600',
                                unit.status === 'reserved' && 'bg-yellow-50 border-yellow-500 hover:border-yellow-600',
                                unit.status === 'maintenance' && 'bg-orange-50 border-orange-500 hover:border-orange-600',
                                selectedUnit === unit.id && 'ring-2 ring-primary-500'
                            )}
                        >
                            <span className="font-bold text-xs text-secondary-900">{unit.unit_number}</span>
                            <span className="text-[10px] text-secondary-600 mt-1 capitalize">{unit.size}</span>
                        </button>
                    )) : (
                        <div className="col-span-full text-center py-8 text-secondary-500">
                            <p>No storage units found</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Unit Details */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                        {selectedUnitData ? `Unit Details - ${selectedUnitData.unit_number}` : 'Unit Details'}
                    </h3>
                    {selectedUnitData ? (
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-secondary-600">Status</p>
                                <p className="font-medium text-secondary-900 mt-1">
                                    <span className={cn('badge capitalize', getStatusColor(selectedUnitData.status))}>
                                        {selectedUnitData.status}
                                    </span>
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-secondary-600">Size</p>
                                <p className="font-medium text-secondary-900 mt-1 capitalize">
                                    {selectedUnitData.size} - {selectedUnitData.dimensions || 'Standard dimensions'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-secondary-600">Warehouse</p>
                                <p className="font-medium text-secondary-900 mt-1">
                                    {selectedUnitData.warehouse?.name || 'N/A'}
                                </p>
                            </div>
                            {selectedUnitData.customer && (
                                <div>
                                    <p className="text-sm text-secondary-600">Current Customer</p>
                                    <p className="font-medium text-secondary-900 mt-1">
                                        {selectedUnitData.customer.first_name} {selectedUnitData.customer.last_name}
                                    </p>
                                </div>
                            )}
                            <div>
                                <p className="text-sm text-secondary-600">Monthly Rate</p>
                                <p className="font-medium text-secondary-900 mt-1">
                                    ${selectedUnitData.monthly_rate || '0.00'}
                                </p>
                            </div>
                            <div className="flex gap-2 pt-4 border-t border-secondary-200">
                                {selectedUnitData.status === 'available' && (
                                    <button
                                        onClick={() => handleUpdateStatus(selectedUnitData.id, 'reserved')}
                                        className="btn btn-primary flex-1"
                                        disabled={updateUnitMutation.isPending}
                                    >
                                        Mark Reserved
                                    </button>
                                )}
                                {selectedUnitData.status === 'reserved' && (
                                    <button
                                        onClick={() => handleUpdateStatus(selectedUnitData.id, 'available')}
                                        className="btn btn-secondary flex-1"
                                        disabled={updateUnitMutation.isPending}
                                    >
                                        Mark Available
                                    </button>
                                )}
                                {selectedUnitData.status !== 'maintenance' && (
                                    <button
                                        onClick={() => handleUpdateStatus(selectedUnitData.id, 'maintenance')}
                                        className="btn btn-secondary flex-1"
                                        disabled={updateUnitMutation.isPending}
                                    >
                                        Maintenance
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-secondary-500">
                            <svg className="w-16 h-16 mx-auto mb-3 text-secondary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <p>Select a unit from the grid to view details</p>
                        </div>
                    )}
                </div>

                {/* Recent Inventory */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">Recent Inventory</h3>
                    <div className="space-y-3">
                        {recentInventory.length > 0 ? recentInventory.map((item: any) => (
                            <div key={item.id} className="border border-secondary-200 rounded-lg p-3">
                                <p className="font-medium text-secondary-900 text-sm">{item.item_description}</p>
                                <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-secondary-600">
                                    <div>
                                        <p className="text-secondary-500">Customer</p>
                                        <p className="font-medium text-secondary-700 mt-0.5">
                                            {item.customer ? `${item.customer.first_name} ${item.customer.last_name}` : 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-secondary-500">Unit</p>
                                        <p className="font-medium text-secondary-700 mt-0.5">
                                            {item.storage_unit?.unit_number || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <p className="text-sm text-secondary-500 text-center py-8">No inventory items found</p>
                        )}
                    </div>
                    {inventoryItems && inventoryItems.length > 5 && (
                        <p className="w-full mt-4 text-center text-primary-600 hover:text-primary-700 font-medium text-sm">
                            {inventoryItems.length - 5} more items...
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
