'use client'

import { useState } from 'react'
import { getStatusColor, cn } from '@/lib/utils'

export default function WarehousePanel() {
    const [selectedUnit, setSelectedUnit] = useState<string | null>(null)

    // Sample storage units grid
    const storageUnits = Array.from({ length: 24 }, (_, i) => ({
        number: `A${String(i + 1).padStart(3, '0')}`,
        status: i < 8 ? 'occupied' : i < 18 ? 'available' : i < 22 ? 'reserved' : 'maintenance',
        customer: i < 8 ? ['John Tan', 'Mary Lim', 'David Wong'][i % 3] : null,
        size: ['Small', 'Medium', 'Large'][i % 3],
    }))

    const warehouseStats = [
        { label: 'Total Units', value: '24', color: 'text-secondary-900' },
        { label: 'Occupied', value: '8', color: 'text-purple-600' },
        { label: 'Available', value: '10', color: 'text-success' },
        { label: 'Reserved', value: '4', color: 'text-yellow-600' },
    ]

    const recentInventory = [
        { item: 'Office Furniture Set', customer: 'John Tan', unit: 'A001', received: '2026-01-15' },
        { item: 'Archive Boxes (15)', customer: 'John Tan', unit: 'A001', received: '2026-01-15' },
        { item: 'IT Equipment', customer: 'Mary Lim', unit: 'A002', received: '2025-12-15' },
        { item: 'Marketing Materials', customer: 'David Wong', unit: 'A003', received: '2025-11-30' },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-secondary-900">Warehouse Management</h2>
                <p className="text-secondary-600 mt-1">Tuas Mega Storage - Unit Allocation & Inventory</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {warehouseStats.map((stat, index) => (
                    <div key={index} className="card">
                        <p className="text-secondary-600 text-sm mb-1">{stat.label}</p>
                        <p className={cn('text-3xl font-bold', stat.color)}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Storage Unit Grid */}
            <div className="card">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-secondary-900">Storage Unit Grid - Floor 1</h3>
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
                    {storageUnits.map((unit) => (
                        <button
                            key={unit.number}
                            onClick={() => setSelectedUnit(unit.number)}
                            className={cn(
                                'aspect-square rounded-lg border-2 p-2 transition-all hover:scale-105 flex flex-col items-center justify-center',
                                unit.status === 'available' && 'bg-green-50 border-success hover:border-green-600',
                                unit.status === 'occupied' && 'bg-purple-50 border-purple-500 hover:border-purple-600',
                                unit.status === 'reserved' && 'bg-yellow-50 border-yellow-500 hover:border-yellow-600',
                                unit.status === 'maintenance' && 'bg-orange-50 border-orange-500 hover:border-orange-600',
                                selectedUnit === unit.number && 'ring-2 ring-primary-500'
                            )}
                        >
                            <span className="font-bold text-xs text-secondary-900">{unit.number}</span>
                            <span className="text-[10px] text-secondary-600 mt-1">{unit.size}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Unit Details */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                        {selectedUnit ? `Unit Details - ${selectedUnit}` : 'Unit Details'}
                    </h3>
                    {selectedUnit ? (
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-secondary-600">Status</p>
                                <p className="font-medium text-secondary-900 mt-1">
                                    <span className={cn('badge capitalize', getStatusColor(storageUnits.find(u => u.number === selectedUnit)!.status))}>
                                        {storageUnits.find(u => u.number === selectedUnit)!.status}
                                    </span>
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-secondary-600">Size</p>
                                <p className="font-medium text-secondary-900 mt-1">
                                    {storageUnits.find(u => u.number === selectedUnit)!.size} - 200cm × 200cm × 250cm
                                </p>
                            </div>
                            {storageUnits.find(u => u.number === selectedUnit)!.customer && (
                                <div>
                                    <p className="text-sm text-secondary-600">Current Customer</p>
                                    <p className="font-medium text-secondary-900 mt-1">
                                        {storageUnits.find(u => u.number === selectedUnit)!.customer}
                                    </p>
                                </div>
                            )}
                            <div>
                                <p className="text-sm text-secondary-600">Monthly Rate</p>
                                <p className="font-medium text-secondary-900 mt-1">$280.00</p>
                            </div>
                            <div className="flex gap-2 pt-4 border-t border-secondary-200">
                                <button className="btn btn-primary flex-1">View Inventory</button>
                                <button className="btn btn-secondary flex-1">Update Status</button>
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
                        {recentInventory.map((item, index) => (
                            <div key={index} className="border border-secondary-200 rounded-lg p-3">
                                <p className="font-medium text-secondary-900 text-sm">{item.item}</p>
                                <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-secondary-600">
                                    <div>
                                        <p className="text-secondary-500">Customer</p>
                                        <p className="font-medium text-secondary-700 mt-0.5">{item.customer}</p>
                                    </div>
                                    <div>
                                        <p className="text-secondary-500">Unit</p>
                                        <p className="font-medium text-secondary-700 mt-0.5">{item.unit}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-4 text-primary-600 hover:text-primary-700 font-medium text-sm">
                        View All Inventory →
                    </button>
                </div>
            </div>
        </div>
    )
}
