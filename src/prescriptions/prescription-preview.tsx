import {
    Alert,
    Avatar,
    Breadcrumb,
    Button,
    Card,
    Col,
    Input,
    Layout,
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
const { TextArea } = Input;

const dataSource = [
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

        render: (_: any, record: any) => (
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
    },

    {
        title: 'SCHEDULE',
        key: 'schedule',

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
    },

    {
        title: 'QTY',
        dataIndex: 'qty',
        key: 'qty',

        render: (qty: number) => (
            <div className='qty-box'>
                {qty}
            </div>
        ),
    },

    {
        title: 'STOCK STATUS',
        key: 'stock',

        render: (_: any, record: any) => (
            <div className={`stock-status ${record.stockType}`}>
                <span className='stock-dot'></span>

                <Text>{record.stock}</Text>
            </div>
        ),
    },

    {
        title: 'ACTION',
        key: 'action',

        render: () => (
            <Button type='text' className='dispense-btn'>
                Dispense
            </Button>
        ),
    },
];

function PharmacistPrescriptionDetail() {
    return (
        <Layout>
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
                            <Button icon={<PrinterOutlined />}>
                                Print Bill
                            </Button>

                            <Button icon={<FileTextOutlined />}>
                                Generate Labels
                            </Button>
                        </Space>

                        <Space>
                            <Button danger>
                                Discard Order
                            </Button>

                            <Button>
                                Partial Dispense
                            </Button>

                            <Button
                                type='primary'
                                icon={<CheckCircleOutlined />}
                                className='confirm-btn'
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