import { Layout, Breadcrumb, Button, Input, Table, Pagination } from 'antd'
import { useState, useEffect } from 'react'
import type { TableColumnsType, TablePaginationConfig } from 'antd'
import './patient-list.css'
import Sidebar from '../../sidebar'
import datecheck from 'dayjs'
import { useNavigate } from "react-router-dom";
import {
    HomeOutlined,
    UserOutlined,
    PlusCircleOutlined,
    SearchOutlined
} from '@ant-design/icons'
import { findMany } from '../api/patients'
import type { Patientlistresponse } from '../types/patients'
import { StatusTag } from '../../components/status-tag'
import { getPatientStatusType, STATUS_INFO } from '../../constants/status-colors'

const { Content } = Layout

interface DataType {
    key: React.Key;
    patient_name: string;
    age: number;
    weight: number;
    gender: string;
    issued_at: Date;
    patient_created_at: string;
    status: string;
}



function PatientList() {
    const navigate = useNavigate()
    const columns: TableColumnsType<DataType> = [

        {
            title: 'Code',
            dataIndex: 'code',
            className: 'column-layout',
            showSorterTooltip: { target: 'full-header' },
            render: (text: string) => (
                <StatusTag type={STATUS_INFO}>{text}</StatusTag>
            )
        },
        {
            title: 'Patient Name',
            dataIndex: 'patient_name',
            defaultSortOrder: 'descend',
            className: 'other-layout',
            render: (text, record) => (
                <span
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/patients/patient-overview/${record.key}`)}
                >
                    {text}
                </span>
            )

        },
        {
            title: 'Age',
            dataIndex: 'age',
            className: 'other-layout',
            sorter: (a, b) => a.age - b.age,
        },
        {
            title: 'Weight',
            dataIndex: 'weight',
            className: 'other-layout'
        },
        {
            title: 'Gender',
            dataIndex: 'gender',
            className: 'other-layout',
            filters: [
                {
                    text: 'Male',
                    value: 'male',
                },
                {
                    text: 'Female',
                    value: 'female',
                }],
            onFilter: (value, record) => record.gender.indexOf(value as string) === 0,


        },
        {
            title: 'Issued At',
            dataIndex: 'issued_at',
            className: 'other-layout',
            showSorterTooltip: { target: 'full-header' },
            render: (_date: Date, record) => datecheck(record.patient_created_at).format('DD MMMM YYYY'),
            defaultSortOrder: 'descend',
            sorter: (a, b) => new Date(a.patient_created_at).getTime() - new Date(b.patient_created_at).getTime()
        },
        {
            title: 'Status',
            dataIndex: 'status',
            align: 'center',
            render: (status: string) => {
                const toTitleCase = (str: string) =>
                    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

                return (
                    <StatusTag type={getPatientStatusType(status)} bordered>
                        {toTitleCase(status)}
                    </StatusTag>
                );
            }
        }
    ];
    const [response, setresponse] = useState<Patientlistresponse>();
    const [loading, setLoading] = useState(false);
    const patientlist = async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const res = await findMany(pageSize, page, localStorage.getItem("organisation_id") || "");
            setresponse(res);

            setPagination(prev => ({
                ...prev,
                current: page,
                pageSize: pageSize,
                total: res?.total || 0 
            }));
        }
        catch (e) {
            console.log(e);
        }
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        patientlist(pagination.current, pagination.pageSize);
    }, []);


    const [pagination, setPagination] = useState<TablePaginationConfig>({
        current: 1,
        pageSize: 10,
        total: response?.data?.length || 0
    })
    const currentData: DataType[] = (response?.data || []).map(patient => ({
        key: patient.patient_id,
        code: '#' + patient.patient_code,
        patient_name: patient.patient_name,
        age: patient.patient_age,
        weight: patient.patient_weight,
        gender: patient.patient_gender,
        issued_at: patient.admission_date,
        patient_created_at: patient.patient_created_at,
        status: patient.patient_status || 'active'
    }));
    const onChange = (page: number, pageSize?: number) => {
        patientlist(page, pageSize);
    };


    return (
        <>
            <Layout>

                <Sidebar />
                <Layout>

                    <Breadcrumb
                        className='breadcrumb-layout'
                        items={[
                            {
                                href: '/dashboard',
                                title: <HomeOutlined />,
                            },
                            {

                                title: (
                                    <>
                                        <UserOutlined />
                                        <span>Patients</span>
                                    </>
                                ),
                            },

                        ]}
                    />
                    <Content className='main-layout'>
                        <div className="button-layout">
                            <Button
                                className='appointment-button'
                                icon={<PlusCircleOutlined />}
                                onClick={() => { navigate('/patients/add-patient') }}
                            >
                                Add New Patient
                            </Button>
                        </div>
                        <div className="search-layout">

                            <Input placeholder='search patients' className='search-input1' suffix={<SearchOutlined
                                style={{ cursor: 'pointer', width: '14px', height: '14px' }}
                            />} />
                        </div>
                        <div className="table-data">
                            <Table<DataType>
                                columns={columns}
                                dataSource={currentData}
                                showSorterTooltip={{ target: 'sorter-icon' }}
                                scroll={{ x: 'max-content', y: 400 }}
                                pagination={false}
                                loading={loading}
                            />
                        </div>
                        <div className="pagination-tab">
                            <span className="count-label">Total Patients ({response?.data?.length || 0})</span>
                            <Pagination
                                current={pagination.current}
                                pageSize={pagination.pageSize}
                                total={pagination.total}
                                onChange={onChange}
                            />
                        </div>
                    </Content>
                </Layout>
            </Layout>
        </>
    )
}

export default PatientList
