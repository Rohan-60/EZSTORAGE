'use client'

import { useState, useRef } from 'react'
import { useJobs, useUpdateJob } from '@/lib/hooks/useSupabase'
import Link from 'next/link'
import toast from 'react-hot-toast'

const COLUMNS = [
    { id: 'deals_closed', label: 'Deals Closed', color: 'bg-blue-50 border-blue-200', headerColor: 'bg-blue-500' },
    { id: 'scheduled', label: 'Scheduled', color: 'bg-purple-50 border-purple-200', headerColor: 'bg-purple-500' },
    { id: 'enroute', label: 'En Route', color: 'bg-yellow-50 border-yellow-200', headerColor: 'bg-yellow-500' },
    { id: 'inbound', label: 'Inbound', color: 'bg-orange-50 border-orange-200', headerColor: 'bg-orange-500' },
    { id: 'completed', label: 'Completed', color: 'bg-green-50 border-green-200', headerColor: 'bg-green-500' },
]

const VENDOR_COLORS: Record<string, string> = {
    Jean: 'bg-pink-100 text-pink-700',
    GSX: 'bg-indigo-100 text-indigo-700',
    MoveMove: 'bg-teal-100 text-teal-700',
    Other: 'bg-gray-100 text-gray-600',
}

export default function KanbanPage() {
    const { data: jobs, isLoading } = useJobs()
    const updateJob = useUpdateJob()

    const [filterVendor, setFilterVendor] = useState('all')
    const [filterType, setFilterType] = useState('all')
    const [dragOverCol, setDragOverCol] = useState<string | null>(null)
    const draggingId = useRef<string | null>(null)

    const filtered = (jobs || []).filter((j: any) => {
        const matchVendor = filterVendor === 'all' || j.assigned_vendor === filterVendor
        const matchType = filterType === 'all' || j.job_type === filterType
        return matchVendor && matchType
    })

    const getColJobs = (colId: string) => filtered.filter((j: any) => j.kanban_column === colId)

    const handleDragStart = (e: React.DragEvent, jobId: string) => {
        draggingId.current = jobId
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragOver = (e: React.DragEvent, colId: string) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        setDragOverCol(colId)
    }

    const handleDrop = async (e: React.DragEvent, colId: string) => {
        e.preventDefault()
        setDragOverCol(null)
        const id = draggingId.current
        if (!id) return
        draggingId.current = null

        const job = jobs?.find((j: any) => j.id === id)
        if (!job || job.kanban_column === colId) return

        try {
            await updateJob.mutateAsync({ id, updates: { kanban_column: colId } })
        } catch {
            toast.error('Failed to move job')
        }
    }

    const handleDragLeave = (e: React.DragEvent) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setDragOverCol(null)
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
        <div className="space-y-4 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-secondary-900">Kanban Board</h2>
                    <p className="text-secondary-500 text-sm mt-0.5">Drag & drop to move jobs between stages</p>
                </div>
                <div className="flex gap-3">
                    <select value={filterVendor} onChange={e => setFilterVendor(e.target.value)} className="input w-auto text-sm">
                        <option value="all">All Vendors</option>
                        <option value="Jean">Jean</option>
                        <option value="GSX">GSX</option>
                        <option value="MoveMove">MoveMove</option>
                        <option value="Other">Other</option>
                    </select>
                    <select value={filterType} onChange={e => setFilterType(e.target.value)} className="input w-auto text-sm">
                        <option value="all">All Types</option>
                        <option value="Move">Move</option>
                        <option value="Store">Store</option>
                        <option value="Dispose">Dispose</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
            </div>

            {/* Board */}
            <div className="flex gap-4 overflow-x-auto pb-4 flex-1" style={{ minHeight: 0 }}>
                {COLUMNS.map(col => {
                    const colJobs = getColJobs(col.id)
                    const isOver = dragOverCol === col.id

                    return (
                        <div
                            key={col.id}
                            className={`flex flex-col rounded-xl border-2 transition-all duration-150 flex-shrink-0 ${col.color} ${isOver ? 'ring-2 ring-primary-400 ring-offset-2 scale-[1.01]' : ''}`}
                            style={{ width: 280, overflowY: 'auto' }}
                            onDragOver={e => handleDragOver(e, col.id)}
                            onDrop={e => handleDrop(e, col.id)}
                            onDragLeave={handleDragLeave}
                        >
                            {/* Column Header */}
                            <div className={`${col.headerColor} rounded-t-xl px-4 py-3 flex items-center justify-between flex-shrink-0`}>
                                <span className="text-white font-semibold text-sm">{col.label}</span>
                                <span className="bg-white/30 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                    {colJobs.length}
                                </span>
                            </div>

                            {/* Cards */}
                            <div className="p-3 space-y-3 flex-1">
                                {colJobs.length > 0 ? colJobs.map((job: any) => (
                                    <div
                                        key={job.id}
                                        draggable
                                        onDragStart={e => handleDragStart(e, job.id)}
                                        className="bg-white rounded-lg shadow-sm border border-secondary-100 p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow select-none"
                                    >
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <span className="font-bold text-primary-600 text-xs">{job.job_number}</span>
                                            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${VENDOR_COLORS[job.assigned_vendor] || VENDOR_COLORS.Other}`}>
                                                {job.assigned_vendor}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-secondary-800 mb-1">
                                            {job.customer?.first_name} {job.customer?.last_name}
                                        </p>
                                        {job.pickup_address && (
                                            <p className="text-xs text-secondary-500 truncate mb-1">
                                                📍 {job.pickup_address}
                                            </p>
                                        )}
                                        {job.pickup_timing && (
                                            <p className="text-xs text-secondary-400">
                                                🕐 {new Date(job.pickup_timing).toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })}
                                            </p>
                                        )}
                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="text-xs bg-secondary-100 text-secondary-600 px-2 py-0.5 rounded">{job.job_type}</span>
                                            <Link
                                                href={`/dashboard/jobs/${job.id}`}
                                                onClick={e => e.stopPropagation()}
                                                className="text-xs text-primary-500 hover:text-primary-700 font-medium"
                                            >
                                                View →
                                            </Link>
                                        </div>
                                    </div>
                                )) : (
                                    <div className={`h-20 flex items-center justify-center text-sm text-secondary-400 border-2 border-dashed rounded-lg transition-colors ${isOver ? 'border-primary-400 bg-primary-50' : 'border-secondary-200'}`}>
                                        {isOver ? 'Drop here' : 'No jobs'}
                                    </div>
                                )}
                                {colJobs.length > 0 && isOver && (
                                    <div className="h-2 rounded bg-primary-200 animate-pulse" />
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
