/**
 * Dashboard data shapes — replace getDashboardOverview() with API when ready.
 * Currently returns empty day-board data for empty-state testing.
 */

export type VisitType = "new_patient" | "follow_up" | "opd";
export type QueueStatus = "ongoing" | "waiting" | "scheduled" | "completed" | "missed";
export type PrescriptionAttentionStatus = "draft" | "pending";

export interface DashboardKpis {
  scheduled: number;
  ongoing: number;
  completed: number;
  missed: number;
  waiting: number;
}

export interface QueueAppointment {
  appointment_id: string;
  start_time: string;
  end_time: string;
  patient_id: string;
  patient_name: string;
  patient_gender: string;
  patient_age: number;
  doctor_name: string;
  visit_type: VisitType;
  status: QueueStatus;
  mobile_no: string;
}

export interface UpNextAppointment {
  appointment_id: string;
  start_time: string;
  patient_id: string;
  patient_name: string;
  doctor_name: string;
  visit_type: VisitType;
}

export interface PrescriptionAttentionItem {
  id: string;
  code: string;
  prescribed_by: string;
  prescription_date: string;
  status: PrescriptionAttentionStatus;
}

export interface SearchPatientItem {
  patient_id: string;
  patient_code: string;
  patient_name: string;
  patient_phone: string;
  patient_age: number;
  patient_gender: string;
}

export interface DashboardOverview {
  clinic_name: string;
  branch_label: string;
  date_label: string;
  kpis: DashboardKpis;
  queue: QueueAppointment[];
  up_next: UpNextAppointment[];
  prescriptions_attention: PrescriptionAttentionItem[];
  patients: SearchPatientItem[];
}

const EMPTY_OVERVIEW: DashboardOverview = {
  clinic_name: "ClearSkin Clinic",
  branch_label: "Hubli Branch",
  date_label: new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  }),
  kpis: {
    scheduled: 0,
    ongoing: 0,
    completed: 0,
    missed: 0,
    waiting: 0,
  },
  queue: [],
  up_next: [],
  prescriptions_attention: [],
  patients: [],
};

/** Swap this for an API fetch later. */
export function getDashboardOverview(): DashboardOverview {
  return EMPTY_OVERVIEW;
}

export function searchPatients(
  query: string,
  patients: SearchPatientItem[],
): SearchPatientItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return patients
    .filter(
      (p) =>
        p.patient_name.toLowerCase().includes(q) ||
        p.patient_code.toLowerCase().includes(q) ||
        p.patient_phone.includes(q),
    )
    .slice(0, 8);
}
