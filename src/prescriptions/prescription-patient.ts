import { findOne as findPatientById } from '../patientmangement/api/patients';
import type { patientlist } from '../patientmangement/types/patients';

export type PrescriptionLocationState = {
    patientId?: string;
    status?: string;
    createdAt?: string;
};

const patientIdStorageKey = (prescriptionId: string) => `rx-patient:${prescriptionId}`;

export function rememberPrescriptionPatientId(
    prescriptionId: string | undefined,
    patientId: string | undefined,
) {
    if (!prescriptionId || !patientId?.trim()) return;
    try {
        sessionStorage.setItem(patientIdStorageKey(prescriptionId), patientId.trim());
    } catch {
        // ignore quota / private mode
    }
}

export function recallPrescriptionPatientId(
    prescriptionId: string | undefined,
): string | undefined {
    if (!prescriptionId) return undefined;
    try {
        return sessionStorage.getItem(patientIdStorageKey(prescriptionId)) || undefined;
    } catch {
        return undefined;
    }
}

/** Build detail/checkout path while keeping patientId in the query string. */
export function prescriptionPath(
    prescriptionId: string,
    options?: { checkout?: boolean; patientId?: string | null },
): { pathname: string; search?: string } {
    const pathname = options?.checkout
        ? `/prescription/${prescriptionId}/checkout`
        : `/prescription/${prescriptionId}`;
    const patientId = options?.patientId?.trim();
    return {
        pathname,
        search: patientId ? `?patientId=${encodeURIComponent(patientId)}` : undefined,
    };
}

/** Resolve patient_id from list navigation, query string, cache, or prescription APIs. */
export function resolvePrescriptionPatientId(sources: {
    locationPatientId?: string | null;
    queryPatientId?: string | null;
    cachedPatientId?: string | null;
    apiPatientId?: string | null;
}): string | undefined {
    const candidates = [
        sources.locationPatientId,
        sources.queryPatientId,
        sources.cachedPatientId,
        sources.apiPatientId,
    ];
    for (const value of candidates) {
        const trimmed = value?.trim();
        if (trimmed) return trimmed;
    }
    return undefined;
}

export function formatPatientSubtext(patient: patientlist): string {
    return (
        [
            patient.patient_code ? `UHID: ${patient.patient_code}` : null,
            patient.patient_age != null ? `${patient.patient_age}y` : null,
            patient.patient_gender || null,
        ]
            .filter(Boolean)
            .join(' · ') || '—'
    );
}

/** Title-case status / labels from API (e.g. "active" → "Active"). */
export function toTitleCase(value: string | undefined | null): string {
    if (!value?.trim()) return '—';
    return value
        .trim()
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizePrescriptionStatus(status: string | undefined | null): string {
    return status?.trim().toLowerCase().replace(/[\s-]+/g, '_') ?? '';
}

export function isDraftPrescriptionStatus(status: string | undefined | null): boolean {
    return normalizePrescriptionStatus(status) === 'draft';
}

export function isCancelledPrescriptionStatus(status: string | undefined | null): boolean {
    const normalized = normalizePrescriptionStatus(status);
    return normalized === 'cancelled' || normalized === 'canceled';
}

export function isFullyDispensedPrescriptionStatus(status: string | undefined | null): boolean {
    const normalized = normalizePrescriptionStatus(status);
    return (
        normalized === 'full_dispensed' ||
        normalized === 'fully_dispensed' ||
        normalized === 'dispensed'
    );
}

/** Human-readable prescription / pharma status for tags. */
export function formatPrescriptionStatusLabel(status: string | undefined | null): string {
    switch (normalizePrescriptionStatus(status)) {
        case 'payment_link_created':
            return 'Payment link created';
        case 'partially_dispensed':
        case 'partial_dispensed':
            return 'Partially dispensed';
        case 'full_dispensed':
        case 'fully_dispensed':
            return 'Fully dispensed';
        case 'cancelled':
        case 'canceled':
            return 'Cancelled';
        default:
            return status?.trim() ? toTitleCase(status) : '—';
    }
}

export function getPrescriptionStatusTagColor(status: string | undefined | null): string {
    switch (normalizePrescriptionStatus(status)) {
        case 'sent':
            return 'cyan';
        case 'dispensed':
        case 'full_dispensed':
        case 'fully_dispensed':
            return 'green';
        case 'draft':
        case 'pending':
            return 'default';
        case 'partially_dispensed':
        case 'partial_dispensed':
            return 'orange';
        case 'payment_link_created':
            return 'blue';
        case 'expired':
        case 'cancelled':
        case 'canceled':
            return 'red';
        default:
            return 'default';
    }
}

export async function fetchPatientById(patientId: string): Promise<patientlist | null> {
    try {
        const res = await findPatientById(patientId);
        return res?.data ?? null;
    } catch (error) {
        console.error('getpatientByID failed:', error);
        return null;
    }
}
