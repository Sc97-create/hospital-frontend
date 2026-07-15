import { findOne as findPatientById } from '../patientmangement/api/patients';
import type { patientlist } from '../patientmangement/types/patients';

export type PrescriptionLocationState = {
    patientId?: string;
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

export async function fetchPatientById(patientId: string): Promise<patientlist | null> {
    try {
        const res = await findPatientById(patientId);
        return res?.data ?? null;
    } catch (error) {
        console.error('getpatientByID failed:', error);
        return null;
    }
}
