import {
    Avatar,
    Breadcrumb,
    Button,
    Card,
    Checkbox,
    Col,
    Input,
    InputNumber,
    Layout,
    message,
    Modal,
    Row,
    Segmented,
    Space,
    Table,
    Typography,
} from 'antd';
import {
    ArrowLeftOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    HomeOutlined,
    PrinterOutlined,
    UserOutlined,
    WarningOutlined,
} from '@ant-design/icons';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';

import Sidebar from '../sidebar';
import { ConfirmPayment, CreateBilling, GetDispenseCheckoutLines, parseBillingCreateResponse } from './api/prescription';
import type {
    BillingCreatePayload,
    CheckoutPaymentMethod,
    DispenseLineResponse,
    MedicineBatch,
} from './types/prescriptionmodel';
import {
    fetchPatientById,
    formatPatientSubtext,
    formatPrescriptionStatusLabel,
    getPrescriptionStatusTagColor,
    prescriptionPath,
    recallPrescriptionPatientId,
    rememberPrescriptionPatientId,
    resolvePrescriptionPatientId,
    type PrescriptionLocationState,
} from './prescription-patient';
import { StatusTag } from '../components/status-tag';
import {
    STATUS_INFO,
    STATUS_SUCCESS,
    STATUS_WARNING,
} from '../constants/status-colors';
import type { patientlist } from '../patientmangement/types/patients';
import PrescriptionPreviewSkeleton from './prescription-preview-skeleton';
import SwipeToConfirm from './components/swipe-to-confirm';

import './prescription-preview.css';
import './prescription-checkout.css';

const { Content } = Layout;
const { Title, Text } = Typography;

const TAX_RATE = 0.05;
const FALLBACK_SUPPLIER_ID = 'sample-supplier-id';
const PAYMENT_LINK_CREATED = 'payment_link_created';
/** Checkout session lock — Confirm & Pay disabled when this hits 0. */
const CHECKOUT_TIMEOUT_SECONDS = 2 * 60;

type PaymentMethod = CheckoutPaymentMethod;

const MANUAL_PAYMENT_METHODS: PaymentMethod[] = ['cash', 'qr'];

function isManualPayment(method: PaymentMethod): boolean {
    return MANUAL_PAYMENT_METHODS.includes(method);
}

function isPaymentLinkCreated(status?: string): boolean {
    return status?.toLowerCase() === PAYMENT_LINK_CREATED;
}

function extractApiErrorMessage(error: unknown, fallback: string): string {
    if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data &&
        typeof error.response.data.message === 'string'
    ) {
        return error.response.data.message;
    }
    if (error instanceof Error && error.message) {
        return error.message;
    }
    return fallback;
}

function formatCountdown(totalSeconds: number): string {
    const safe = Math.max(0, totalSeconds);
    const minutes = Math.floor(safe / 60);
    const seconds = safe % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

interface CheckoutBatchAllocation {
    batch_id: string;
    batch_no: string;
    expires_at: string;
    current_stock_units: number;
    shelf_location: string;
    unit_selling_price: number;
    allocate_qty: number;
    supplier_id?: string;
}

interface CheckoutLineItem {
    key: string;
    prescription_item_id: string;
    prescription_code: string;
    prescription_status: string;
    medicine_id: string;
    medicine_name: string;
    medicine_form: string;
    medicine_strength: string;
    frequency_label: string;
    prescribed_qty: number;
    dispense_qty: number;
    unit_price: number;
    selected: boolean;
    source_batches: MedicineBatch[];
    batches: CheckoutBatchAllocation[];
    supplier_id?: string;
}

/** Sample matching backend dispense response (same medicine_id, different prescription_item_id). */
const FALLBACK_DISPENSE_LINES: DispenseLineResponse[] = [
    {
        prescription_code: 'PRX2607109353',
        prescription_status: 'sent',
        prescription_created_at: '2026-07-10T19:49:07.807192+05:30',
        prescribed_quantity: 4,
        prescription_id: 'd0c9aee7-2d51-4949-acba-24d81519bfc0',
        prescription_item_id: '714ab692-d868-45d9-8958-44612206389e',
        medicine_id: '43a75235-c7be-435d-96da-448d24c35994',
        medicine_name: 'Dolo 650mg',
        medicine_form: 'TABLET',
        medicine_strength: '650mg',
        frequency: { morning: 0, afternoon: 0, night: 1 },
        reorder_level: 50,
        max_stock_target: 200,
        medicine_batches: [
            {
                batch_id: '4efcf266-226f-423e-94b0-68235c023968',
                batch_no: 'BAT-4029',
                expires_at: '2028-12-31',
                current_stock_units: 150,
                units_per_box: 15,
                pricing: {
                    mrp: 30,
                    unit_price: 2,
                    selling_price: 28.5,
                    unit_selling_price: 0,
                },
                shelf_location: 'Rack 3-B',
                supplier_id: FALLBACK_SUPPLIER_ID,
            },
            {
                batch_id: 'a1b2c3d4-1111-2222-3333-444455556666',
                batch_no: 'BAT-3188',
                expires_at: '2027-06-01',
                current_stock_units: 40,
                units_per_box: 15,
                pricing: {
                    mrp: 30,
                    unit_price: 2.1,
                    selling_price: 27,
                    unit_selling_price: 0,
                },
                shelf_location: 'Rack 3-A',
                supplier_id: FALLBACK_SUPPLIER_ID,
            },
        ],
    },
    {
        prescription_code: 'PRX2607109353',
        prescription_status: 'sent',
        prescription_created_at: '2026-07-10T19:49:07.807192+05:30',
        prescribed_quantity: 7,
        prescription_id: 'd0c9aee7-2d51-4949-acba-24d81519bfc0',
        prescription_item_id: '9fbff488-3995-4936-8ca7-8debea3e403e',
        medicine_id: '43a75235-c7be-435d-96da-448d24c35994',
        medicine_name: 'Dolo 650mg',
        medicine_form: 'TABLET',
        medicine_strength: '650mg',
        frequency: { morning: 1, afternoon: 0, night: 0 },
        reorder_level: 50,
        max_stock_target: 200,
        medicine_batches: [
            {
                batch_id: '4efcf266-226f-423e-94b0-68235c023968',
                batch_no: 'BAT-4029',
                expires_at: '2028-12-31',
                current_stock_units: 150,
                units_per_box: 15,
                pricing: {
                    mrp: 30,
                    unit_price: 2,
                    selling_price: 28.5,
                    unit_selling_price: 0,
                },
                shelf_location: 'Rack 3-B',
                supplier_id: FALLBACK_SUPPLIER_ID,
            },
        ],
    },
];

function formatInr(amount: number): string {
    return `₹${amount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function frequencyLabel(frequency: DispenseLineResponse['frequency']): string {
    const parts: string[] = [];
    if (frequency.morning > 0) {
        parts.push(frequency.morning > 1 ? `MOR ×${frequency.morning}` : 'MOR');
    }
    if (frequency.afternoon > 0) {
        parts.push(frequency.afternoon > 1 ? `AFT ×${frequency.afternoon}` : 'AFT');
    }
    if (frequency.night > 0) {
        parts.push(frequency.night > 1 ? `NIT ×${frequency.night}` : 'NIT');
    }
    return parts.join(' · ') || '—';
}

/** Prefer unit_selling_price when set; otherwise use unit_price (per tablet). */
function resolveUnitPrice(batch: MedicineBatch): number {
    const { pricing } = batch;
    if (pricing.unit_selling_price > 0) return pricing.unit_selling_price;
    if (pricing.unit_price > 0) return pricing.unit_price;
    if (pricing.selling_price > 0 && batch.units_per_box > 0) {
        return pricing.selling_price / batch.units_per_box;
    }
    return 0;
}

function pickSupplierIdFromBatches(
    batches: Array<{ supplier_id?: string }>,
): string | undefined {
    return batches.find((b) => Boolean(b.supplier_id?.trim()))?.supplier_id?.trim();
}

function pickSupplierIdFromLines(items: DispenseLineResponse[]): string | undefined {
    for (const item of items) {
        const fromLine = item.supplier_id?.trim();
        if (fromLine) return fromLine;
        const fromBatch = pickSupplierIdFromBatches(item.medicine_batches ?? []);
        if (fromBatch) return fromBatch;
    }
    return undefined;
}

function allocateFefo(
    batches: MedicineBatch[],
    dispenseQty: number,
    lineSupplierId?: string,
): CheckoutBatchAllocation[] {
    const sorted = [...batches].sort(
        (a, b) => new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime(),
    );

    let remaining = Math.max(0, dispenseQty);
    return sorted.map((batch) => {
        const unitPrice = resolveUnitPrice(batch);
        const take = Math.min(remaining, Math.max(0, batch.current_stock_units));
        remaining -= take;
        return {
            batch_id: batch.batch_id,
            batch_no: batch.batch_no,
            expires_at: batch.expires_at,
            current_stock_units: batch.current_stock_units,
            shelf_location: batch.shelf_location,
            unit_selling_price: unitPrice,
            allocate_qty: take,
            supplier_id: batch.supplier_id?.trim() || lineSupplierId?.trim() || undefined,
        };
    });
}

function mapDispenseToCheckoutLines(items: DispenseLineResponse[]): CheckoutLineItem[] {
    return items.map((item) => {
        const prescribed = item.prescribed_quantity ?? 0;
        const source_batches = item.medicine_batches ?? [];
        const lineSupplier =
            item.supplier_id?.trim() || pickSupplierIdFromBatches(source_batches);
        const batches = allocateFefo(source_batches, prescribed, lineSupplier);
        const unit_price =
            batches.find((b) => b.allocate_qty > 0)?.unit_selling_price ??
            (source_batches[0] ? resolveUnitPrice(source_batches[0]) : 0);
        const supplier_id =
            pickSupplierIdFromBatches(batches.filter((b) => b.allocate_qty > 0)) ||
            lineSupplier ||
            pickSupplierIdFromBatches(source_batches);

        return {
            key: item.prescription_item_id,
            prescription_item_id: item.prescription_item_id,
            prescription_code: item.prescription_code,
            prescription_status: item.prescription_status,
            medicine_id: item.medicine_id,
            medicine_name: item.medicine_name,
            medicine_form: item.medicine_form || '—',
            medicine_strength: item.medicine_strength || '',
            frequency_label: frequencyLabel(item.frequency),
            prescribed_qty: prescribed,
            dispense_qty: prescribed,
            unit_price,
            selected: true,
            source_batches,
            batches,
            supplier_id,
        };
    });
}

function batchSummary(batches: CheckoutBatchAllocation[]): string {
    const used = batches.filter((b) => b.allocate_qty > 0);
    if (used.length === 0) return 'No stock allocated';
    if (used.length === 1) {
        const b = used[0];
        return `${b.batch_no} ×${b.allocate_qty} · ${b.current_stock_units} avail`;
    }
    return used.map((b) => `${b.batch_no} ×${b.allocate_qty}`).join(' · ');
}

function allocationSum(batches: CheckoutBatchAllocation[]): number {
    return batches.reduce((sum, b) => sum + b.allocate_qty, 0);
}

function stockAvailable(batches: CheckoutBatchAllocation[]): number {
    return batches.reduce((sum, b) => sum + b.current_stock_units, 0);
}

function PrescriptionCheckout() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const locationState = (location.state as PrescriptionLocationState | null) ?? null;
    const [messageApi, contextHolder] = message.useMessage();
    const [loading, setLoading] = useState(true);
    const [usingMock, setUsingMock] = useState(false);
    const [lines, setLines] = useState<CheckoutLineItem[]>([]);
    const [rxCode, setRxCode] = useState('');
    const [rxStatus, setRxStatus] = useState('');
    const [patient, setPatient] = useState<patientlist | null>(null);
    const [resolvedPatientId, setResolvedPatientId] = useState<string | undefined>();
    const [resolvedSupplierId, setResolvedSupplierId] = useState<string | undefined>();
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
    const [notes, setNotes] = useState('');
    const [paying, setPaying] = useState(false);
    const [successOpen, setSuccessOpen] = useState(false);
    const [manualConfirmOpen, setManualConfirmOpen] = useState(false);
    const [statusUpdatedManually, setStatusUpdatedManually] = useState(false);
    const [paidAmount, setPaidAmount] = useState(0);
    const [paidItemCount, setPaidItemCount] = useState(0);
    const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
    const [pendingInvoiceId, setPendingInvoiceId] = useState<string | null>(null);
    const [pendingPaymentUrl, setPendingPaymentUrl] = useState<string | null>(null);
    const [transactionReference, setTransactionReference] = useState('');
    const [secondsLeft, setSecondsLeft] = useState(CHECKOUT_TIMEOUT_SECONDS);
    const [timerExpired, setTimerExpired] = useState(false);
    const expiryToastShown = useRef(false);

    const applyLines = (items: DispenseLineResponse[], mock: boolean) => {
        const mapped = mapDispenseToCheckoutLines(items);
        setLines(mapped);
        setUsingMock(mock);
        setRxCode(items[0]?.prescription_code ?? '');
        setRxStatus(items[0]?.prescription_status ?? '');
        setExpandedRowKeys(mapped.filter((l) => l.batches.length > 1).map((l) => l.key));
        setResolvedSupplierId(
            pickSupplierIdFromLines(items) ||
                mapped.find((l) => l.supplier_id)?.supplier_id,
        );
        setSecondsLeft(CHECKOUT_TIMEOUT_SECONDS);
        setTimerExpired(false);
        expiryToastShown.current = false;
    };

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setPatient(null);
            setResolvedSupplierId(undefined);
            if (!id) {
                applyLines(FALLBACK_DISPENSE_LINES, true);
                setLoading(false);
                return;
            }

            try {
                const response = await GetDispenseCheckoutLines(id);
                if (cancelled) return;
                const items = Array.isArray(response.data) ? response.data : [];
                if (items.length > 0) {
                    applyLines(items, false);
                } else {
                    applyLines(FALLBACK_DISPENSE_LINES, true);
                    messageApi.warning('No dispense lines returned — showing sample data');
                }

                const patientId = resolvePrescriptionPatientId({
                    locationPatientId: locationState?.patientId,
                    queryPatientId: searchParams.get('patientId'),
                    cachedPatientId: recallPrescriptionPatientId(id),
                    apiPatientId:
                        response.patient_id ||
                        items.find((item) => item.patient_id)?.patient_id,
                });
                setResolvedPatientId(patientId);
                rememberPrescriptionPatientId(id, patientId);

                if (patientId) {
                    const patientData = await fetchPatientById(patientId);
                    if (!cancelled) setPatient(patientData);
                }
            } catch (error) {
                if (cancelled) return;
                console.error('Failed to load dispense checkout lines:', error);
                applyLines(FALLBACK_DISPENSE_LINES, true);
                messageApi.warning('Using sample dispense lines (API unavailable)');

                const patientId = resolvePrescriptionPatientId({
                    locationPatientId: locationState?.patientId,
                    queryPatientId: searchParams.get('patientId'),
                    cachedPatientId: recallPrescriptionPatientId(id),
                    apiPatientId: null,
                });
                setResolvedPatientId(patientId);
                rememberPrescriptionPatientId(id, patientId);

                if (patientId) {
                    const patientData = await fetchPatientById(patientId);
                    if (!cancelled) setPatient(patientData);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- load once per id / patient source
    }, [id, locationState?.patientId, searchParams]);

    useEffect(() => {
        if (loading || timerExpired) {
            return;
        }

        const intervalId = window.setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    window.clearInterval(intervalId);
                    setTimerExpired(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => window.clearInterval(intervalId);
    }, [loading, timerExpired, id]);

    useEffect(() => {
        if (!timerExpired || expiryToastShown.current) return;
        expiryToastShown.current = true;
        setManualConfirmOpen(false);
        setPendingPayload(null);
        messageApi.warning('Checkout time expired — reload to try again');
    }, [timerExpired, messageApi]);

    const confirmDisabled =
        isPaymentLinkCreated(rxStatus) || timerExpired;

    const totals = useMemo(() => {
        const billed = lines.filter((line) => line.selected && line.dispense_qty > 0);
        const subtotal = billed.reduce((sum, line) => sum + line.dispense_qty * line.unit_price, 0);
        const tax = subtotal * TAX_RATE;
        return {
            subtotal,
            tax,
            total: subtotal + tax,
            itemCount: billed.length,
        };
    }, [lines]);

    const allocationErrors = useMemo(() => {
        return lines
            .filter((line) => line.selected && line.dispense_qty > 0)
            .flatMap((line) => {
                const issues: string[] = [];
                const allocated = allocationSum(line.batches);
                if (allocated !== line.dispense_qty) {
                    issues.push(
                        `${line.medicine_name} (${line.frequency_label}): allocated ${allocated} ≠ dispense ${line.dispense_qty}`,
                    );
                }
                for (const batch of line.batches) {
                    if (batch.allocate_qty > batch.current_stock_units) {
                        issues.push(
                            `${line.medicine_name}: ${batch.batch_no} take ${batch.allocate_qty} > stock ${batch.current_stock_units}`,
                        );
                    }
                }
                if (stockAvailable(line.batches) < line.dispense_qty) {
                    issues.push(
                        `${line.medicine_name} (${line.frequency_label}): insufficient stock`,
                    );
                }
                return issues;
            });
    }, [lines]);

    const setDispenseQty = (key: string, dispense_qty: number) => {
        setLines((prev) =>
            prev.map((line) => {
                if (line.key !== key) return line;
                const batches = allocateFefo(line.source_batches, dispense_qty, line.supplier_id);
                const unit_price =
                    batches.find((b) => b.allocate_qty > 0)?.unit_selling_price ?? line.unit_price;
                return { ...line, dispense_qty, batches, unit_price };
            }),
        );
    };

    const updateLineSelected = (key: string, selected: boolean) => {
        setLines((prev) => prev.map((line) => (line.key === key ? { ...line, selected } : line)));
    };

    const updateBatchAllocate = (lineKey: string, batchId: string, allocate_qty: number) => {
        setLines((prev) =>
            prev.map((line) => {
                if (line.key !== lineKey) return line;
                const batches = line.batches.map((b) =>
                    b.batch_id === batchId ? { ...b, allocate_qty } : b,
                );
                const dispense_qty = allocationSum(batches);
                return { ...line, batches, dispense_qty };
            }),
        );
    };

    const handleDiscard = () => {
        Modal.confirm({
            title: 'Discard Order?',
            content:
                'This will cancel checkout and return to the prescription detail. No payment will be recorded.',
            okText: 'Yes, Discard',
            okType: 'danger',
            cancelText: 'Keep Order',
            onOk: () => {
                messageApi.warning('Checkout discarded');
                if (!id) {
                    navigate('/prescription');
                    return;
                }
                navigate(prescriptionPath(id, { patientId: resolvedPatientId }), {
                    state: { patientId: resolvedPatientId },
                });
            },
        });
    };

    const buildBillingPayload = (): BillingCreatePayload | null => {
        const prescription_id = id || FALLBACK_DISPENSE_LINES[0]?.prescription_id || '';
        const patient_id = resolvedPatientId || '';
        const cashier_id = localStorage.getItem('user_id') || '';
        const organisation_id = localStorage.getItem('organisation_id') || '';

        const selectedLines = lines.filter((line) => line.selected && line.dispense_qty > 0);
        const dispense_items = selectedLines.flatMap((line) =>
            line.batches
                .filter((b) => b.allocate_qty > 0)
                .map((b) => {
                    const computed = b.allocate_qty * b.unit_selling_price;
                    return {
                        medicine_id: line.medicine_id,
                        medicine_inventory_id: b.batch_id,
                        prescription_item_id: line.prescription_item_id,
                        batch_no: b.batch_no,
                        current_stock_units: b.current_stock_units,
                        quantity_sold_units: b.allocate_qty,
                        unit_price_charged: b.unit_selling_price,
                        computed_item_total: computed,
                        total_amount: computed,
                    };
                }),
        );

        // Prefer allocated batch supplier from getMedicineInfo; fall back to source batches / load cache
        const supplier_id =
            pickSupplierIdFromBatches(
                selectedLines.flatMap((line) => line.batches.filter((b) => b.allocate_qty > 0)),
            ) ||
            pickSupplierIdFromBatches(selectedLines.flatMap((line) => line.source_batches)) ||
            selectedLines.find((l) => l.supplier_id)?.supplier_id ||
            resolvedSupplierId ||
            '';

        if (!prescription_id) {
            messageApi.error('Missing prescription id for billing');
            return null;
        }
        if (!patient_id) {
            messageApi.error('Missing patient id for billing');
            return null;
        }
        if (!cashier_id) {
            messageApi.error('Missing cashier (user) id — please log in again');
            return null;
        }
        if (!organisation_id) {
            messageApi.error('Missing organisation id — please log in again');
            return null;
        }
        if (!supplier_id) {
            messageApi.error(
                'Missing supplier_id from medicine batches — reload checkout and try again',
            );
            return null;
        }

        if (dispense_items.length === 0) {
            return null;
        }

        return {
            prescription_id,
            patient_id,
            cashier_id,
            supplier_id,
            organisation_id,
            payment_mode: paymentMethod,
            financials: {
                discount_amount: 0,
                sub_total_amount: totals.subtotal,
                tax_amount: totals.tax,
                total_amount: totals.total,
            },
            dispense_items,
        };
    };

    const resetManualPaymentSession = () => {
        setManualConfirmOpen(false);
        setPendingInvoiceId(null);
        setPendingPaymentUrl(null);
        setTransactionReference('');
    };

    const openPaymentSuccess = (opts: { autoStatus: boolean }) => {
        setPaidAmount(totals.total);
        setPaidItemCount(totals.itemCount);
        setStatusUpdatedManually(!opts.autoStatus);
        setSuccessOpen(true);
    };

    const startManualPayment = async (payload: BillingCreatePayload) => {
        setPaying(true);
        messageApi.loading({
            content: 'Creating invoice…',
            key: 'checkout',
            duration: 0,
        });

        try {
            const billingResponse = await CreateBilling(payload);
            const { invoice_id, payment_url } = parseBillingCreateResponse(billingResponse);
            setPendingInvoiceId(invoice_id);
            setPendingPaymentUrl(payment_url ?? null);
            setManualConfirmOpen(true);
            messageApi.destroy('checkout');
        } catch (error) {
            console.error('Billing create failed:', error);
            messageApi.error({
                content: extractApiErrorMessage(error, 'Failed to create invoice. Please try again.'),
                key: 'checkout',
            });
        } finally {
            setPaying(false);
        }
    };

    const completePaymentLink = async (payload: BillingCreatePayload) => {
        setPaying(true);
        messageApi.loading({
            content: 'Waiting for payment link…',
            key: 'checkout',
            duration: 0,
        });

        try {
            const billingResponse = await CreateBilling(payload);
            const { payment_url } = parseBillingCreateResponse(billingResponse);
            if (payment_url) {
                window.open(payment_url, '_blank', 'noopener,noreferrer');
            }
            openPaymentSuccess({ autoStatus: true });
            messageApi.success({
                content: payment_url
                    ? 'Payment link opened — awaiting patient payment'
                    : 'Payment link created',
                key: 'checkout',
            });
        } catch (error) {
            console.error('Billing create failed:', error);
            messageApi.error({
                content: extractApiErrorMessage(error, 'Failed to create billing. Please try again.'),
                key: 'checkout',
            });
        } finally {
            setPaying(false);
        }
    };

    const confirmManualPayment = async () => {
        if (!pendingInvoiceId) return;
        if (timerExpired) {
            messageApi.warning('Checkout time expired — reload to try again');
            return;
        }

        setPaying(true);
        messageApi.loading({
            content: 'Confirming payment…',
            key: 'checkout',
            duration: 0,
        });

        try {
            const trimmedRef = transactionReference.trim();
            await ConfirmPayment({
                invoice_id: pendingInvoiceId,
                payment_mode: paymentMethod,
                ...(trimmedRef ? { transaction_reference: trimmedRef } : {}),
            });
            resetManualPaymentSession();
            openPaymentSuccess({ autoStatus: false });
            messageApi.success({
                content: 'Payment confirmed',
                key: 'checkout',
            });
        } catch (error) {
            console.error('Confirm payment failed:', error);
            messageApi.error({
                content: extractApiErrorMessage(
                    error,
                    'Failed to confirm payment. Please try again.',
                ),
                key: 'checkout',
            });
        } finally {
            setPaying(false);
        }
    };

    const handleConfirmPay = () => {
        if (isPaymentLinkCreated(rxStatus)) {
            messageApi.warning('Payment link already created — awaiting payment (Yet to pay)');
            return;
        }
        if (timerExpired || secondsLeft <= 0) {
            messageApi.warning('Checkout time expired — reload to try again');
            return;
        }
        if (totals.itemCount === 0 || totals.total <= 0) {
            messageApi.error('Select at least one item with quantity greater than zero');
            return;
        }
        if (allocationErrors.length > 0) {
            messageApi.error(allocationErrors[0]);
            return;
        }

        const payload = buildBillingPayload();
        if (!payload) {
            return;
        }

        if (isManualPayment(paymentMethod)) {
            void startManualPayment(payload);
            return;
        }

        void completePaymentLink(payload);
    };

    const handleManualPaymentConfirmed = () => {
        void confirmManualPayment();
    };

    const columns = [
        {
            title: '',
            key: 'selected',
            width: 48,
            render: (_: unknown, record: CheckoutLineItem) => (
                <Checkbox
                    checked={record.selected}
                    onChange={(e) => updateLineSelected(record.key, e.target.checked)}
                    aria-label={`Include ${record.medicine_name} ${record.frequency_label}`}
                />
            ),
        },
        {
            title: 'MEDICINE',
            key: 'medicine',
            width: 240,
            render: (_: unknown, record: CheckoutLineItem) => (
                <div className="medicine-info">
                    <Text className="medicine-name">{record.medicine_name}</Text>
                    <Text className="medicine-generic">
                        {[record.medicine_form, record.medicine_strength, record.frequency_label]
                            .filter(Boolean)
                            .join(' · ')}
                    </Text>
                    <Text type="secondary" className="checkout-batch-chip">
                        {batchSummary(record.batches)}
                    </Text>
                </div>
            ),
        },
        {
            title: 'PRESCRIBED',
            dataIndex: 'prescribed_qty',
            key: 'prescribed_qty',
            width: 100,
            align: 'center' as const,
            render: (qty: number) => <div className="qty-box">{qty}</div>,
        },
        {
            title: 'DISPENSE QTY',
            key: 'dispense_qty',
            width: 130,
            align: 'center' as const,
            render: (_: unknown, record: CheckoutLineItem) => (
                <InputNumber
                    min={0}
                    max={Math.max(record.prescribed_qty, stockAvailable(record.batches), 99)}
                    value={record.dispense_qty}
                    disabled={!record.selected}
                    onChange={(value) =>
                        setDispenseQty(record.key, typeof value === 'number' ? value : 0)
                    }
                    className="checkout-qty-input"
                    aria-label={`Dispense quantity for ${record.medicine_name}`}
                />
            ),
        },
        {
            title: 'UNIT PRICE',
            key: 'unit_price',
            width: 110,
            align: 'right' as const,
            render: (_: unknown, record: CheckoutLineItem) => (
                <Text type={record.selected ? undefined : 'secondary'}>
                    {formatInr(record.unit_price)}
                </Text>
            ),
        },
        {
            title: 'LINE TOTAL',
            key: 'line_total',
            width: 120,
            align: 'right' as const,
            render: (_: unknown, record: CheckoutLineItem) => {
                const lineTotal =
                    record.selected && record.dispense_qty > 0
                        ? record.dispense_qty * record.unit_price
                        : 0;
                return (
                    <Text
                        strong={record.selected && record.dispense_qty > 0}
                        type={lineTotal ? undefined : 'secondary'}
                    >
                        {formatInr(lineTotal)}
                    </Text>
                );
            },
        },
    ];

    const expandedRowRender = (record: CheckoutLineItem) => (
        <div className="checkout-batch-panel">
            <Text className="info-label">BATCH ALLOCATION (FEFO)</Text>
            <Table
                size="small"
                pagination={false}
                rowKey="batch_id"
                className="checkout-batch-table"
                dataSource={record.batches}
                columns={[
                    {
                        title: 'Batch',
                        dataIndex: 'batch_no',
                        key: 'batch_no',
                        render: (no: string, batch: CheckoutBatchAllocation) => (
                            <div>
                                <Text strong>{no}</Text>
                                <div>
                                    <Text type="secondary" className="checkout-batch-meta">
                                        {batch.shelf_location}
                                    </Text>
                                </div>
                            </div>
                        ),
                    },
                    {
                        title: 'Expiry',
                        dataIndex: 'expires_at',
                        key: 'expires_at',
                        width: 120,
                    },
                    {
                        title: 'On hand',
                        dataIndex: 'current_stock_units',
                        key: 'current_stock_units',
                        width: 90,
                        align: 'center' as const,
                    },
                    {
                        title: 'Unit ₹',
                        key: 'unit',
                        width: 90,
                        align: 'right' as const,
                        render: (_: unknown, batch: CheckoutBatchAllocation) =>
                            formatInr(batch.unit_selling_price),
                    },
                    {
                        title: 'Take qty',
                        key: 'allocate_qty',
                        width: 120,
                        align: 'center' as const,
                        render: (_: unknown, batch: CheckoutBatchAllocation) => (
                            <InputNumber
                                min={0}
                                max={batch.current_stock_units}
                                value={batch.allocate_qty}
                                disabled={!record.selected}
                                onChange={(value) =>
                                    updateBatchAllocate(
                                        record.key,
                                        batch.batch_id,
                                        typeof value === 'number' ? value : 0,
                                    )
                                }
                                className="checkout-qty-input"
                                aria-label={`Allocate from ${batch.batch_no}`}
                            />
                        ),
                    },
                ]}
            />
            <Text
                type={
                    allocationSum(record.batches) === record.dispense_qty ? 'secondary' : 'danger'
                }
                className="checkout-alloc-hint"
            >
                Allocated {allocationSum(record.batches)} / dispense {record.dispense_qty}
            </Text>
        </div>
    );

    return (
        <Layout>
            {contextHolder}
            <Sidebar />

            <Layout>
                <Breadcrumb className="appointment-breadcrumb-layout">
                    <Breadcrumb.Item>
                        <HomeOutlined />
                        <Link to="/prescription">Prescriptions</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <Link
                            to={
                                id
                                    ? prescriptionPath(id, { patientId: resolvedPatientId })
                                    : '/prescription'
                            }
                            state={{ patientId: resolvedPatientId }}
                        >
                            Prescription Detail
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Checkout</Breadcrumb.Item>
                </Breadcrumb>

                <Content className="pharmacy-main-layout checkout-layout">
                    {loading ? (
                        <PrescriptionPreviewSkeleton />
                    ) : (
                        <>
                            <div
                                className={`checkout-timer-banner ${
                                    timerExpired
                                        ? 'checkout-timer-banner--expired'
                                        : secondsLeft <= 30
                                          ? 'checkout-timer-banner--warn'
                                          : ''
                                }`}
                                role="status"
                                aria-live="polite"
                            >
                                <ClockCircleOutlined className="checkout-timer-banner__icon" />
                                <div className="checkout-timer-banner__text">
                                    <span className="checkout-timer-banner__label">
                                        Checkout timer
                                    </span>
                                    <span className="checkout-timer-banner__value">
                                        {timerExpired
                                            ? 'Expired — reload to retry'
                                            : formatCountdown(secondsLeft)}
                                    </span>
                                </div>
                                {isPaymentLinkCreated(rxStatus) ? (
                                    <StatusTag type={STATUS_WARNING}>Yet to pay</StatusTag>
                                ) : null}
                            </div>

                            <Card className="patient-card">
                                <Row justify="space-between" align="middle" gutter={[16, 16]}>
                                    <Col>
                                        <Space size={16}>
                                            <Avatar size={56} icon={<UserOutlined />} />
                                            <div>
                                                <Title level={5} className="patient-name">
                                                    {patient?.patient_name ?? '—'}
                                                </Title>
                                                <Text className="patient-subtext">
                                                    {patient ? formatPatientSubtext(patient) : '—'}
                                                </Text>
                                            </div>
                                        </Space>
                                    </Col>
                                    <Col>
                                        <div className="patient-meta">
                                            <div className="patient-meta__item">
                                                <Text className="info-label">RX CODE</Text>
                                                <StatusTag type={STATUS_INFO}>{rxCode || '—'}</StatusTag>
                                            </div>
                                            <div className="patient-meta__item">
                                                <Text className="info-label">RX STATUS</Text>
                                                {isPaymentLinkCreated(rxStatus) ? (
                                                    <StatusTag type={STATUS_WARNING}>Yet to pay</StatusTag>
                                                ) : (
                                                    <StatusTag type={getPrescriptionStatusTagColor(rxStatus)} bordered>
                                                        {formatPrescriptionStatusLabel(rxStatus)}
                                                    </StatusTag>
                                                )}
                                            </div>
                                            <div className="patient-meta__item">
                                                <Text className="info-label">CONTACT</Text>
                                                <Text>{patient?.patient_phone || '—'}</Text>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </Card>

                            <Card className="medicine-table-card">
                                <div className="table-header">
                                    <Space wrap>
                                        <Title level={5} className="table-title">
                                            Order items
                                        </Title>
                                        <StatusTag type={STATUS_INFO}>{totals.itemCount} billed</StatusTag>
                                        {usingMock ? (
                                            <StatusTag type={STATUS_WARNING}>Sample API data</StatusTag>
                                        ) : (
                                            <StatusTag type={STATUS_SUCCESS}>Live dispense lines</StatusTag>
                                        )}
                                        {isPaymentLinkCreated(rxStatus) ? (
                                            <StatusTag type={STATUS_WARNING}>Yet to pay</StatusTag>
                                        ) : null}
                                    </Space>
                                </div>

                                {timerExpired ? (
                                    <div className="checkout-alloc-alert">
                                        <WarningOutlined />
                                        <Text type="danger">
                                            Checkout session expired. Reload the page to start a new
                                            2-minute timer.
                                        </Text>
                                    </div>
                                ) : null}

                                {allocationErrors.length > 0 ? (
                                    <div className="checkout-alloc-alert">
                                        <WarningOutlined />
                                        <Text type="danger">{allocationErrors[0]}</Text>
                                    </div>
                                ) : null}

                                <Table
                                    columns={columns}
                                    dataSource={lines}
                                    pagination={false}
                                    scroll={{ x: 'max-content' }}
                                    className="medicine-table checkout-table"
                                    rowKey="key"
                                    rowClassName={(record) =>
                                        record.selected ? '' : 'checkout-row--muted'
                                    }
                                    expandable={{
                                        expandedRowRender,
                                        expandedRowKeys,
                                        onExpandedRowsChange: (keys) =>
                                            setExpandedRowKeys(keys as string[]),
                                        rowExpandable: (record) => record.batches.length > 0,
                                    }}
                                    locale={{ emptyText: 'No medicines on this prescription' }}
                                />

                                <div className="checkout-below-table">
                                    <div className="checkout-payment-block">
                                        <Text className="info-label">PAYMENT METHOD</Text>
                                        <Segmented
                                            className="checkout-payment-segmented"
                                            value={paymentMethod}
                                            onChange={(value) =>
                                                setPaymentMethod(value as PaymentMethod)
                                            }
                                            options={[
                                                { label: 'Cash', value: 'cash' },
                                                { label: 'QR', value: 'qr' },
                                                { label: 'Link', value: 'payment_link' },
                                            ]}
                                        />
                                        <Text type="secondary" className="checkout-payment-hint">
                                            {isManualPayment(paymentMethod)
                                                ? 'Cash / QR: swipe to mark paid in a popup before finishing.'
                                                : 'Link: finishes automatically when the patient pays.'}
                                        </Text>
                                        <Text className="info-label checkout-notes-label">
                                            NOTES
                                        </Text>
                                        <Input.TextArea
                                            className="notes-textarea"
                                            rows={2}
                                            maxLength={200}
                                            placeholder="Optional note (e.g. paid at counter)"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                        />
                                    </div>

                                    <div className="billing-summary checkout-billing">
                                        <div className="summary-row">
                                            <span>Subtotal</span>
                                            <span>{formatInr(totals.subtotal)}</span>
                                        </div>
                                        <div className="summary-row">
                                            <span>Tax (5%)</span>
                                            <span>{formatInr(totals.tax)}</span>
                                        </div>
                                        <div className="summary-row total">
                                            <Text strong>Total due</Text>
                                            <Text strong>{formatInr(totals.total)}</Text>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <div className="sticky-footer">
                                <Space wrap align="center">
                                    <Button
                                        icon={<ArrowLeftOutlined />}
                                        onClick={() => {
                                            if (!id) {
                                                navigate('/prescription');
                                                return;
                                            }
                                            navigate(
                                                prescriptionPath(id, {
                                                    patientId: resolvedPatientId,
                                                }),
                                                { state: { patientId: resolvedPatientId } },
                                            );
                                        }}
                                    >
                                        Back
                                    </Button>
                                    <Text
                                        strong
                                        className={`checkout-timer-footer-text ${
                                            timerExpired
                                                ? 'checkout-timer-footer-text--expired'
                                                : secondsLeft <= 30
                                                  ? 'checkout-timer-footer-text--warn'
                                                  : ''
                                        }`}
                                    >
                                        <ClockCircleOutlined />{' '}
                                        {timerExpired
                                            ? 'Time expired'
                                            : formatCountdown(secondsLeft)}
                                    </Text>
                                </Space>
                                <Space wrap>
                                    <Button danger onClick={handleDiscard}>
                                        Discard
                                    </Button>
                                    <Button
                                        type="primary"
                                        icon={<CheckCircleOutlined />}
                                        className="confirm-btn"
                                        loading={paying}
                                        disabled={confirmDisabled}
                                        onClick={handleConfirmPay}
                                    >
                                        {isPaymentLinkCreated(rxStatus)
                                            ? 'Yet to pay'
                                            : timerExpired
                                              ? 'Time expired'
                                              : 'Confirm & Pay'}
                                    </Button>
                                </Space>
                            </div>
                        </>
                    )}
                </Content>
            </Layout>

            <Modal
                open={manualConfirmOpen}
                title={
                    paymentMethod === 'cash'
                        ? 'Confirm cash payment'
                        : 'Confirm QR payment'
                }
                onCancel={() => {
                    if (paying) return;
                    resetManualPaymentSession();
                }}
                maskClosable={!paying}
                footer={[
                    <Button
                        key="cancel"
                        disabled={paying}
                        onClick={resetManualPaymentSession}
                    >
                        Cancel
                    </Button>,
                ]}
            >
                <Space direction="vertical" size={16} className="checkout-manual-modal">
                    <div className="checkout-manual-amount">
                        <Text type="secondary" className="checkout-manual-amount-label">
                            Amount due
                        </Text>
                        <Text strong className="checkout-manual-amount-value">
                            {formatInr(totals.total)}
                        </Text>
                    </div>

                    {paymentMethod === 'qr' ? (
                        <>
                            <div className="checkout-qr-placeholder" aria-hidden>
                                <div className="checkout-qr-mock-square" />
                                {pendingPaymentUrl ? (
                                    <Text
                                        copyable={{ text: pendingPaymentUrl }}
                                        className="checkout-qr-link"
                                    >
                                        {pendingPaymentUrl}
                                    </Text>
                                ) : (
                                    <Text type="secondary">QR code placeholder</Text>
                                )}
                                <Text type="secondary" className="checkout-qr-amount">
                                    {formatInr(totals.total)}
                                </Text>
                            </div>
                            <Text type="secondary" className="checkout-manual-hint">
                                Show the patient this payment link / QR, wait for UPI success, then
                                swipe to mark paid.
                            </Text>
                        </>
                    ) : (
                        <div className="checkout-cash-callout">
                            <Text>
                                Count the cash from the patient, then swipe below to mark paid.
                            </Text>
                        </div>
                    )}

                    <div className="checkout-txn-ref">
                        <Text className="info-label">TRANSACTION REFERENCE (OPTIONAL)</Text>
                        <Input
                            placeholder={
                                paymentMethod === 'qr'
                                    ? 'UPI / bank reference (optional)'
                                    : 'Receipt / reference (optional)'
                            }
                            value={transactionReference}
                            onChange={(e) => setTransactionReference(e.target.value)}
                            disabled={paying}
                            maxLength={100}
                        />
                    </div>

                    <SwipeToConfirm
                        active={manualConfirmOpen}
                        disabled={timerExpired}
                        loading={paying}
                        onConfirm={handleManualPaymentConfirmed}
                    />
                </Space>
            </Modal>

            <Modal
                open={successOpen}
                title="Order dispensed"
                onCancel={() => setSuccessOpen(false)}
                footer={[
                    <Button
                        key="print"
                        icon={<PrinterOutlined />}
                        onClick={() => {
                            messageApi.info('Sending to printer…');
                            window.print();
                        }}
                    >
                        Print Bill
                    </Button>,
                    <Button key="list" type="primary" onClick={() => navigate('/prescription')}>
                        Back to prescriptions
                    </Button>,
                ]}
            >
                <Space direction="vertical" size={8}>
                    <Text>
                        Prescription <Text code>{rxCode || id}</Text> billed and marked for
                        dispense.
                    </Text>
                    <Text>
                        Amount paid: <Text strong>{formatInr(paidAmount)}</Text>
                    </Text>
                    <Text>
                        Payment:{' '}
                        <Text strong>
                            {paymentMethod === 'payment_link'
                                ? 'PAYMENT LINK'
                                : paymentMethod.toUpperCase()}
                        </Text>{' '}
                        · {paidItemCount} item{paidItemCount === 1 ? '' : 's'}
                    </Text>
                    <Text type="secondary">
                        {statusUpdatedManually
                            ? 'Confirmed at counter (Cash / QR)'
                            : 'Completed via payment link'}
                    </Text>
                    {notes.trim() ? <Text type="secondary">Note: {notes.trim()}</Text> : null}
                </Space>
            </Modal>
        </Layout>
    );
}

export default PrescriptionCheckout;
