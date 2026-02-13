// Database Types
export type StaffRole = 'admin' | 'operations_manager' | 'warehouse_staff' | 'driver' | 'accountant'
export type OrderStatus = 'pending' | 'confirmed' | 'scheduled' | 'in_transit' | 'completed' | 'cancelled' | 'failed'
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'partially_refunded'
export type StorageUnitStatus = 'available' | 'occupied' | 'reserved' | 'maintenance' | 'inactive'
export type JobType = 'pickup' | 'delivery' | 'both'
export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'online' | 'wallet'

// Database Tables
export interface Customer {
    id: string
    customer_code: string
    first_name: string
    last_name: string
    email: string
    phone: string
    alternate_phone?: string
    address_line1: string
    address_line2?: string
    city: string
    state?: string
    postal_code: string
    country: string
    company_name?: string
    gst_number?: string
    is_active: boolean
    notes?: string
    created_at: string
    updated_at: string
    deleted_at?: string
}

export interface Warehouse {
    id: string
    warehouse_code: string
    name: string
    description?: string
    address_line1: string
    address_line2?: string
    city: string
    state?: string
    postal_code: string
    country: string
    latitude?: number
    longitude?: number
    total_units: number
    occupied_units: number
    manager_name?: string
    contact_phone?: string
    contact_email?: string
    is_active: boolean
    created_at: string
    updated_at: string
    deleted_at?: string
}

export interface StorageUnit {
    id: string
    warehouse_id: string
    unit_number: string
    floor_number?: number
    section?: string
    size_label?: string
    length_cm?: number
    width_cm?: number
    height_cm?: number
    volume_cubic_meters?: number
    monthly_rate: number
    status: StorageUnitStatus
    current_customer_id?: string
    occupied_since?: string
    climate_controlled: boolean
    has_electricity: boolean
    notes?: string
    created_at: string
    updated_at: string
    deleted_at?: string
}

export interface Staff {
    id: string
    auth_user_id?: string
    staff_code: string
    first_name: string
    last_name: string
    email: string
    phone: string
    role: StaffRole
    warehouse_id?: string
    license_number?: string
    vehicle_number?: string
    vehicle_type?: string
    hire_date: string
    employment_status: string
    address?: string
    is_active: boolean
    created_at: string
    updated_at: string
    deleted_at?: string
}

export interface Order {
    id: string
    order_number: string
    customer_id: string
    assigned_driver_id?: string
    warehouse_id?: string
    storage_unit_id?: string
    job_type: JobType
    status: OrderStatus
    scheduled_date: string
    scheduled_time_start?: string
    scheduled_time_end?: string
    actual_start_time?: string
    actual_end_time?: string
    pickup_address_line1?: string
    pickup_address_line2?: string
    pickup_city?: string
    pickup_postal_code?: string
    pickup_latitude?: number
    pickup_longitude?: number
    delivery_address_line1?: string
    delivery_address_line2?: string
    delivery_city?: string
    delivery_postal_code?: string
    delivery_latitude?: number
    delivery_longitude?: number
    estimated_items_count: number
    actual_items_count: number
    service_fee: number
    proof_image_url?: string
    customer_signature_url?: string
    driver_notes?: string
    customer_notes?: string
    internal_notes?: string
    priority: number
    created_at: string
    updated_at: string
    deleted_at?: string
}

export interface InventoryItem {
    id: string
    customer_id: string
    storage_unit_id?: string
    warehouse_id?: string
    item_code?: string
    item_name: string
    description?: string
    category?: string
    quantity: number
    weight_kg?: number
    barcode?: string
    qr_code?: string
    image_url?: string
    condition?: string
    received_date?: string
    expected_retrieval_date?: string
    is_active: boolean
    notes?: string
    created_at: string
    updated_at: string
    deleted_at?: string
}

export interface Payment {
    id: string
    payment_number: string
    customer_id: string
    order_id?: string
    storage_unit_id?: string
    payment_type: string
    amount: number
    gst_amount: number
    total_amount: number
    status: PaymentStatus
    payment_method?: PaymentMethod
    invoice_date: string
    due_date: string
    paid_date?: string
    transaction_id?: string
    payment_reference?: string
    refund_amount: number
    refund_date?: string
    refund_reason?: string
    invoice_url?: string
    receipt_url?: string
    notes?: string
    created_at: string
    updated_at: string
    deleted_at?: string
}

export interface AuditLog {
    id: string
    user_id?: string
    staff_id?: string
    action: string
    table_name: string
    record_id: string
    old_values?: Record<string, any>
    new_values?: Record<string, any>
    changes?: Record<string, any>
    ip_address?: string
    user_agent?: string
    description?: string
    created_at: string
}

// Extended types with joins
export interface OrderWithRelations extends Order {
    customer?: Customer
    assigned_driver?: Staff
    warehouse?: Warehouse
    storage_unit?: StorageUnit
}

export interface StorageUnitWithRelations extends StorageUnit {
    warehouse?: Warehouse
    current_customer?: Customer
}

export interface PaymentWithRelations extends Payment {
    customer?: Customer
    order?: Order
    storage_unit?: StorageUnit
}
