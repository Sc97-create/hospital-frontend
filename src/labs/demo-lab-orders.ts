export type LabItemStatus = "Pending" | "Processing" | "Completed" | "Cancelled";
export type LabOrderStatus = "Received" | "Processing" | "Completed" | "Cancelled";

export type LabOrderItem = {
    id: string;
    name: string;
    code: string;
    status: LabItemStatus;
    unit_price: number;
};

export type LabOrderDetail = {
    order_id: string;
    status: LabOrderStatus;
    received_at: string;
    patient_name: string;
    patient_code: string;
    patient_age: number;
    patient_gender: string;
    patient_phone: string;
    doctor_name: string;
    clinic_name: string;
    tests: LabOrderItem[];
};

export const DEMO_LAB_ORDERS: Record<string, LabOrderDetail> = {
    "LAB-10291": {
        order_id: "LAB-10291",
        status: "Processing",
        received_at: "2026-10-10T09:30:00",
        patient_name: "Rahul Sharma",
        patient_code: "P-10231",
        patient_age: 32,
        patient_gender: "Male",
        patient_phone: "+91 98765 43210",
        doctor_name: "Dr. Amit",
        clinic_name: "Floato Clinic",
        tests: [
            {
                id: "t1",
                name: "Complete Blood Count (CBC)",
                code: "HEM-01",
                status: "Pending",
                unit_price: 350,
            },
            {
                id: "t2",
                name: "Glycated Hemoglobin (HbA1c)",
                code: "BIO-12",
                status: "Processing",
                unit_price: 550,
            },
            {
                id: "t3",
                name: "Fasting Blood Sugar (FBS)",
                code: "BIO-04",
                status: "Pending",
                unit_price: 120,
            },
            {
                id: "t4",
                name: "Lipid Profile",
                code: "BIO-21",
                status: "Completed",
                unit_price: 650,
            },
            {
                id: "t5",
                name: "Vitamin D (25-OH)",
                code: "BIO-30",
                status: "Pending",
                unit_price: 900,
            },
        ],
    },
    "LAB-10288": {
        order_id: "LAB-10288",
        status: "Received",
        received_at: "2026-10-10T08:15:00",
        patient_name: "Meera Nair",
        patient_code: "P-10188",
        patient_age: 28,
        patient_gender: "Female",
        patient_phone: "+91 98111 22334",
        doctor_name: "Dr. Priya",
        clinic_name: "Floato Clinic",
        tests: [
            {
                id: "t1",
                name: "Thyroid Function Test (TFT)",
                code: "END-01",
                status: "Pending",
                unit_price: 700,
            },
            {
                id: "t2",
                name: "Complete Blood Count (CBC)",
                code: "HEM-01",
                status: "Pending",
                unit_price: 350,
            },
            {
                id: "t3",
                name: "Urine Routine",
                code: "URI-01",
                status: "Pending",
                unit_price: 200,
            },
        ],
    },
    "LAB-10285": {
        order_id: "LAB-10285",
        status: "Completed",
        received_at: "2026-10-09T16:40:00",
        patient_name: "Arjun Desai",
        patient_code: "P-10092",
        patient_age: 45,
        patient_gender: "Male",
        patient_phone: "+91 99001 11223",
        doctor_name: "Dr. Amit",
        clinic_name: "Floato Clinic",
        tests: [
            {
                id: "t1",
                name: "Liver Function Test (LFT)",
                code: "BIO-16",
                status: "Completed",
                unit_price: 600,
            },
            {
                id: "t2",
                name: "Kidney Function Test (KFT)",
                code: "BIO-15",
                status: "Completed",
                unit_price: 550,
            },
        ],
    },
    "LAB-10280": {
        order_id: "LAB-10280",
        status: "Processing",
        received_at: "2026-10-09T11:05:00",
        patient_name: "Sneha Patil",
        patient_code: "P-10055",
        patient_age: 36,
        patient_gender: "Female",
        patient_phone: "+91 97654 32109",
        doctor_name: "Dr. Karthik",
        clinic_name: "Floato Clinic",
        tests: [
            {
                id: "t1",
                name: "Complete Blood Count (CBC)",
                code: "HEM-01",
                status: "Completed",
                unit_price: 350,
            },
            {
                id: "t2",
                name: "ESR",
                code: "HEM-02",
                status: "Processing",
                unit_price: 180,
            },
            {
                id: "t3",
                name: "CRP",
                code: "BIO-28",
                status: "Processing",
                unit_price: 450,
            },
            {
                id: "t4",
                name: "Blood Sugar",
                code: "BIO-06",
                status: "Pending",
                unit_price: 120,
            },
        ],
    },
    "LAB-10276": {
        order_id: "LAB-10276",
        status: "Received",
        received_at: "2026-10-08T14:20:00",
        patient_name: "Vikram Joshi",
        patient_code: "P-10021",
        patient_age: 52,
        patient_gender: "Male",
        patient_phone: "+91 91234 56789",
        doctor_name: "Dr. Priya",
        clinic_name: "Floato Clinic",
        tests: [
            {
                id: "t1",
                name: "Lipid Profile",
                code: "BIO-21",
                status: "Pending",
                unit_price: 650,
            },
        ],
    },
};

export function getDemoLabOrder(labId: string): LabOrderDetail {
    return (
        DEMO_LAB_ORDERS[labId] ?? {
            order_id: labId,
            status: "Received",
            received_at: new Date().toISOString(),
            patient_name: "Unknown Patient",
            patient_code: "—",
            patient_age: 0,
            patient_gender: "—",
            patient_phone: "—",
            doctor_name: "—",
            clinic_name: "—",
            tests: [],
        }
    );
}
