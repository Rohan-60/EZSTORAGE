import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-SG', {
        style: 'currency',
        currency: 'SGD',
    }).format(amount)
}

export function formatDate(date: string | Date, formatStr: string = 'dd MMM yyyy'): string {
    return format(new Date(date), formatStr)
}

export function formatDateTime(date: string | Date): string {
    return format(new Date(date), 'dd MMM yyyy HH:mm')
}

export function getStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
        // Order statuses
        pending: 'bg-yellow-100 text-yellow-800',
        confirmed: 'bg-blue-100 text-blue-800',
        scheduled: 'bg-purple-100 text-purple-800',
        in_transit: 'bg-indigo-100 text-indigo-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
        failed: 'bg-red-100 text-red-800',

        // Payment statuses
        processing: 'bg-blue-100 text-blue-800',
        refunded: 'bg-orange-100 text-orange-800',
        partially_refunded: 'bg-orange-100 text-orange-800',

        // Storage unit statuses
        available: 'bg-green-100 text-green-800',
        occupied: 'bg-purple-100 text-purple-800',
        reserved: 'bg-yellow-100 text-yellow-800',
        maintenance: 'bg-orange-100 text-orange-800',
        inactive: 'bg-gray-100 text-gray-800',
    }

    return statusColors[status] || 'bg-gray-100 text-gray-800'
}

export function capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

export function formatPhoneNumber(phone: string): string {
    // Format Singapore phone numbers
    return phone.replace(/(\+65)(\d{4})(\d{4})/, '$1 $2 $3')
}
