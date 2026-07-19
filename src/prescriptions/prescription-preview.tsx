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
    Tag,
    Typography,
} from 'antd';

import {
    HomeOutlined,
    UserOutlined,
    PrinterOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
} from '@ant-design/icons';

import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

import Sidebar from '../sidebar';
import { FindOnePrescription, GetDispenseCheckoutLines, UpdateStatus } from './api/prescription';
import type { medicineResponse } from './types/prescriptionmodel';
import {
    fetchPatientById,
    formatPatientSubtext,
    formatPrescriptionStatusLabel,
    getPrescriptionStatusTagColor,
    isCancelledPrescriptionStatus,
    isDraftPrescriptionStatus,
    isFullyDispensedPrescriptionStatus,
    prescriptionPath,
    recallPrescriptionPatientId,
    rememberPrescriptionPatientId,
    resolvePrescriptionPatientId,
    toTitleCase,
    type PrescriptionLocationState,
} from './prescription-patient';
import type { patientlist } from '../patientmangement/types/patients';
import PrescriptionPreviewSkeleton from './prescription-preview-skeleton';

import './prescription-preview.css';

const { Content } = Layout;
const { Title, Text } = Typography;

interface PrescriptionRow {
    key: string;
    medicine: string;
    form: string;
    dosage: string;
    morning: number;
    afternoon: number;
    night: number;
    duration: string;
    qty: number;
}

function mapMedicines(medicines: medicineResponse[]): PrescriptionRow[] {
    return medicines.map((item) => {
        const food =
            item.food_instruction === 'before'
                ? 'Before food'
                : item.food_instruction === 'after'
                  ? 'After food'
                  : item.food_instruction === 'any'
                    ? 'Any time'
                    : item.food_instruction || '';

        return {
            key: item.medicine_id,
            medicine: item.medicine_name,
            form: food,
            dosage: item.medicine_form || '—',
            morning: item.frequency?.morning ?? 0,
            afternoon: item.frequency?.afternoon ?? 0,
            night: item.frequency?.night ?? 0,
            duration: `${item.duration_day} ${item.duration_type || 'Days'}`,
            qty: item.quantity ?? 0,
        };
    });
}

const columns = [
    {
        title: 'MEDICINE & COMPOSITION',
        dataIndex: 'medicine',
        key: 'medicine',
        width: 220,
        align: 'left' as const,
        render: (_: unknown, record: PrescriptionRow) => (
            <div className='medicine-info'>
                <Text className='medicine-name'>{record.medicine}</Text>
                {record.form ? (
                    <Text className='medicine-generic'>{record.form}</Text>
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
                    <Tag className='schedule-tag schedule-tag--active'>
                        MOR{record.morning > 1 ? ` ×${record.morning}` : ''}
                    </Tag>
                )}
                {record.afternoon > 0 && (
                    <Tag className='schedule-tag schedule-tag--active'>
                        AFT{record.afternoon > 1 ? ` ×${record.afternoon}` : ''}
                    </Tag>
                )}
                {record.night > 0 && (
                    <Tag className='schedule-tag schedule-tag--active'>
                        NIT{record.night > 1 ? ` ×${record.night}` : ''}
                    </Tag>
                )}
                {record.morning === 0 && record.afternoon === 0 && record.night === 0 && (
                    <Text type='secondary'>—</Text>
                )}
            </Space>
        ),
    },
    {
        title: 'DURATION',
        dataIndex: 'duration',
        key: 'duration',
        width: 100,
        align: 'left' as const,
    },
    {
        title: 'QTY',
        dataIndex: 'qty',
        key: 'qty',
        width: 70,
        align: 'center' as const,
        render: (qty: number) => <div className='qty-box'>{qty}</div>,
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
    const [prescriptionCreatedAt] = useState<string>(locationState?.createdAt ?? '');

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
                const [rxResponse, medicineInfo] = await Promise.all([
                    FindOnePrescription(id, 50, 0),
                    GetDispenseCheckoutLines(id).catch(() => null),
                ]);
                if (cancelled) return;

                if (rxResponse.code === '200' || rxResponse.data) {
                    const medicines = rxResponse.data?.medicines ?? [];
                    setRows(mapMedicines(medicines));
                    setTotalCount(rxResponse.data?.total_count ?? medicines.length);
                }

                const statusFromMedicineInfo =
                    medicineInfo?.data?.find((item) => item.prescription_status)?.prescription_status ??
                    '';
                setPrescriptionStatus(statusFromMedicineInfo || locationState?.status || '');

                const patientId = resolvePrescriptionPatientId({
                    locationPatientId: locationState?.patientId,
                    queryPatientId: searchParams.get('patientId'),
                    cachedPatientId: recallPrescriptionPatientId(id),
                    apiPatientId:
                        rxResponse.data?.patient_id ||
                        medicineInfo?.patient_id ||
                        medicineInfo?.data?.find((item) => item.patient_id)?.patient_id,
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

    const handlePrint = () => {
        messageApi.info('Sending to printer…');
        window.print();
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

    const handleProceedToCheckout = () => {
        if (!id) {
            messageApi.error('Missing prescription id');
            return;
        }
        if (isFullyDispensedPrescriptionStatus(prescriptionStatus)) {
            messageApi.info('This prescription is already fully dispensed. Bill paid.');
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
                            {/* Patient context — from getpatientByID using patient_id on prescription */}
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
                                                <Tag color='green'>
                                                    {toTitleCase(patient?.patient_status)}
                                                </Tag>
                                            </div>

                                            <div className='patient-meta__item'>
                                                <Text className='info-label'>RX STATUS</Text>
                                                <Space size={4} wrap>
                                                    <Tag
                                                        color={getPrescriptionStatusTagColor(
                                                            prescriptionStatus,
                                                        )}
                                                        bordered
                                                        className='app-tag'
                                                    >
                                                        {formatPrescriptionStatusLabel(
                                                            prescriptionStatus,
                                                        )}
                                                    </Tag>
                                                    {isFullyDispensedPrescriptionStatus(
                                                        prescriptionStatus,
                                                    ) && <Tag color='green'>Bill paid</Tag>}
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
                                    <Space>
                                        <Title level={5} className='table-title'>
                                            Prescribed Medication
                                        </Title>
                                        <Tag>{totalCount} Items</Tag>
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
                                        <Button icon={<PrinterOutlined />} onClick={handlePrint}>
                                            Print Bill
                                        </Button>
                                        <Button icon={<FileTextOutlined />} onClick={handleGenerateLabels}>
                                            Generate Labels
                                        </Button>
                                    </Space>

                                    <Space wrap>
                                        {!isFullyDispensedPrescriptionStatus(prescriptionStatus) && (
                                            <Button danger onClick={handleDiscard}>
                                                Discard Order
                                            </Button>
                                        )}
                                        {isFullyDispensedPrescriptionStatus(prescriptionStatus) ? (
                                            <Tag color='green' className='app-tag'>
                                                Bill paid
                                            </Tag>
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
