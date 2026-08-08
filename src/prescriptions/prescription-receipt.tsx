import {
    Breadcrumb,
    Button,
    Layout,
    message,
    Skeleton,
    Space,
    Typography,
} from 'antd';

import {
    ArrowLeftOutlined,
    DownloadOutlined,
    HomeOutlined,
    MedicineBoxOutlined,
    PrinterOutlined,
} from '@ant-design/icons';

import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

import Sidebar from '../sidebar';
import { GetDispenseCheckoutLines, GetInvoiceByPrescriptionID, parseInvoiceByPrescriptionResponse } from './api/prescription';
import type { InvoiceByPrescription } from './types/prescriptionmodel';
import {
    isItemFullyDispensed,
    mapMedicineInfoLines,
    type PrescriptionRow,
} from './prescription-preview';
import {
    fetchPatientById,
    formatPrescriptionStatusLabel,
    getPrescriptionStatusTagColor,
    prescriptionPath,
    recallPrescriptionPatientId,
    rememberPrescriptionPatientId,
    resolvePrescriptionPatientId,
    toTitleCase,
    type PrescriptionLocationState,
} from './prescription-patient';
import { StatusTag } from '../components/status-tag';
import { STATUS_INFO, STATUS_SUCCESS, STATUS_WARNING } from '../constants/status-colors';
import type { patientlist } from '../patientmangement/types/patients';

import './prescription-receipt.css';

const { Content } = Layout;
const { Text } = Typography;

/** Matches the flat 5% tax already applied at checkout (see prescription-checkout.tsx TAX_RATE). */
const RECEIPT_TAX_RATE = 0.05;

function formatInr(amount: number): string {
    return `₹${amount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function formatReceiptDate(value: string | undefined, withTime = true): string {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    });
}

function formatAgeGender(patient: patientlist | null): string {
    if (!patient) return '—';
    return (
        [
            patient.patient_age != null ? `${patient.patient_age}y` : null,
            patient.patient_gender || null,
        ]
            .filter(Boolean)
            .join(', ') || '—'
    );
}

function scheduleLabel(row: PrescriptionRow): string {
    const parts = [
        row.morning > 0 ? `MOR${row.morning > 1 ? ` ×${row.morning}` : ''}` : null,
        row.afternoon > 0 ? `AFT${row.afternoon > 1 ? ` ×${row.afternoon}` : ''}` : null,
        row.night > 0 ? `NIT${row.night > 1 ? ` ×${row.night}` : ''}` : null,
    ].filter(Boolean);
    return parts.length ? parts.join(' · ') : '—';
}

function PrescriptionReceipt() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const locationState = (location.state as PrescriptionLocationState | null) ?? null;
    const [messageApi, contextHolder] = message.useMessage();

    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState<PrescriptionRow[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [patient, setPatient] = useState<patientlist | null>(null);
    const [resolvedPatientId, setResolvedPatientId] = useState<string | undefined>();
    const [prescriptionStatus, setPrescriptionStatus] = useState('');
    const [prescriptionCreatedAt, setPrescriptionCreatedAt] = useState('');
    const [prescriptionCode, setPrescriptionCode] = useState('');
    const [invoice, setInvoice] = useState<InvoiceByPrescription | null>(null);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }

        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setPatient(null);
            try {
                const medicineInfo = await GetDispenseCheckoutLines(id);
                if (cancelled) return;

                const lines = Array.isArray(medicineInfo.data) ? medicineInfo.data : [];
                setRows(mapMedicineInfoLines(lines));
                setTotalCount(medicineInfo.total ?? lines.length);

                const first = lines[0];
                setPrescriptionStatus(first?.prescription_status || locationState?.status || '');
                setPrescriptionCode(first?.prescription_code ?? '');
                if (first?.prescription_created_at) {
                    setPrescriptionCreatedAt(first.prescription_created_at);
                }

                const patientId = resolvePrescriptionPatientId({
                    locationPatientId: locationState?.patientId,
                    queryPatientId: searchParams.get('patientId'),
                    cachedPatientId: recallPrescriptionPatientId(id),
                    apiPatientId:
                        medicineInfo.patient_id || lines.find((item) => item.patient_id)?.patient_id,
                });
                setResolvedPatientId(patientId);
                rememberPrescriptionPatientId(id, patientId);

                if (patientId) {
                    const patientData = await fetchPatientById(patientId);
                    if (!cancelled) setPatient(patientData);
                }
            } catch (error) {
                if (cancelled) return;
                console.error('Failed to load prescription:', error);
                messageApi.error('Failed to load prescription details');
            } finally {
                if (!cancelled) setLoading(false);
            }

            try {
                const invoiceResponse = await GetInvoiceByPrescriptionID(id);
                if (!cancelled) setInvoice(parseInvoiceByPrescriptionResponse(invoiceResponse));
            } catch (error) {
                if (!cancelled) console.error('Failed to load invoice:', error);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handlePrint = () => window.print();

    const handleDownload = () => {
        messageApi.info('Choose "Save as PDF" in the print dialog to download this receipt.');
        window.print();
    };

    const handleBack = () => {
        if (id) {
            navigate(prescriptionPath(id, { patientId: resolvedPatientId }));
            return;
        }
        navigate(-1);
    };

    const computedSubtotal = rows.reduce((sum, row) => sum + row.qty * row.unit_price, 0);
    const computedTax = computedSubtotal * RECEIPT_TAX_RATE;
    const subtotal = invoice?.sub_total_amount ?? computedSubtotal;
    const discount = invoice?.discount_amount ?? 0;
    const tax = invoice?.tax_amount ?? computedTax;
    const grandTotal = invoice?.total_amount ?? subtotal - discount + tax;

    return (
        <Layout>
            {contextHolder}
            <Sidebar />

            <Layout>
                <Breadcrumb className='appointment-breadcrumb-layout receipt-hide-on-print'>
                    <Breadcrumb.Item>
                        <HomeOutlined />
                        <Link to='/prescription'>Prescriptions</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <Link to={id ? prescriptionPath(id, { patientId: resolvedPatientId }) : '/prescription'}>
                            Prescription Detail
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Receipt Preview</Breadcrumb.Item>
                </Breadcrumb>

                <Content className='receipt-page-layout'>
                    <div className='receipt-actions receipt-hide-on-print'>
                        <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
                            Back to Prescription
                        </Button>
                        <Space wrap>
                            <Button icon={<PrinterOutlined />} onClick={handlePrint}>
                                Print
                            </Button>
                            <Button type='primary' icon={<DownloadOutlined />} onClick={handleDownload}>
                                Download PDF
                            </Button>
                        </Space>
                    </div>

                    {loading ? (
                        <div className='receipt-sheet'>
                            <Skeleton active paragraph={{ rows: 12 }} />
                        </div>
                    ) : (
                        <div className='receipt-sheet'>
                            {/* Header */}
                            <div className='receipt-head'>
                                <div className='receipt-brand'>
                                    <div className='receipt-brand-icon'>
                                        <MedicineBoxOutlined />
                                    </div>
                                    <div>
                                        <Text className='receipt-brand-name'>Hospital Management System</Text>
                                        <Text className='receipt-brand-sub'>Pharmacy · Prescription billing</Text>
                                    </div>
                                </div>

                                <div className='receipt-meta'>
                                    <Text className='receipt-meta-title'>RECEIPT</Text>
                                    {prescriptionCode ? (
                                        <Text strong className='receipt-meta-code'>
                                            {prescriptionCode}
                                        </Text>
                                    ) : null}
                                    <Text className='receipt-meta-date'>
                                        Date: {formatReceiptDate(prescriptionCreatedAt, false)}
                                    </Text>
                                    <div className='receipt-meta-status'>
                                        <StatusTag type={getPrescriptionStatusTagColor(prescriptionStatus)} bordered>
                                            {formatPrescriptionStatusLabel(prescriptionStatus)}
                                        </StatusTag>
                                    </div>
                                </div>
                            </div>

                            {/* Patient / Prescription details */}
                            <div className='receipt-info-row'>
                                <div className='receipt-info-card'>
                                    <Text className='info-label'>PATIENT DETAILS</Text>
                                    <div className='receipt-kv-grid'>
                                        <div>
                                            <Text className='info-label'>Name</Text>
                                            <Text strong>{patient?.patient_name ?? '—'}</Text>
                                        </div>
                                        <div>
                                            <Text className='info-label'>UHID</Text>
                                            <Text>{patient?.patient_code || '—'}</Text>
                                        </div>
                                        <div>
                                            <Text className='info-label'>Age / Gender</Text>
                                            <Text>{formatAgeGender(patient)}</Text>
                                        </div>
                                        <div>
                                            <Text className='info-label'>Contact</Text>
                                            <Text>{patient?.patient_phone || '—'}</Text>
                                        </div>
                                        {patient?.patient_email ? (
                                            <div className='receipt-kv-span2'>
                                                <Text className='info-label'>Email</Text>
                                                <Text>{patient.patient_email}</Text>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>

                                <div className='receipt-info-card'>
                                    <Text className='info-label'>PRESCRIPTION DETAILS</Text>
                                    <div className='receipt-kv-grid'>
                                        <div>
                                            <Text className='info-label'>Rx Code</Text>
                                            <Text strong>{prescriptionCode || '—'}</Text>
                                        </div>
                                        <div>
                                            <Text className='info-label'>Status</Text>
                                            <Text>{formatPrescriptionStatusLabel(prescriptionStatus)}</Text>
                                        </div>
                                        <div>
                                            <Text className='info-label'>Items</Text>
                                            <Text>{totalCount}</Text>
                                        </div>
                                        <div>
                                            <Text className='info-label'>Created</Text>
                                            <Text>{formatReceiptDate(prescriptionCreatedAt)}</Text>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Line items */}
                            <div className='receipt-table-card'>
                                <table className='receipt-items-table'>
                                    <thead>
                                        <tr>
                                            <th className='align-left'>Description</th>
                                            <th className='align-left'>Category</th>
                                            <th className='align-center'>Qty</th>
                                            <th className='align-right'>Unit Price</th>
                                            <th className='align-right'>Tax</th>
                                            <th className='align-right'>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className='receipt-empty-row'>
                                                    No medicines on this prescription
                                                </td>
                                            </tr>
                                        ) : (
                                            rows.map((row) => {
                                                const lineAmount = row.qty * row.unit_price * (1 + RECEIPT_TAX_RATE);
                                                return (
                                                    <tr key={row.key}>
                                                        <td className='align-left'>
                                                            <div className='receipt-item-desc'>
                                                                <Text strong>{row.medicine}</Text>
                                                                {row.composition ? (
                                                                    <Text className='receipt-item-sub'>{row.composition}</Text>
                                                                ) : null}
                                                                <Space size={4} wrap className='receipt-item-tags'>
                                                                    <StatusTag type={STATUS_INFO} className='schedule-tag'>
                                                                        {scheduleLabel(row)}
                                                                    </StatusTag>
                                                                    <StatusTag
                                                                        type={isItemFullyDispensed(row) ? STATUS_SUCCESS : STATUS_WARNING}
                                                                        className='schedule-tag'
                                                                    >
                                                                        {toTitleCase(row.item_status.replace(/_/g, ' '))}
                                                                    </StatusTag>
                                                                </Space>
                                                            </div>
                                                        </td>
                                                        <td className='align-left'>
                                                            <Text type='secondary'>Medicine</Text>
                                                        </td>
                                                        <td className='align-center'>{row.qty}</td>
                                                        <td className='align-right'>{formatInr(row.unit_price)}</td>
                                                        <td className='align-right'>{Math.round(RECEIPT_TAX_RATE * 100)}%</td>
                                                        <td className='align-right'>
                                                            <Text strong>{formatInr(lineAmount)}</Text>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Payment + totals */}
                            <div className='receipt-summary'>
                                <div className='receipt-summary-left'>
                                    <Text className='info-label'>PAYMENT DETAILS</Text>
                                    <div className='receipt-kv-grid'>
                                        <div>
                                            <Text className='info-label'>Status</Text>
                                            <StatusTag
                                                type={
                                                    invoice
                                                        ? getPrescriptionStatusTagColor(invoice.status)
                                                        : getPrescriptionStatusTagColor(prescriptionStatus)
                                                }
                                            >
                                                {invoice
                                                    ? toTitleCase(invoice.status)
                                                    : formatPrescriptionStatusLabel(prescriptionStatus)}
                                            </StatusTag>
                                        </div>
                                        {invoice?.invoice_code ? (
                                            <div>
                                                <Text className='info-label'>Invoice ID</Text>
                                                <Text>{invoice.invoice_code}</Text>
                                            </div>
                                        ) : null}
                                        {invoice?.cashier_id ? (
                                            <div>
                                                <Text className='info-label'>Collected By</Text>
                                                <Text>{invoice.cashier_id}</Text>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>

                                <div className='receipt-summary-totals'>
                                    <div className='summary-row'>
                                        <span>Subtotal</span>
                                        <span>{formatInr(subtotal)}</span>
                                    </div>
                                    {discount > 0 ? (
                                        <div className='summary-row'>
                                            <span>Discount</span>
                                            <span>-{formatInr(discount)}</span>
                                        </div>
                                    ) : null}
                                    <div className='summary-row'>
                                        <span>Tax</span>
                                        <span>{formatInr(tax)}</span>
                                    </div>
                                    <div className='summary-row total'>
                                        <Text strong>Grand Total</Text>
                                        <Text strong className='receipt-grand-total'>
                                            {formatInr(grandTotal)}
                                        </Text>
                                    </div>
                                    {!invoice ? (
                                        <Text type='secondary' className='receipt-summary-note'>
                                            Estimated — invoice not generated yet.
                                        </Text>
                                    ) : null}
                                </div>
                            </div>

                            {/* Notes */}
                            <div className='receipt-notes'>
                                <Text strong>Notes: </Text>
                                <Text type='secondary'>
                                    Thank you for choosing us. Please keep this receipt for your records and
                                    insurance claims.
                                </Text>
                            </div>

                            {/* Signatures */}
                            <div className='receipt-signatures'>
                                <div className='receipt-signature-block'>
                                    <div className='receipt-signature-line' />
                                    <Text type='secondary'>Prepared By</Text>
                                </div>
                                <div className='receipt-signature-block'>
                                    <div className='receipt-signature-line' />
                                    <Text type='secondary'>Received By (Patient)</Text>
                                </div>
                                <div className='receipt-signature-block'>
                                    <div className='receipt-signature-line' />
                                    <Text type='secondary'>Authorized Signatory</Text>
                                </div>
                            </div>
                            <Text type='secondary' className='receipt-signature-hint'>
                                Manual signature and stamp are used today; digital signatures and e-seals are
                                planned for a future release.
                            </Text>

                            <div className='receipt-footer-note'>
                                <Text type='secondary'>Generated by Hospital Management System</Text>
                            </div>
                        </div>
                    )}
                </Content>
            </Layout>
        </Layout>
    );
}

export default PrescriptionReceipt;
