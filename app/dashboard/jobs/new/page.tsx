'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useCreateJob, useCustomers } from '@/lib/hooks/useSupabase'
import toast from 'react-hot-toast'

function NewJobForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const preselectedCustomerId = searchParams.get('customer_id') || ''

    const createJob = useCreateJob()
    const { data: customers } = useCustomers()

    const [form, setForm] = useState({
        customer_id: preselectedCustomerId,
        size_plan: '',
        job_type: 'Move' as const,
        pickup_address: '',
        pickup_timing: '',
        destination_address: '',
        destination_timing: '',
        stopover: '',
        storage_location: '',
        volume: '',
        assigned_vendor: 'Jean' as const,
        kanban_column: 'deals_closed' as const,
        internal_notes: '',
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    const validate = () => {
        const e: Record<string, string> = {}
        if (!form.customer_id) e.customer_id = 'Please select a customer'
        if (!form.job_type) e.job_type = 'Job type is required'
        return e
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const errs = validate()
        if (Object.keys(errs).length > 0) { setErrors(errs); return }

        try {
            const payload: any = {
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
            }
            const job = await createJob.mutateAsync(payload)
            toast.success('Job created!')
            router.push(`/dashboard/jobs/${job.id}`)
        } catch (err: any) {
            toast.error(err.message || 'Failed to create job')
        }
    }

    const set = (field: string, value: string) => {
        setForm(f => ({ ...f, [field]: value }))
        setErrors(e => { const n = { ...e }; delete n[field]; return n })
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/jobs" className="p-2 rounded-lg hover:bg-secondary-100">
                    <svg className="w-5 h-5 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <div>
                    <h2 className="text-2xl font-bold text-secondary-900">Create Job</h2>
                    <p className="text-secondary-500 text-sm">Fill in the job details below</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Section: Customer & Type */}
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
                            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Job Type <span className="text-red-500">*</span></label>
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
                            <input type="text" value={form.size_plan} onChange={e => set('size_plan', e.target.value)} className="input" placeholder="e.g. 3-room, 10ft lorry" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Volume</label>
                            <input type="text" value={form.volume} onChange={e => set('volume', e.target.value)} className="input" placeholder="e.g. 50 cbm" />
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

                {/* Section: Pickup */}
                <div className="card space-y-4">
                    <h3 className="font-semibold text-secondary-800 border-b border-secondary-100 pb-2">Pickup Details</h3>
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1.5">Pickup Address</label>
                        <input type="text" value={form.pickup_address} onChange={e => set('pickup_address', e.target.value)} className="input" placeholder="Block 123 Orchard Road, #10-45" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1.5">Pickup Date & Time</label>
                        <input type="datetime-local" value={form.pickup_timing} onChange={e => set('pickup_timing', e.target.value)} className="input" />
                    </div>
                </div>

                {/* Section: Destination */}
                <div className="card space-y-4">
                    <h3 className="font-semibold text-secondary-800 border-b border-secondary-100 pb-2">Destination Details</h3>
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1.5">Destination Address</label>
                        <input type="text" value={form.destination_address} onChange={e => set('destination_address', e.target.value)} className="input" placeholder="456 Marina Boulevard, Unit 5-6" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1.5">Destination Date & Time</label>
                        <input type="datetime-local" value={form.destination_timing} onChange={e => set('destination_timing', e.target.value)} className="input" />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Stopover <span className="text-secondary-400 font-normal">(optional)</span></label>
                            <input type="text" value={form.stopover} onChange={e => set('stopover', e.target.value)} className="input" placeholder="Any stops along the way" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Storage Location</label>
                            <input type="text" value={form.storage_location} onChange={e => set('storage_location', e.target.value)} className="input" placeholder="e.g. WH-001 Unit A5" />
                        </div>
                    </div>
                </div>

                {/* Section: Notes */}
                <div className="card space-y-4">
                    <h3 className="font-semibold text-secondary-800 border-b border-secondary-100 pb-2">Internal Notes</h3>
                    <textarea value={form.internal_notes} onChange={e => set('internal_notes', e.target.value)} className="input resize-none" rows={3} placeholder="Any internal notes for this job..." />
                </div>

                <div className="flex gap-3">
                    <button type="submit" disabled={createJob.isPending} className="btn btn-primary flex-1 flex items-center justify-center gap-2">
                        {createJob.isPending ? (
                            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating...</>
                        ) : 'Create Job'}
                    </button>
                    <Link href="/dashboard/jobs" className="btn btn-secondary flex-1 text-center flex items-center justify-center">Cancel</Link>
                </div>
            </form>
        </div>
    )
}

export default function NewJobPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-96">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
            </div>
        }>
            <NewJobForm />
        </Suspense>
    )
}
