import { findOne as findPatientById } from '../patientmangement/api/patients';
import type { patientlist } from '../patientmangement/types/patients';
import type { StatusType } from '../constants/status-colors';
import { getPrescriptionStatusType } from '../constants/status-colors';

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

/** Paid / finished Rx (link paid or fully dispensed). */
export function isFullyDispensedPrescriptionStatus(status: string | undefined | null): boolean {
    const normalized = normalizePrescriptionStatus(status);
    return (
        normalized === 'completed' ||
        normalized === 'full_dispensed' ||
        normalized === 'fully_dispensed' ||
        normalized === 'dispensed'
    );
}

/** Payment link generated — awaiting patient pay. */
export function isPaymentPendingPrescriptionStatus(
    status: string | undefined | null,
): boolean {
    const normalized = normalizePrescriptionStatus(status);
    return normalized === 'payment_pending' || normalized === 'payment_link_created';
}

/**
 * Tentative / partial — stock-out or patient took only part of the Rx.
 * Remaining-balance checkout not available yet.
 */
export function isPartiallyDispensedPrescriptionStatus(
    status: string | undefined | null,
): boolean {
    const normalized = normalizePrescriptionStatus(status);
    return (
        normalized === 'tentative' ||
        normalized === 'partially_dispensed' ||
        normalized === 'partial_dispensed'
    );
}

/** Shown when Rx is tentative / partial — remaining-balance checkout not available. */
export const PARTIAL_DISPENSE_BLOCK_MESSAGE =
    'This prescription is tentative (partial dispense). Create a new prescription to continue — remaining-balance checkout is not available yet.';

/** Human-readable prescription / pharma status for tags. */
export function formatPrescriptionStatusLabel(status: string | undefined | null): string {
    switch (normalizePrescriptionStatus(status)) {
        case 'draft':
            return 'Draft';
        case 'sent':
            return 'Sent';
        case 'payment_pending':
        case 'payment_link_created':
            return 'Payment pending';
        case 'completed':
            return 'Completed';
        case 'tentative':
            return 'Tentative';
        case 'partially_dispensed':
        case 'partial_dispensed':
            return 'Tentative';
        case 'full_dispensed':
        case 'fully_dispensed':
        case 'dispensed':
            return 'Completed';
        case 'cancelled':
        case 'canceled':
            return 'Cancelled';
        default:
            return status?.trim() ? toTitleCase(status) : '—';
    }
}

export function getPrescriptionStatusTagColor(status: string | undefined | null): StatusType {
    return getPrescriptionStatusType(status);
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
