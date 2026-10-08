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

import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

import Sidebar from '../sidebar';
import { GetBillDetailsByPrescriptionID } from './api/prescription';
import type { BillDetails, BillDetailsLine } from './types/prescriptionmodel';
import { isPaidInvoiceStatus, prescriptionPath, toTitleCase } from './prescription-patient';
import { StatusTag } from '../components/status-tag';
import {
    STATUS_DANGER,
    STATUS_SUCCESS,
    STATUS_WARNING,
    type StatusType,
} from '../constants/status-colors';

import './prescription-receipt.css';

const { Content } = Layout;
const { Text } = Typography;

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

function formatAgeGender(patient: BillDetails['patientDetail'] | undefined): string {
    if (!patient) return '—';
    return (
        [patient.age != null ? `${patient.age}y` : null, patient.gender || null]
            .filter(Boolean)
            .join(', ') || '—'
    );
}

function selectVisitType(value: string | undefined): string {
    switch (value) {
        case 'follow_up':
            return 'Follow Up';
        case 'new_patient':
            return 'New Patient';
        case 'opd':
            return 'OPD';
        default:
            return value ? toTitleCase(value) : '—';
    }
}

function getInvoiceStatusType(status: string | undefined | null): StatusType {
    if (isPaidInvoiceStatus(status)) return STATUS_SUCCESS;
    if (!status) return STATUS_WARNING;
    return status.trim().toLowerCase().includes('cancel') ? STATUS_DANGER : STATUS_WARNING;
}

interface ReceiptLineRow {
    key: string;
    label: string;
    sub: string;
    category: string;
    line: BillDetailsLine;
}

function buildLineRows(payment: BillDetails['paymentDetails'] | undefined): ReceiptLineRow[] {
    if (!payment) return [];
    const rows: ReceiptLineRow[] = [];
    if (payment.consultation) {
        rows.push({
            key: 'consultation',
            label: 'Consultation Fee',
            sub: payment.consultation.code || '',
            category: selectVisitType(payment.consultation.category),
            line: payment.consultation,
        });
    }
    if (payment.prescription) {
        rows.push({
            key: 'prescription',
            label: 'Prescription / Pharmacy Bill',
            sub: payment.prescription.code || '',
            category: toTitleCase(payment.prescription.category),
            line: payment.prescription,
        });
    }
    return rows;
}

function PrescriptionReceipt() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();

    const [loading, setLoading] = useState(true);
    const [bill, setBill] = useState<BillDetails | null>(null);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }

        let cancelled = false;

        const load = async () => {
            setLoading(true);
            try {
                const response = await GetBillDetailsByPrescriptionID(id);
                if (!cancelled) setBill(response?.data ?? null);
            } catch (error) {
                if (!cancelled) {
                    console.error('Failed to load bill details:', error);
                    messageApi.error('Failed to load receipt details');
                }
            } finally {
                if (!cancelled) setLoading(false);
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
            navigate(prescriptionPath(id, { patientId: bill?.patientDetail.id }));
            return;
        }
        navigate(-1);
    };

    const lineRows = buildLineRows(bill?.paymentDetails);
    const totalTax = lineRows.reduce((sum, row) => sum + (row.line.tax || 0), 0);
    const totalDiscount = lineRows.reduce((sum, row) => sum + (row.line.discount || 0), 0);
    const grandTotal = lineRows.reduce((sum, row) => sum + (row.line.total_amount || 0), 0);

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
                        <Link
                            to={
                                id
                                    ? prescriptionPath(id, { patientId: bill?.patientDetail.id })
                                    : '/prescription'
                            }
                        >
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
                                        <Text className='receipt-brand-sub'>Consultation &amp; Pharmacy billing</Text>
                                    </div>
                                </div>

                                <div className='receipt-meta'>
                                    <Text className='receipt-meta-title'>RECEIPT</Text>
                                    {bill?.invoice_code ? (
                                        <Text strong className='receipt-meta-code'>
                                            {bill.invoice_code}
                                        </Text>
                                    ) : null}
                                    <Text className='receipt-meta-date'>
                                        Date: {formatReceiptDate(bill?.created_at, false)}
                                    </Text>
                                    <div className='receipt-meta-status'>
                                        <StatusTag type={getInvoiceStatusType(bill?.invoice_status)} bordered>
                                            {bill ? toTitleCase(bill.invoice_status) : '—'}
                                        </StatusTag>
                                    </div>
                                </div>
                            </div>

                            {/* Patient / Appointment details */}
                            <div className='receipt-info-row'>
                                <div className='receipt-info-card'>
                                    <Text className='info-label'>PATIENT DETAILS</Text>
                                    <div className='receipt-kv-grid'>
                                        <div>
                                            <Text className='info-label'>Name</Text>
                                            <Text strong>{bill?.patientDetail.name ?? '—'}</Text>
                                        </div>
                                        <div>
                                            <Text className='info-label'>UHID</Text>
                                            <Text>{bill?.patientDetail.uhid || '—'}</Text>
                                        </div>
                                        <div>
                                            <Text className='info-label'>Age / Gender</Text>
                                            <Text>{formatAgeGender(bill?.patientDetail)}</Text>
                                        </div>
                                        <div>
                                            <Text className='info-label'>Contact</Text>
                                            <Text>{bill?.patientDetail.phone || '—'}</Text>
                                        </div>
                                        {bill?.patientDetail.email ? (
                                            <div className='receipt-kv-span2'>
                                                <Text className='info-label'>Email</Text>
                                                <Text>{bill.patientDetail.email}</Text>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>

                                <div className='receipt-info-card'>
                                    <Text className='info-label'>APPOINTMENT DETAILS</Text>
                                    <div className='receipt-kv-grid'>
                                        <div>
                                            <Text className='info-label'>Appointment Code</Text>
                                            <Text strong>{bill?.appointmentDetail.appointment_code || '—'}</Text>
                                        </div>
                                        <div>
                                            <Text className='info-label'>Visit Type</Text>
                                            <Text>{selectVisitType(bill?.appointmentDetail.visit_type)}</Text>
                                        </div>
                                        <div>
                                            <Text className='info-label'>Status</Text>
                                            <Text>{toTitleCase(bill?.appointmentDetail.status)}</Text>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Line items — consultation + prescription for this encounter */}
                            <div className='receipt-table-card'>
                                <table className='receipt-items-table'>
                                    <thead>
                                        <tr>
                                            <th className='align-left'>Description</th>
                                            <th className='align-left'>Category</th>
                                            <th className='align-center'>Qty</th>
                                            <th className='align-right'>Tax</th>
                                            <th className='align-right'>Discount</th>
                                            <th className='align-right'>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lineRows.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className='receipt-empty-row'>
                                                    No billed items for this prescription
                                                </td>
                                            </tr>
                                        ) : (
                                            lineRows.map((row) => (
                                                <tr key={row.key}>
                                                    <td className='align-left'>
                                                        <div className='receipt-item-desc'>
                                                            <Text strong>{row.label}</Text>
                                                            {row.sub ? (
                                                                <Text className='receipt-item-sub'>{row.sub}</Text>
                                                            ) : null}
                                                            <Space size={4} wrap className='receipt-item-tags'>
                                                                <StatusTag
                                                                    type={getInvoiceStatusType(row.line.invoice_status)}
                                                                    className='schedule-tag'
                                                                >
                                                                    {toTitleCase(row.line.invoice_status)} ·{' '}
                                                                    {row.line.payment_mode?.toUpperCase() || '—'}
                                                                </StatusTag>
                                                            </Space>
                                                        </div>
                                                    </td>
                                                    <td className='align-left'>
                                                        <Text type='secondary'>{row.category}</Text>
                                                    </td>
                                                    <td className='align-center'>{row.line.qty}</td>
                                                    <td className='align-right'>{formatInr(row.line.tax || 0)}</td>
                                                    <td className='align-right'>{formatInr(row.line.discount || 0)}</td>
                                                    <td className='align-right'>
                                                        <Text strong>{formatInr(row.line.total_amount || 0)}</Text>
                                                    </td>
                                                </tr>
                                            ))
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
                                            <StatusTag type={getInvoiceStatusType(bill?.invoice_status)}>
                                                {bill ? toTitleCase(bill.invoice_status) : '—'}
                                            </StatusTag>
                                        </div>
                                        {bill?.invoice_code ? (
                                            <div>
                                                <Text className='info-label'>Invoice ID</Text>
                                                <Text>{bill.invoice_code}</Text>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>

                                <div className='receipt-summary-totals'>
                                    {totalDiscount > 0 ? (
                                        <div className='summary-row'>
                                            <span>Discount</span>
                                            <span>-{formatInr(totalDiscount)}</span>
                                        </div>
                                    ) : null}
                                    <div className='summary-row'>
                                        <span>Tax</span>
                                        <span>{formatInr(totalTax)}</span>
                                    </div>
                                    <div className='summary-row total'>
                                        <Text strong>Grand Total</Text>
                                        <Text strong className='receipt-grand-total'>
                                            {formatInr(grandTotal)}
                                        </Text>
                                    </div>
                                    {!bill ? (
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
