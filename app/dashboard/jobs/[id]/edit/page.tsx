'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useJobs, useUpdateJob, useCustomers } from '@/lib/hooks/useSupabase'
import toast from 'react-hot-toast'

export default function EditJobPage() {
    const { id } = useParams<{ id: string }>()
    const router = useRouter()
    const updateJob = useUpdateJob()
    const { data: jobs, isLoading } = useJobs()
    const { data: customers } = useCustomers()

    const job = jobs?.find((j: any) => j.id === id)

    const [form, setForm] = useState({
        customer_id: '',
        size_plan: '',
        job_type: 'Move',
        pickup_address: '',
        pickup_timing: '',
        destination_address: '',
        destination_timing: '',
        stopover: '',
        storage_location: '',
        volume: '',
        assigned_vendor: 'Jean',
        kanban_column: 'deals_closed',
        internal_notes: '',
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    // toDatetimeLocal converts ISO string to <input type="datetime-local"> format
    const toLocal = (iso?: string | null) => {
        if (!iso) return ''
        const d = new Date(iso)
        const pad = (n: number) => String(n).padStart(2, '0')
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
    }

    useEffect(() => {
        if (job) {
            setForm({
                customer_id: job.customer_id || '',
                size_plan: job.size_plan || '',
                job_type: job.job_type || 'Move',
                pickup_address: job.pickup_address || '',
                pickup_timing: toLocal(job.pickup_timing),
                destination_address: job.destination_address || '',
                destination_timing: toLocal(job.destination_timing),
                stopover: job.stopover || '',
                storage_location: job.storage_location || '',
                volume: job.volume || '',
                assigned_vendor: job.assigned_vendor || 'Jean',
                kanban_column: job.kanban_column || 'deals_closed',
                internal_notes: job.internal_notes || '',
            })
        }
    }, [job])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.customer_id) { setErrors({ customer_id: 'Customer is required' }); return }

        try {
            await updateJob.mutateAsync({
                id,
                updates: {
                    customer_id: form.customer_id,
                    size_plan: form.size_plan || null,
                    job_type: form.job_type,
                    pickup_address: form.pickup_address || null,
                    pickup_timing: form.pickup_timing || null,
                    destination_address: form.destination_address || null,
                    destination_timing: form.destination_timing || null,
                    stopover: form.stopover || null,
                    storage_location: form.storage_location || null,
                    volume: form.volume || null,
                    assigned_vendor: form.assigned_vendor,
                    kanban_column: form.kanban_column,
                    internal_notes: form.internal_notes || null,
                },
            })
            toast.success('Job updated!')
            router.push(`/dashboard/jobs/${id}`)
        } catch (err: any) {
            toast.error(err.message || 'Failed to update job')
        }
    }

    const set = (field: string, value: string) => {
        setForm(f => ({ ...f, [field]: value }))
        setErrors(e => { const n = { ...e }; delete n[field]; return n })
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
            </div>
        )
    }
    if (!job) {
        return (
            <div className="text-center py-24">
                <p className="text-secondary-500">Job not found.</p>
                <Link href="/dashboard/jobs" className="text-primary-600 hover:underline mt-2 inline-block">← Back</Link>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href={`/dashboard/jobs/${id}`} className="p-2 rounded-lg hover:bg-secondary-100">
                    <svg className="w-5 h-5 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <div>
                    <h2 className="text-2xl font-bold text-secondary-900">Edit Job</h2>
                    <p className="text-secondary-500 text-sm">{job.job_number}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="card space-y-5">
                    <h3 className="font-semibold text-secondary-800 border-b border-secondary-100 pb-2">Job Overview</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Customer <span className="text-red-500">*</span></label>
                            <select value={form.customer_id} onChange={e => set('customer_id', e.target.value)} className={`input ${errors.customer_id ? 'input-error' : ''}`}>
                                <option value="">Select a customer...</option>
                                {(customers || []).map((c: any) => (
                                    <option key={c.id} value={c.id}>{c.first_name} {c.last_name} — {c.phone}</option>
                                ))}
                            </select>
                            {errors.customer_id && <p className="text-red-500 text-xs mt-1">{errors.customer_id}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Job Type</label>
                            <select value={form.job_type} onChange={e => set('job_type', e.target.value)} className="input">
                                <option value="Move">Move</option>
                                <option value="Store">Store</option>
                                <option value="Dispose">Dispose</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Size Plan</label>
                            <input type="text" value={form.size_plan} onChange={e => set('size_plan', e.target.value)} className="input" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Volume</label>
                            <input type="text" value={form.volume} onChange={e => set('volume', e.target.value)} className="input" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Assigned Vendor</label>
                            <select value={form.assigned_vendor} onChange={e => set('assigned_vendor', e.target.value)} className="input">
                                <option value="Jean">Jean</option>
                                <option value="GSX">GSX</option>
                                <option value="MoveMove">MoveMove</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1.5">Kanban Stage</label>
                        <select value={form.kanban_column} onChange={e => set('kanban_column', e.target.value)} className="input">
                            <option value="deals_closed">Deals Closed</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="enroute">Enroute</option>
                            <option value="inbound">Inbound</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                </div>

                <div className="card space-y-4">
                    <h3 className="font-semibold text-secondary-800 border-b border-secondary-100 pb-2">Pickup Details</h3>
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1.5">Pickup Address</label>
                        <input type="text" value={form.pickup_address} onChange={e => set('pickup_address', e.target.value)} className="input" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1.5">Pickup Date & Time</label>
                        <input type="datetime-local" value={form.pickup_timing} onChange={e => set('pickup_timing', e.target.value)} className="input" />
                    </div>
                </div>

                <div className="card space-y-4">
                    <h3 className="font-semibold text-secondary-800 border-b border-secondary-100 pb-2">Destination Details</h3>
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1.5">Destination Address</label>
                        <input type="text" value={form.destination_address} onChange={e => set('destination_address', e.target.value)} className="input" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1.5">Destination Date & Time</label>
                        <input type="datetime-local" value={form.destination_timing} onChange={e => set('destination_timing', e.target.value)} className="input" />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Stopover</label>
                            <input type="text" value={form.stopover} onChange={e => set('stopover', e.target.value)} className="input" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Storage Location</label>
                            <input type="text" value={form.storage_location} onChange={e => set('storage_location', e.target.value)} className="input" />
                        </div>
                    </div>
                </div>

                <div className="card space-y-4">
                    <h3 className="font-semibold text-secondary-800 border-b border-secondary-100 pb-2">Internal Notes</h3>
                    <textarea value={form.internal_notes} onChange={e => set('internal_notes', e.target.value)} className="input resize-none" rows={3} />
                </div>

                <div className="flex gap-3">
                    <button type="submit" disabled={updateJob.isPending} className="btn btn-primary flex-1 flex items-center justify-center gap-2">
                        {updateJob.isPending ? (
                            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
                        ) : 'Save Changes'}
                    </button>
                    <Link href={`/dashboard/jobs/${id}`} className="btn btn-secondary flex-1 text-center flex items-center justify-center">Cancel</Link>
                </div>
            </form>
        </div>
    )
}
