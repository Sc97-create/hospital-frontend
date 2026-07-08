import {
    Alert,
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

import { Link } from 'react-router-dom';

import Sidebar from '../sidebar';

import './prescription-preview.css';

const { Content } = Layout;
const { Title, Text } = Typography;

interface PrescriptionRow {
    key: string;
    medicine: string;
    generic: string;
    dosage: string;
    duration: string;
    qty: number;
    stock: string;
    stockType: string;
}

const dataSource: PrescriptionRow[] = [
    {
        key: '1',
        medicine: 'Dolo 650',
        generic: 'Paracetamol 650mg',
        dosage: '650mg',
        duration: '5 Days',
        qty: 10,
        stock: '4500 In Stock',
        stockType: 'success',
    },
    {
        key: '2',
        medicine: 'Atorvastatin 20mg',
        generic: 'Brand: Lipitor',
        dosage: '20mg',
        duration: '30 Days',
        qty: 30,
        stock: '12 Units (Low Stock)',
        stockType: 'warning',
    },
    {
        key: '3',
        medicine: 'Amoxicillin 500mg',
        generic: 'Antibiotic Class',
        dosage: '500mg',
        duration: '7 Days',
        qty: 21,
        stock: 'Out of Stock',
        stockType: 'danger',
    },
];

const columns = [
    {
        title: 'MEDICINE & COMPOSITION',
        dataIndex: 'medicine',
        key: 'medicine',
        width: 220,
        align: 'left' as const,

        render: (_: unknown, record: PrescriptionRow) => (
            <div className='medicine-info'>
                <Text className='medicine-name'>
                    {record.medicine}
                </Text>

                <Text className='medicine-generic'>
                    {record.generic}
                </Text>
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
        width: 140,
        align: 'left' as const,

        render: () => (
            <Space size={4}>
                <Tag className='schedule-tag'>MOR</Tag>
                <Tag className='schedule-tag'>AFT</Tag>
                <Tag className='schedule-tag'>NIT</Tag>
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

        render: (qty: number) => (
            <div className='qty-box'>
                {qty}
            </div>
        ),
    },

    {
        title: 'STOCK STATUS',
        key: 'stock',
        width: 180,
        align: 'left' as const,

        render: (_: unknown, record: PrescriptionRow) => (
            <div className={`stock-status ${record.stockType}`}>
                <span className='stock-dot'></span>

                <Text>{record.stock}</Text>
            </div>
        ),
    },

    {
        title: 'ACTION',
        key: 'action',
        width: 110,
        align: 'center' as const,

        render: () => (
            <Button type='text' className='dispense-btn'>
                Dispense
            </Button>
        ),
    },
];

function PharmacistPrescriptionDetail() {
    const [messageApi, contextHolder] = message.useMessage();

    const handlePrint = () => {
        messageApi.info('Sending to printer…');
        window.print();
    };

    const handleGenerateLabels = () => {
        messageApi.loading({ content: 'Generating labels…', key: 'labels', duration: 2 });
        setTimeout(() => messageApi.success({ content: 'Labels generated', key: 'labels' }), 2000);
    };

    const handleDiscard = () => {
        Modal.confirm({
            title: 'Discard Order?',
            content: 'This will cancel all items in the current order. This action cannot be undone.',
            okText: 'Yes, Discard',
            okType: 'danger',
            cancelText: 'Keep Order',
            onOk: () => messageApi.warning('Order discarded'),
        });
    };

    const handlePartialDispense = () => {
        messageApi.info('Partial dispense recorded');
    };

    const handleConfirmDispense = () => {
        messageApi.loading({ content: 'Confirming dispense…', key: 'dispense', duration: 1.5 });
        setTimeout(() => messageApi.success({ content: 'Order confirmed & dispensed', key: 'dispense' }), 1500);
    };

    return (
        <Layout>
            {contextHolder}
            <Sidebar />

            <Layout>
                <Breadcrumb className='appointment-breadcrumb-layout'>
                    <Breadcrumb.Item>
                        <HomeOutlined />
                        <Link to='/prescription'>Prescriptions</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        Prescription Detail
                    </Breadcrumb.Item>
                </Breadcrumb>

                <Content className='pharmacy-main-layout'>

                    {/* Patient Card */}
                    <Card className='patient-card'>
                        <Row justify='space-between' align='middle'>
                            <Col>
                                <Space size={16}>
                                    <Avatar
                                        size={56}
                                        icon={<UserOutlined />}
                                    />

                                    <div>
                                        <Title level={5} className='patient-name'>
                                            James Wilson
                                        </Title>

                                        <Text className='patient-subtext'>
                                            UHID: 1002394 • 45y / Male
                                        </Text>
                                    </div>
                                </Space>
                            </Col>

                            <Col>
                                <Space size={32}>
                                    <div>
                                        <Text className='info-label'>VISIT TYPE</Text>

                                        <div>
                                            <Tag color='green'>
                                                IN-PATIENT (Ward 4B)
                                            </Tag>
                                        </div>
                                    </div>

                                    <div>
                                        <Text className='info-label'>VITAL STATUS</Text>

                                        <div>
                                            <Tag color='success'>
                                                Stable
                                            </Tag>
                                        </div>
                                    </div>

                                    <div>
                                        <Text className='info-label'>CONTACT</Text>

                                        <div>
                                            <Text>+1555-0192</Text>
                                        </div>
                                    </div>

                                    <Button>
                                        EHR Record
                                    </Button>
                                </Space>
                            </Col>
                        </Row>
                    </Card>

                    {/* Alerts */}
                    <Alert
                        className='alert-card interaction-alert'
                        message='Drug Interaction Alert'
                        description='Moderate interaction between Dolo 650 & Warfarin.'
                        type='warning'
                        showIcon
                        closable
                    />

                    <Alert
                        className='alert-card allergy-alert'
                        message='Severe Allergy Warning'
                        description='Patient has documented allergy to Penicillin.'
                        type='error'
                        showIcon
                        closable
                    />

                    {/* Medicine Table */}
                    <Card className='medicine-table-card'>

                        <div className='table-header'>
                            <Space>
                                <Title level={5} className='table-title'>
                                    Prescribed Medication
                                </Title>

                                <Tag>3 Items</Tag>
                            </Space>

                            <Button>
                                Filter
                            </Button>
                        </div>

                        <Table
                            columns={columns}
                            dataSource={dataSource}
                            pagination={false}
                            scroll={{ x: 'max-content' }}
                            className='medicine-table'
                        />

                        <div className='billing-summary'>
                            <div className='summary-row'>
                                <Text>Subtotal</Text>
                                <Text>$142.50</Text>
                            </div>

                            <div className='summary-row'>
                                <Text>GST (5%)</Text>
                                <Text>$7.12</Text>
                            </div>

                            <div className='summary-row total'>
                                <Text strong>Grand Total</Text>
                                <Text strong>$149.62</Text>
                            </div>
                        </div>
                    </Card>


                    {/* Footer */}
                    <div className='sticky-footer'>
                        <Space>
                            <Button icon={<PrinterOutlined />} onClick={handlePrint}>
                                Print Bill
                            </Button>

                            <Button icon={<FileTextOutlined />} onClick={handleGenerateLabels}>
                                Generate Labels
                            </Button>
                        </Space>

                        <Space>
                            <Button danger onClick={handleDiscard}>
                                Discard Order
                            </Button>

                            <Button onClick={handlePartialDispense}>
                                Partial Dispense
                            </Button>

                            <Button
                                type='primary'
                                icon={<CheckCircleOutlined />}
                                className='confirm-btn'
                                onClick={handleConfirmDispense}
                            >
                                Confirm & Dispense
                            </Button>
                        </Space>
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}

export default PharmacistPrescriptionDetail;