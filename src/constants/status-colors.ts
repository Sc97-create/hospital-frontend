/** Semantic status palette — the only four tag/status colors used in the app. */
export type StatusType = 'info' | 'success' | 'warning' | 'danger';

export const STATUS_TYPES: readonly StatusType[] = [
    'info',
    'success',
    'warning',
    'danger',
] as const;

export function statusTagClassName(type: StatusType, extra?: string): string {
    return ['status-tag', `status-tag--${type}`, 'app-tag', extra]
        .filter(Boolean)
        .join(' ');
}

function normalizeKey(value: string | undefined | null): string {
    return value?.trim().toLowerCase().replace(/[\s-]+/g, '_') ?? '';
}

export function getPatientStatusType(status: string | undefined | null): StatusType {
    switch (normalizeKey(status)) {
        case 'active':
        case 'completed':
            return 'success';
        case 'pending':
            return 'warning';
        case 'cancelled':
        case 'canceled':
        case 'inactive':
            return 'danger';
        default:
            return 'info';
    }
}

export function getAppointmentStatusType(status: string | undefined | null): StatusType {
    switch (normalizeKey(status)) {
        case 'scheduled':
        case 'upcoming':
        case 'ongoing':
            return 'info';
        case 'completed':
            return 'success';
        case 'reschedule_required':
            return 'warning';
        case 'cancelled':
        case 'canceled':
        case 'missed':
            return 'danger';
        default:
            return 'info';
    }
}

export function getPrescriptionStatusType(status: string | undefined | null): StatusType {
    switch (normalizeKey(status)) {
        case 'sent':
        case 'payment_link_created':
            return 'info';
        case 'dispensed':
        case 'full_dispensed':
        case 'fully_dispensed':
            return 'success';
        case 'draft':
        case 'pending':
        case 'partially_dispensed':
        case 'partial_dispensed':
            return 'warning';
        case 'expired':
        case 'cancelled':
        case 'canceled':
            return 'danger';
        default:
            return 'info';
    }
}


export function getEmployeeStatusType(status: string | undefined | null): StatusType {
    switch (normalizeKey(status)) {
        case 'active':
            return 'success';
        case 'on_leave':
            return 'warning';
        case 'inactive':
            return 'danger';
        default:
            return 'info';
    }
}

export function getSupplierStatusType(status: string | undefined | null): StatusType {
    switch (normalizeKey(status)) {
        case 'active':
            return 'success';
        case 'inactive':
            return 'danger';
        default:
            return 'info';
    }
}

export function getQueueStatusType(
    status: 'ongoing' | 'waiting' | 'scheduled' | 'completed' | 'missed' | string,
): StatusType {
    switch (status) {
        case 'ongoing':
        case 'scheduled':
            return 'info';
        case 'waiting':
            return 'warning';
        case 'completed':
            return 'success';
        case 'missed':
            return 'danger';
        default:
            return 'info';
    }
}

/** Non-workflow labels (codes, visit types, forms) use info. */
export const STATUS_INFO: StatusType = 'info';
export const STATUS_SUCCESS: StatusType = 'success';
export const STATUS_WARNING: StatusType = 'warning';
export const STATUS_DANGER: StatusType = 'danger';
