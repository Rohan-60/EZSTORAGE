'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useJobs } from '@/lib/hooks/useSupabase'

type ViewMode = 'week' | 'month'

interface CalEvent {
    job: any
    date: Date
    type: 'pickup' | 'destination'
}

const VENDOR_COLORS: Record<string, string> = {
    Jean: 'bg-pink-500',
    GSX: 'bg-indigo-500',
    MoveMove: 'bg-teal-500',
    Other: 'bg-gray-400',
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function SchedulePage() {
    const { data: jobs, isLoading } = useJobs()
    const [view, setView] = useState<ViewMode>('week')
    const [filterVendor, setFilterVendor] = useState('all')
    const [currentDate, setCurrentDate] = useState(new Date())

    const filtered = useMemo(() => (jobs || []).filter((j: any) =>
        filterVendor === 'all' || j.assigned_vendor === filterVendor
    ), [jobs, filterVendor])

    // Build list of calendar events from jobs
    const events: CalEvent[] = useMemo(() => {
        const evs: CalEvent[] = []
        filtered.forEach((job: any) => {
            if (job.pickup_timing) evs.push({ job, date: new Date(job.pickup_timing), type: 'pickup' })
            if (job.destination_timing) evs.push({ job, date: new Date(job.destination_timing), type: 'destination' })
        })
        return evs
    }, [filtered])

    // Get week days for current week
    const getWeekDays = (d: Date) => {
        const start = new Date(d)
        start.setDate(d.getDate() - d.getDay())
        return Array.from({ length: 7 }, (_, i) => {
            const day = new Date(start)
            day.setDate(start.getDate() + i)
            return day
        })
    }

    // Get month calendar days including leading/trailing
    const getMonthDays = (d: Date) => {
        const year = d.getFullYear()
        const month = d.getMonth()
        const firstDay = new Date(year, month, 1).getDay()
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        const total = Math.ceil((firstDay + daysInMonth) / 7) * 7
        return Array.from({ length: total }, (_, i) => {
            const day = new Date(year, month, 1 - firstDay + i)
            return day
        })
    }

    const isSameDay = (a: Date, b: Date) =>
        a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()

    const getEventsForDay = (day: Date) =>
        events.filter(e => isSameDay(e.date, day))

    const navigate = (dir: 1 | -1) => {
        const d = new Date(currentDate)
        if (view === 'week') d.setDate(d.getDate() + dir * 7)
        else d.setMonth(d.getMonth() + dir)
        setCurrentDate(d)
    }

    const weekDays = getWeekDays(currentDate)
    const monthDays = getMonthDays(currentDate)
    const isCurrentMonth = (d: Date) => d.getMonth() === currentDate.getMonth()
    const isToday = (d: Date) => isSameDay(d, new Date())

    const headerLabel = view === 'week'
        ? `${weekDays[0].getDate()} ${MONTHS[weekDays[0].getMonth()]} – ${weekDays[6].getDate()} ${MONTHS[weekDays[6].getMonth()]} ${weekDays[6].getFullYear()}`
        : `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
            </div>
        )
    }

    const EventChip = ({ event }: { event: CalEvent }) => (
        <Link href={`/dashboard/jobs/${event.job.id}`}>
            <div className={`text-white text-xs px-1.5 py-0.5 rounded mb-0.5 truncate ${VENDOR_COLORS[event.job.assigned_vendor] || VENDOR_COLORS.Other} cursor-pointer hover:opacity-80`}>
                <span className="opacity-70">{event.type === 'pickup' ? '↑' : '↓'} </span>
                {event.job.job_number} – {event.job.customer?.first_name}
            </div>
        </Link>
    )

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-secondary-900">Schedule</h2>
                    <p className="text-secondary-500 text-sm mt-0.5">Pickup (↑) and Destination (↓) timings</p>
                </div>
                <div className="flex items-center gap-3">
                    <select value={filterVendor} onChange={e => setFilterVendor(e.target.value)} className="input w-auto text-sm">
                        <option value="all">All Vendors</option>
                        <option value="Jean">Jean</option>
                        <option value="GSX">GSX</option>
                        <option value="MoveMove">MoveMove</option>
                        <option value="Other">Other</option>
                    </select>
                    <div className="flex rounded-lg border border-secondary-200 overflow-hidden text-sm">
                        <button onClick={() => setView('week')} className={`px-4 py-2 ${view === 'week' ? 'bg-primary-600 text-white' : 'bg-white text-secondary-600 hover:bg-secondary-50'}`}>
                            Week
                        </button>
                        <button onClick={() => setView('month')} className={`px-4 py-2 ${view === 'month' ? 'bg-primary-600 text-white' : 'bg-white text-secondary-600 hover:bg-secondary-50'}`}>
                            Month
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar Nav */}
            <div className="card p-4">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-secondary-100 rounded-lg transition-colors">
                        <svg className="w-4 h-4 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <span className="font-semibold text-secondary-800">{headerLabel}</span>
                    <button onClick={() => navigate(1)} className="p-2 hover:bg-secondary-100 rounded-lg transition-colors">
                        <svg className="w-4 h-4 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 mb-2">
                    {DAYS.map(d => (
                        <div key={d} className="text-xs font-semibold text-secondary-400 text-center py-1">{d}</div>
                    ))}
                </div>

                {/* Calendar Grid */}
                {view === 'week' ? (
                    <div className="grid grid-cols-7 gap-1 min-h-[200px]">
                        {weekDays.map((day, i) => {
                            const dayEvents = getEventsForDay(day)
                            return (
                                <div key={i} className={`rounded-lg p-2 border min-h-[120px] ${isToday(day) ? 'border-primary-400 bg-primary-50' : 'border-secondary-100 bg-secondary-50'}`}>
                                    <p className={`text-sm font-semibold mb-1 ${isToday(day) ? 'text-primary-600' : 'text-secondary-700'}`}>
                                        {day.getDate()}
                                    </p>
                                    {dayEvents.slice(0, 4).map((ev, j) => <EventChip key={j} event={ev} />)}
                                    {dayEvents.length > 4 && (
                                        <p className="text-xs text-secondary-400">+{dayEvents.length - 4} more</p>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="grid grid-cols-7 gap-1">
                        {monthDays.map((day, i) => {
                            const dayEvents = getEventsForDay(day)
                            const inMonth = isCurrentMonth(day)
                            return (
                                <div key={i} className={`rounded-lg p-1.5 min-h-[80px] border ${!inMonth ? 'opacity-40 bg-white border-transparent' : isToday(day) ? 'border-primary-400 bg-primary-50' : 'border-secondary-100 bg-secondary-50'}`}>
                                    <p className={`text-xs font-semibold mb-1 ${isToday(day) ? 'text-primary-600' : 'text-secondary-600'}`}>
                                        {day.getDate()}
                                    </p>
                                    {dayEvents.slice(0, 2).map((ev, j) => <EventChip key={j} event={ev} />)}
                                    {dayEvents.length > 2 && (
                                        <p className="text-xs text-secondary-400">+{dayEvents.length - 2}</p>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="card p-3 flex items-center gap-4 flex-wrap">
                <span className="text-xs font-medium text-secondary-500">Vendors:</span>
                {Object.entries(VENDOR_COLORS).map(([vendor, color]) => (
                    <div key={vendor} className="flex items-center gap-1.5 text-xs text-secondary-600">
                        <div className={`w-3 h-3 rounded-sm ${color}`} />
                        {vendor}
                    </div>
                ))}
                <span className="text-xs text-secondary-400 ml-4">↑ Pickup &nbsp; ↓ Destination</span>
            </div>
        </div>
    )
}
