import apiClient from "../../lib/api-client";
import type {
    BillingCreatePayload,
    BillingCreateResponse,
    BillingPaymentInfo,
    ConfirmPaymentPayload,
    ConfirmPaymentResponse,
    createPrescResponse,
    CreatePrescription,
    DispenseCheckoutResponse,
    FindManyResponse,
    findOneResponse,
    GetInvoiceByPrescriptionResponse,
    InvoiceByPrescription,
    PrescriptionByPatientIdResponse,
    SearchMedicineResponse,
    UpdatePrescriptionItemPayload,
    UpdatePrescriptionItemResponse,
    UpdatePrescriptionStatus,
    UpdateStatusResponse,
} from "../types/prescriptionmodel";

export const SearchMedicines = async (
    name: string,
    organisation_id: string,
): Promise<SearchMedicineResponse> => {
    const response = await apiClient.get(`/medicine/searchMedicine`, {
        params: { name, organisation_id },
    })
    return response.data
}
export const CreatePrescriptionApi = async (createprescription: CreatePrescription): Promise<createPrescResponse> => {
    const response = await apiClient.post(`/prescription/create`, createprescription)
    return response.data
}
export const UpdatePrescription = async (updateprescription: CreatePrescription): Promise<createPrescResponse> => {
    const response = await apiClient.patch(`/prescription/updatePrescriptions`, updateprescription)
    return response.data
}
export const UpdatePrescriptionItem = async (
    payload: UpdatePrescriptionItemPayload,
): Promise<UpdatePrescriptionItemResponse> => {
    const response = await apiClient.patch(`/prescription/updatePrescriptionItem`, payload)
    return response.data
}
export const FindOnePrescription = async (prescription_id: string, limit: number = 3, offset: number = 0): Promise<findOneResponse> => {
    const response = await apiClient.get(`/prescription/getprescriptionbyPid`, { params: { prescription_id, limit, offset } })    
    return response.data
}
export const GetPrescriptionByPatientID = async (
    patient_id: string,
    limit: number = 10,
    page_no: number = 1,
): Promise<PrescriptionByPatientIdResponse> => {
    const response = await apiClient.get(`/prescription/getPrescriptionByPatientID`, {
        params: { patient_id, limit, page_no },
    });
    return response.data;
}
export const FindAllPrescription = async (
    limit: number = 10,
    offset: number = 0,
    organisation_id: string,
    search?: string,
): Promise<FindManyResponse> => {
    const trimmedSearch = search?.trim();
    const response = await apiClient.get(`/prescription/get`, {
        params: {
            limit,
            offset,
            organisation_id,
            ...(trimmedSearch ? { search: trimmedSearch } : {}),
        },
    })
    return response.data
}
export const GetByStatus = async (
    limit: number = 10,
    offset: number = 0,
    organisation_id: string,
    status: string,
    search?: string,
): Promise<FindManyResponse> => {
    const trimmedSearch = search?.trim();
    const response = await apiClient.get(`/prescription/getByStatus`, {
        params: {
            limit,
            offset,
            organisation_id,
            status,
            ...(trimmedSearch ? { search: trimmedSearch } : {}),
        },
    })
    return response.data
}
export const UpdateStatus = async (updateprescription: UpdatePrescriptionStatus): Promise<UpdateStatusResponse> => {
    const response = await apiClient.patch(`/prescription/updateStatus`, updateprescription)
    return response.data
}

/** Batch-aware lines for pharmacist checkout (FEFO / stock decrement). */
export const GetDispenseCheckoutLines = async (
    prescription_id: string,
): Promise<DispenseCheckoutResponse> => {
    const response = await apiClient.get(`/prescription/getMedicineInfo/${prescription_id}`)
    return response.data
}

/** Confirm & Pay — create bill; cash/qr then confirm via /payment/confirm on swipe. */
export const CreateBilling = async (
    payload: BillingCreatePayload,
): Promise<BillingCreateResponse> => {
    const response = await apiClient.post(`/billing/create`, payload, {
        headers: {
            'Idempotency-Key': payload.idempotency_key,
        },
    })
    return response.data
}

/** Cash / QR — pharmacist swipe confirms payment. */
export const ConfirmPayment = async (
    payload: ConfirmPaymentPayload,
): Promise<ConfirmPaymentResponse> => {
    const response = await apiClient.post(`/payment/confirm`, payload, {
        headers: {
            'Idempotency-Key': payload.idempotency_key,
        },
    })
    return response.data
}

export function parseBillingCreateResponse(
    response: BillingCreateResponse,
): BillingPaymentInfo {
    const payment = response.payment ?? response.data?.payment;
    if (payment?.invoice_id) {
        return {
            invoice_id: payment.invoice_id,
            payment_url: payment.payment_url ?? undefined,
        };
    }
    throw new Error('Billing response missing payment.invoice_id');
}

/** Resume unpaid checkout — existing invoice for this prescription, if any. */
export const GetInvoiceByPrescriptionID = async (
    prescription_id: string,
): Promise<GetInvoiceByPrescriptionResponse> => {
    const response = await apiClient.get(
        `/billing/getInvoiceByPrescriptionID/${prescription_id}`,
    );
    return response.data;
};

export function parseInvoiceByPrescriptionResponse(
    response: GetInvoiceByPrescriptionResponse,
): InvoiceByPrescription | null {
    const body = response.data ?? response;
    const id = body.id;

    if (!id || typeof id !== 'string') {
        return null;
    }

    return {
        id,
        invoice_code: body.invoice_code ?? '',
        prescription_id: body.prescription_id ?? '',
        patient_id: body.patient_id ?? '',
        status: body.status ?? '',
        cashier_id: body.cashier_id ?? '',
        organisation_id: body.organisation_id ?? '',
        sub_total_amount: body.sub_total_amount ?? 0,
        tax_amount: body.tax_amount ?? 0,
        total_amount: body.total_amount ?? 0,
        discount_amount: body.discount_amount ?? 0,
        created_at: body.created_at ?? '',
        updated_at: body.updated_at ?? '',
    };
}
