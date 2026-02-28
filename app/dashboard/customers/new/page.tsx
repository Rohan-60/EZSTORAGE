'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCreateCustomer } from '@/lib/hooks/useSupabase'
import toast from 'react-hot-toast'

export default function NewCustomerPage() {
    const router = useRouter()
    const createCustomer = useCreateCustomer()

    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        address_line1: '',
        city: '',
        postal_code: '',
        notes: '',
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    const validate = () => {
        const e: Record<string, string> = {}
        if (!form.first_name.trim()) e.first_name = 'First name is required'
        if (!form.last_name.trim()) e.last_name = 'Last name is required'
        if (!form.phone.trim()) e.phone = 'Phone number is required'
        return e
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const errs = validate()
        if (Object.keys(errs).length > 0) { setErrors(errs); return }

        try {
            await createCustomer.mutateAsync({
                first_name: form.first_name.trim(),
                last_name: form.last_name.trim(),
                phone: form.phone.trim(),
                email: form.email.trim(),
                address_line1: form.address_line1.trim(),
                city: form.city.trim(),
                postal_code: form.postal_code.trim(),
                notes: form.notes.trim() || null,
                is_active: true,
            })
            toast.success('Customer created!')
            router.push('/dashboard/customers')
        } catch (err: any) {
            toast.error(err.message || 'Failed to create customer')
        }
    }

    const set = (field: string, value: string) => {
        setForm(f => ({ ...f, [field]: value }))
        setErrors(e => { const n = { ...e }; delete n[field]; return n })
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/customers" className="p-2 rounded-lg hover:bg-secondary-100 transition-colors">
                    <svg className="w-5 h-5 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <div>
                    <h2 className="text-2xl font-bold text-secondary-900">New Customer</h2>
                    <p className="text-secondary-500 text-sm">Add a new customer to the system</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="card space-y-5">
                {/* Name Row */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                            First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.first_name}
                            onChange={e => set('first_name', e.target.value)}
                            className={`input ${errors.first_name ? 'input-error' : ''}`}
                            placeholder="John"
                        />
                        {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                            Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.last_name}
                            onChange={e => set('last_name', e.target.value)}
                            className={`input ${errors.last_name ? 'input-error' : ''}`}
                            placeholder="Tan"
                        />
                        {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
                    </div>
                </div>

                {/* Contact */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                            Phone <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            value={form.phone}
                            onChange={e => set('phone', e.target.value)}
                            className={`input ${errors.phone ? 'input-error' : ''}`}
                            placeholder="+65 9123 4567"
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                            Email <span className="text-secondary-400 font-normal">(optional)</span>
                        </label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={e => set('email', e.target.value)}
                            className="input"
                            placeholder="john@example.com"
                        />
                    </div>
                </div>

                {/* Address */}
                <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                        Address <span className="text-secondary-400 font-normal">(optional)</span>
                    </label>
                    <input
                        type="text"
                        value={form.address_line1}
                        onChange={e => set('address_line1', e.target.value)}
                        className="input"
                        placeholder="123 Orchard Road #10-45"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                            City <span className="text-secondary-400 font-normal">(optional)</span>
                        </label>
                        <input
                            type="text"
                            value={form.city}
                            onChange={e => set('city', e.target.value)}
                            className="input"
                            placeholder="Singapore"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                            Postal Code <span className="text-secondary-400 font-normal">(optional)</span>
                        </label>
                        <input
                            type="text"
                            value={form.postal_code}
                            onChange={e => set('postal_code', e.target.value)}
                            className="input"
                            placeholder="238858"
                        />
                    </div>
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                        Notes <span className="text-secondary-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                        value={form.notes}
                        onChange={e => set('notes', e.target.value)}
                        className="input resize-none"
                        rows={3}
                        placeholder="Any additional notes..."
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={createCustomer.isPending}
                        className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                        {createCustomer.isPending ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Creating...
                            </>
                        ) : 'Create Customer'}
                    </button>
                    <Link href="/dashboard/customers" className="btn btn-secondary flex-1 text-center flex items-center justify-center">
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    )
}
