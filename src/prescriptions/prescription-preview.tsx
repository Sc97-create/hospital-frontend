import {
    Avatar,
    Breadcrumb,
    Button,
    Card,
    Col,
    Layout,
    message,
    Modal,
    Row,
    Space,
    Table,
    Typography,
} from 'antd';

import {
    HomeOutlined,
    UserOutlined,
    EyeOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
} from '@ant-design/icons';

import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

import Sidebar from '../sidebar';
import { GetDispenseCheckoutLines, UpdateStatus } from './api/prescription';
import type { DispenseLineResponse } from './types/prescriptionmodel';
import {
    fetchPatientById,
    formatPatientSubtext,
    formatPrescriptionStatusLabel,
    getPrescriptionStatusTagColor,
    isCancelledPrescriptionStatus,
    isDraftPrescriptionStatus,
    isFullyDispensedPrescriptionStatus,
    isPartiallyDispensedPrescriptionStatus,
    isPaymentPendingPrescriptionStatus,
    PARTIAL_DISPENSE_BLOCK_MESSAGE,
    prescriptionPath,
    prescriptionReceiptPath,
    recallPrescriptionPatientId,
    rememberPrescriptionPatientId,
    resolvePrescriptionPatientId,
    toTitleCase,
    type PrescriptionLocationState,
} from './prescription-patient';
import { StatusTag } from '../components/status-tag';
import {
    getPatientStatusType,
    STATUS_DANGER,
    STATUS_INFO,
    STATUS_SUCCESS,
    STATUS_WARNING,
} from '../constants/status-colors';
import type { patientlist } from '../patientmangement/types/patients';
import PrescriptionPreviewSkeleton from './prescription-preview-skeleton';

import './prescription-preview.css';

const { Content } = Layout;
const { Title, Text } = Typography;

export interface PrescriptionRow {
    key: string;
    prescription_item_id: string;
    medicine: string;
    composition: string;
    form: string;
    dosage: string;
    morning: number;
    afternoon: number;
    night: number;
    qty: number;
    remaining_quantity: number | null;
    item_status: string;
    out_of_stock: boolean;
    /** Best-effort per-unit price from the earliest-expiry batch (FEFO), for receipts. */
    unit_price: number;
}

function formatFoodInstruction(value: string | undefined): string {
    switch (value?.toLowerCase()) {
        case 'before':
            return 'Before food';
        case 'after':
            return 'After food';
        case 'any':
            return 'Any time';
        default:
            return value?.trim() || '';
    }
}

function lineRemainingQuantity(line: DispenseLineResponse): number | null {
    if (typeof line.remaining_quantity === 'number') return line.remaining_quantity;
    if (typeof line.remaining_qty === 'number') return line.remaining_qty;
    return null;
}

/** Prefer unit_selling_price when set; otherwise unit_price, then selling_price/box (mirrors checkout). */
function resolveBatchUnitPrice(batch: DispenseLineResponse['medicine_batches'][number]): number {
    const { pricing } = batch;
    if (pricing.unit_selling_price > 0) return pricing.unit_selling_price;
    if (pricing.unit_price > 0) return pricing.unit_price;
    if (pricing.selling_price > 0 && batch.units_per_box > 0) {
        return pricing.selling_price / batch.units_per_box;
    }
    return 0;
}

/** Earliest-expiry (FEFO) batch's price — same default checkout would allocate first. */
function resolveLineUnitPrice(line: DispenseLineResponse): number {
    const batches = line.medicine_batches ?? [];
    if (!batches.length) return 0;
    const earliest = [...batches].sort(
        (a, b) => new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime(),
    )[0];
    return resolveBatchUnitPrice(earliest);
}

export function isItemFullyDispensed(row: PrescriptionRow): boolean {
    const status = row.item_status.trim().toLowerCase().replace(/[\s-]+/g, '_');
    if (status === 'fully_dispensed' || status === 'full_dispensed' || status === 'dispensed') {
        return true;
    }
    return row.remaining_quantity === 0;
}

export function mapMedicineInfoLines(lines: DispenseLineResponse[]): PrescriptionRow[] {
    return lines.map((item) => {
        const strength = item.medicine_strength?.trim() || '';
        const food = formatFoodInstruction(item.food_instruction);

        return {
            key: item.prescription_item_id || item.medicine_id,
            prescription_item_id: item.prescription_item_id,
            medicine: item.medicine_name,
            composition: [strength, food].filter(Boolean).join(' · '),
            form: food,
            dosage: item.medicine_form || '—',
            morning: item.frequency?.morning ?? 0,
            afternoon: item.frequency?.afternoon ?? 0,
            night: item.frequency?.night ?? 0,
            qty: item.prescribed_quantity ?? 0,
            remaining_quantity: lineRemainingQuantity(item),
            item_status: item.prescription_item_status ?? '',
            out_of_stock: Boolean(item.out_of_stock),
            unit_price: resolveLineUnitPrice(item),
        };
    });
}

const columns = [
    {
        title: 'MEDICINE & COMPOSITION',
        dataIndex: 'medicine',
        key: 'medicine',
        width: 240,
        align: 'left' as const,
        render: (_: unknown, record: PrescriptionRow) => (
            <div className='medicine-info'>
                <Space size={6} wrap align="center">
                    <Text className='medicine-name'>{record.medicine}</Text>
                    {record.out_of_stock ? (
                        <StatusTag type={STATUS_DANGER} className="schedule-tag out-of-stock-tag">
                            Out of stock
                        </StatusTag>
                    ) : null}
                </Space>
                {record.composition ? (
                    <Text className='medicine-generic'>{record.composition}</Text>
                ) : null}
            </div>
        ),
    },
    {
        title: 'DOSAGE',
        dataIndex: 'dosage',
        key: 'dosage',
        width: 100,
        align: 'left' as const,
    },
    {
        title: 'SCHEDULE',
        key: 'schedule',
        width: 160,
        align: 'left' as const,
        render: (_: unknown, record: PrescriptionRow) => (
            <Space size={4} wrap>
                {record.morning > 0 && (
                    <StatusTag type={STATUS_INFO} className='schedule-tag'>
                        MOR{record.morning > 1 ? ` ×${record.morning}` : ''}
                    </StatusTag>
                )}
                {record.afternoon > 0 && (
                    <StatusTag type={STATUS_INFO} className='schedule-tag'>
                        AFT{record.afternoon > 1 ? ` ×${record.afternoon}` : ''}
                    </StatusTag>
                )}
                {record.night > 0 && (
                    <StatusTag type={STATUS_INFO} className='schedule-tag'>
                        NIT{record.night > 1 ? ` ×${record.night}` : ''}
                    </StatusTag>
                )}
                {record.morning === 0 && record.afternoon === 0 && record.night === 0 && (
                    <Text type='secondary'>—</Text>
                )}
            </Space>
        ),
    },
    {
        title: 'QTY',
        dataIndex: 'qty',
        key: 'qty',
        width: 70,
        align: 'center' as const,
        render: (qty: number) => <div className='qty-box'>{qty}</div>,
    },
    {
        title: 'REMAINING',
        key: 'remaining_quantity',
        width: 120,
        align: 'center' as const,
        render: (_: unknown, record: PrescriptionRow) => {
            if (record.remaining_quantity == null) {
                return <Text type="secondary">—</Text>;
            }
            return (
                <StatusTag
                    type={record.remaining_quantity > 0 ? STATUS_WARNING : STATUS_SUCCESS}
                >
                    Remaining {record.remaining_quantity}
                </StatusTag>
            );
        },
    },
    {
        title: 'ITEM STATUS',
        key: 'item_status',
        width: 140,
        align: 'center' as const,
        render: (_: unknown, record: PrescriptionRow) => {
            if (!record.item_status) {
                return <Text type="secondary">—</Text>;
            }
            return (
                <StatusTag
                    type={isItemFullyDispensed(record) ? STATUS_SUCCESS : STATUS_WARNING}
                >
                    {toTitleCase(record.item_status.replace(/_/g, ' '))}
                </StatusTag>
            );
        },
    },
];

function PharmacistPrescriptionDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const locationState = (location.state as PrescriptionLocationState | null) ?? null;
    const [messageApi, contextHolder] = message.useMessage();
    const [modalApi, modalContextHolder] = Modal.useModal();
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState<PrescriptionRow[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [patient, setPatient] = useState<patientlist | null>(null);
    const [resolvedPatientId, setResolvedPatientId] = useState<string | undefined>();
    const [prescriptionStatus, setPrescriptionStatus] = useState<string>(
        locationState?.status ?? '',
    );
    const [prescriptionCreatedAt, setPrescriptionCreatedAt] = useState<string>(
        locationState?.createdAt ?? '',
    );
    const [prescriptionCode, setPrescriptionCode] = useState('');

    const showGetNewPrescriptionPopup = () => {
        modalApi.warning({
            title: 'Get new prescription',
            content: PARTIAL_DISPENSE_BLOCK_MESSAGE,
            okText: 'OK',
            centered: true,
        });
    };

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
                const resolvedStatus =
                    first?.prescription_status || locationState?.status || '';
                setPrescriptionStatus(resolvedStatus);
                setPrescriptionCode(first?.prescription_code ?? '');
                if (first?.prescription_created_at) {
                    setPrescriptionCreatedAt(first.prescription_created_at);
                }

                if (
                    !cancelled &&
                    isPartiallyDispensedPrescriptionStatus(resolvedStatus)
                ) {
                    showGetNewPrescriptionPopup();
                }

                const patientId = resolvePrescriptionPatientId({
                    locationPatientId: locationState?.patientId,
                    queryPatientId: searchParams.get('patientId'),
                    cachedPatientId: recallPrescriptionPatientId(id),
                    apiPatientId:
                        medicineInfo.patient_id ||
                        lines.find((item) => item.patient_id)?.patient_id,
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
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [id, locationState?.patientId, locationState?.status, messageApi, searchParams]);

    const handlePreviewReceipt = () => {
        if (!id) {
            messageApi.error('Missing prescription id');
            return;
        }
        navigate(prescriptionReceiptPath(id, { patientId: resolvedPatientId }), {
            state: { patientId: resolvedPatientId },
        });
    };

    const handleGenerateLabels = () => {
        messageApi.loading({ content: 'Generating labels…', key: 'labels', duration: 2 });
        setTimeout(() => messageApi.success({ content: 'Labels generated', key: 'labels' }), 2000);
    };

    const handleDiscard = () => {
        if (!id) {
            messageApi.error('Missing prescription id');
            return;
        }

        modalApi.confirm({
            title: 'Discard Order?',
            content: 'This will cancel all items in the current order. This action cannot be undone.',
            okText: 'Yes, Discard',
            okType: 'danger',
            cancelText: 'Keep Order',
            onOk: async () => {
                try {
                    const response = await UpdateStatus({
                        prescription_id: id,
                        appointment_id: '',
                        status: 'cancelled',
                    });
                    if (response.code === '200') {
                        messageApi.success(response.message || 'Prescription cancelled');
                        navigate('/prescription');
                        return;
                    }
                    messageApi.error(response.message || 'Failed to cancel prescription');
                } catch (error) {
                    console.error('Failed to cancel prescription:', error);
                    messageApi.error('Failed to cancel prescription');
                }
            },
        });
    };

    const itemsFullyDispensed =
        rows.length > 0 && rows.every((row) => isItemFullyDispensed(row));
    const showBillPaid =
        isFullyDispensedPrescriptionStatus(prescriptionStatus) || itemsFullyDispensed;
    const showPaymentPending = isPaymentPendingPrescriptionStatus(prescriptionStatus);

    const handleProceedToCheckout = () => {
        if (!id) {
            messageApi.error('Missing prescription id');
            return;
        }
        if (showBillPaid) {
            messageApi.info('This prescription is already completed. Bill paid.');
            return;
        }
        // payment-pending / unpaid invoice — allow re-enter checkout to Complete payment
        if (isPartiallyDispensedPrescriptionStatus(prescriptionStatus)) {
            showGetNewPrescriptionPopup();
            return;
        }
        navigate(prescriptionPath(id, { checkout: true, patientId: resolvedPatientId }), {
            state: { patientId: resolvedPatientId },
        });
    };

    return (
        <Layout>
            {contextHolder}
            {modalContextHolder}
            <Sidebar />

            <Layout>
                <Breadcrumb className='appointment-breadcrumb-layout'>
                    <Breadcrumb.Item>
                        <HomeOutlined />
                        <Link to='/prescription'>Prescriptions</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Prescription Detail</Breadcrumb.Item>
                </Breadcrumb>

                <Content className='pharmacy-main-layout'>
                    {loading ? (
                        <PrescriptionPreviewSkeleton />
                    ) : (
                        <>
                            <Card className='patient-card'>
                                <Row justify='space-between' align='middle' gutter={[16, 16]}>
                                    <Col>
                                        <Space size={16}>
                                            <Avatar size={56} icon={<UserOutlined />} />
                                            <div>
                                                <Title level={5} className='patient-name'>
                                                    {patient?.patient_name ?? '—'}
                                                </Title>
                                                <Text className='patient-subtext'>
                                                    {patient ? formatPatientSubtext(patient) : '—'}
                                                </Text>
                                            </div>
                                        </Space>
                                    </Col>

                                    <Col>
                                        <div className='patient-meta'>
                                            <div className='patient-meta__item'>
                                                <Text className='info-label'>CREATED AT</Text>
                                                <Text>
                                                    {prescriptionCreatedAt
                                                        ? new Date(prescriptionCreatedAt).toLocaleString(
                                                              'en-IN',
                                                              {
                                                                  day: '2-digit',
                                                                  month: 'short',
                                                                  year: 'numeric',
                                                                  hour: '2-digit',
                                                                  minute: '2-digit',
                                                              },
                                                          )
                                                        : '—'}
                                                </Text>
                                            </div>

                                            <div className='patient-meta__item'>
                                                <Text className='info-label'>STATUS</Text>
                                                <StatusTag type={getPatientStatusType(patient?.patient_status)}>
                                                    {toTitleCase(patient?.patient_status)}
                                                </StatusTag>
                                            </div>

                                            <div className='patient-meta__item'>
                                                <Text className='info-label'>RX STATUS</Text>
                                                <Space size={4} wrap>
                                                    {prescriptionCode ? (
                                                        <StatusTag type={STATUS_INFO} bordered>
                                                            {prescriptionCode}
                                                        </StatusTag>
                                                    ) : null}
                                                    <StatusTag
                                                        type={getPrescriptionStatusTagColor(
                                                            prescriptionStatus,
                                                        )}
                                                        bordered
                                                    >
                                                        {formatPrescriptionStatusLabel(
                                                            prescriptionStatus,
                                                        )}
                                                    </StatusTag>
                                                    {showBillPaid && (
                                                        <StatusTag type={STATUS_SUCCESS}>
                                                            Bill paid
                                                        </StatusTag>
                                                    )}
                                                    {showPaymentPending && (
                                                        <StatusTag type={STATUS_WARNING}>
                                                            Yet to pay
                                                        </StatusTag>
                                                    )}
                                                </Space>
                                            </div>

                                            <div className='patient-meta__item'>
                                                <Text className='info-label'>CONTACT</Text>
                                                <Text>{patient?.patient_phone || '—'}</Text>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </Card>

                            <Card className='medicine-table-card'>
                                <div className='table-header'>
                                    <Space wrap>
                                        <Title level={5} className='table-title'>
                                            Prescribed Medication
                                        </Title>
                                        <StatusTag type={STATUS_INFO}>{totalCount} Items</StatusTag>
                                        {rows.some(
                                            (row) =>
                                                row.remaining_quantity != null &&
                                                row.remaining_quantity > 0,
                                        ) ? (
                                            <StatusTag type={STATUS_WARNING}>
                                                Remaining qty
                                            </StatusTag>
                                        ) : null}
                                    </Space>
                                </div>

                                <Table
                                    columns={columns}
                                    dataSource={rows}
                                    pagination={false}
                                    scroll={{ x: 'max-content' }}
                                    className='medicine-table'
                                    locale={{ emptyText: 'No medicines on this prescription' }}
                                />
                            </Card>

                            {!isCancelledPrescriptionStatus(prescriptionStatus) && (
                                <div className='sticky-footer'>
                                    <Space wrap>
                                        <Button icon={<EyeOutlined />} onClick={handlePreviewReceipt}>
                                            Preview Receipt
                                        </Button>
                                        <Button icon={<FileTextOutlined />} onClick={handleGenerateLabels}>
                                            Generate Labels
                                        </Button>
                                    </Space>

                                    <Space wrap>
                                        {!showBillPaid && (
                                            <Button danger onClick={handleDiscard}>
                                                Discard Order
                                            </Button>
                                        )}
                                        {showBillPaid ? (
                                            <StatusTag type={STATUS_SUCCESS}>
                                                Bill paid
                                            </StatusTag>
                                        ) : showPaymentPending ? (
                                            <Space wrap>
                                                <StatusTag type={STATUS_WARNING}>
                                                    Yet to pay
                                                </StatusTag>
                                                <Button
                                                    type='primary'
                                                    icon={<CheckCircleOutlined />}
                                                    className='confirm-btn'
                                                    onClick={handleProceedToCheckout}
                                                >
                                                    Complete payment
                                                </Button>
                                            </Space>
                                        ) : (
                                            !isDraftPrescriptionStatus(prescriptionStatus) && (
                                                <Button
                                                    type='primary'
                                                    icon={<CheckCircleOutlined />}
                                                    className='confirm-btn'
                                                    onClick={handleProceedToCheckout}
                                                >
                                                    Proceed to Checkout
                                                </Button>
                                            )
                                        )}
                                    </Space>
                                </div>
                            )}
                        </>
                    )}
                </Content>
            </Layout>
        </Layout>
    );
}

export default PharmacistPrescriptionDetail;
