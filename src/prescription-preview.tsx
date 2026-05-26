import { Breadcrumb, Button, Col, Descriptions, Divider, Layout, List, Row, Table, type DescriptionsProps, type TableProps } from 'antd'
import './prescription-preview.css'
import Sidebar from './sidebar'
import { Content } from 'antd/es/layout/layout'
import { Link,useNavigate,useParams } from 'react-router-dom'
import { HomeOutlined, UserOutlined } from '@ant-design/icons'
import { useState } from 'react'


const items: DescriptionsProps['items'] = [
    {
        key: '1',
        label: 'Product',
        children: 'Cloud Database',
    },
    {
        key: '2',
        label: 'Billing Mode',
        children: 'Prepaid',
    },

]
interface DataType {
    key: string;
    medication: string;
    dosage: string;
    frequency: string;
}
const columns: TableProps<DataType>['columns'] = [
    {
        title: 'Medication',
        dataIndex: 'medication',
        key: 'medication',
    },
    {
        title: 'Dosage',
        dataIndex: 'dosage',
        key: 'dosage',
    },
    {
        title: 'Frequency',
        dataIndex: 'frequency',
        key: 'freq'
    }
]
const data: DataType[] = [
    {
        key: '1',
        medication: 'Paracetamol',
        dosage: '50mg',
        frequency: 'daily once'

    },
    {
        key: '2',
        medication: 'Azitromicin',
        dosage: '10mg',
        frequency: 'night once'
    },
    {
        key: '3',
        medication: 'Azitromicin',
        dosage: '10mg',
        frequency: 'night once'
    },
]
function PrescPreview() {
    const { patientID } = useParams<{ patientID: string }>();
    const [open, setOpen] = useState(false);
    return (
        <>
            <Layout>
                <Sidebar />
                <Layout>
                    <Breadcrumb className='appointment-breadcrumb-layout'>
                        <Breadcrumb.Item>
                            <HomeOutlined />
                            <Link to='/dashboard'>Home</Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            <UserOutlined />
                            <Link to={`/patients/patient-overview/${patientID}`}>Patient Overview</Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            Prescription Preview
                        </Breadcrumb.Item>
                    </Breadcrumb>
                    <Content className='presc-preview-layout'>
                        <h2>Prescription Preview</h2>
                        <div className="patient-info">
                            <h3>Patient Information</h3>
                            <Divider variant='solid' style={{ borderColor: "#E5E7EB", borderWidth: 2 }} />
                        </div>

                        <div className="patient-data">
                            <Row gutter={[8, 24]} align={'middle'}>
                                <Col span={4}>
                                    <h3>Patient Name :</h3>
                                </Col>
                                <Col span={8}>
                                    <h3>Sachin Chate</h3>
                                </Col>
                                <Col span={12}>

                                </Col>

                                <Col span={4}>
                                    <h3>Date of Birth</h3>
                                </Col>
                                <Col span={8}>
                                    <h3>1985-09-05</h3>
                                </Col>
                                <Col span={12}>

                                </Col>
                                <Col span={4}>
                                    <h3>Prescribed By:</h3>
                                </Col>
                                <Col span={8}>
                                    <h3>Dr. Charles</h3>
                                </Col>
                                <Col span={12}>
                                </Col>
                            </Row>
                        </div>
                        <div className="medication-details">
                            <h3>Medication Details</h3>
                        </div>
                        <div className="table-data">
                            <Table<DataType> columns={columns} dataSource={data} />
                        </div>
                        <div className="presc-button-layout">
                            <Button className='add-button'>
                                Submit
                            </Button>
                        </div>


                    </Content>
                </Layout>
            </Layout>
        </>
    )
}
export default PrescPreview