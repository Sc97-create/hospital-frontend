import { Layout, Breadcrumb, Button, Input, Table, Tag, Pagination } from 'antd'
import { useState } from 'react'
import type { TableColumnsType, TableColumnType, TableProps, TablePaginationConfig } from 'antd'
import './patient-list.css'
import Sidebar from './sidebar'
import datecheck from 'dayjs'
import { useNavigate } from "react-router-dom";
import {
    HomeOutlined,
    UserOutlined,
    PlusCircleOutlined,
    SearchOutlined
} from '@ant-design/icons'
import HeaderLayout from './header'
const { Search } = Input;

const { Content } = Layout

interface DataType {
    key: React.Key;
    patient_name: string;
    age: number;
    weight: number;
    gender: string;
    issued_at: Date;
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
        },
        {
            title: 'Patient Name',
            dataIndex: 'patient_name',
            defaultSortOrder: 'descend',
            className: 'other-layout',
            render:(text,record)=>(
                <span
                   style={{cursor:'pointer'}}
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
            render: (date: Date) => datecheck(date).format('DD MMMM YYYY'),
            defaultSortOrder: 'descend',
            sorter: (a, b) => new Date(a.issued_at).getTime() - new Date(b.issued_at).getTime()
        },
        {
            title: 'Status',
            dataIndex: 'status',
            align:'center',
            render: (status: string) => {
                const toTitleCase = (str: string) =>
                    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

                const colorMap: Record<string, string> = {
                    pending: 'orange',
                    active: 'green',
                    completed: 'blue',
                    cancelled: 'red',
                };
                return <Tag color={colorMap[status]} bordered={true} className='tag-layout'>{toTitleCase(status)}</Tag>
            }
        }
    ];
    const data = [
        {
            key: '1',
            code: '#78C9DE',
            patient_name: 'Sachin',
            age: 32,
            weight: 75,
            gender: 'male',
            issued_at: new Date('2025-05-17'),
            status: 'pending'
        },
        {
            key: '2',
            code: '#78C9DR',
            patient_name: 'Akarsh',
            age: 42,
            weight: 75,
            gender: 'male',
            issued_at: new Date('2025-03-17'),
            status: 'pending'
        },
        {
            key: '3',
            code: '#78C9DG',
            patient_name: 'Manjunath',
            age: 32,
            weight: 75,
            gender: 'male',
            issued_at: new Date('2025-06-17'),
            status: 'pending'
        },
        {
            key: '4',
            code: '#78C9DV',
            patient_name: 'Sachin Ganachari',
            age: 32,
            weight: 75,
            gender: 'male',
            issued_at: new Date('2025-06-17'),
            status: 'cancelled'
        },
        {
            key: '5',
            code: '#78C9DV',
            patient_name: 'Sachin Ganachari',
            age: 32,
            weight: 75,
            gender: 'male',
            issued_at: new Date('2025-06-17'),
            status: 'cancelled'
        },
        {
            key: '6',
            code: '#78C9DV',
            patient_name: 'Sachin Ganachari',
            age: 32,
            weight: 75,
            gender: 'male',
            issued_at: new Date('2025-06-17'),
            status: 'cancelled'
        },
        {
            key: '7',
            code: '#78C9DV',
            patient_name: 'Sachin Ganachari',
            age: 32,
            weight: 75,
            gender: 'male',
            issued_at: new Date('2025-06-17'),
            status: 'cancelled'
        },
        {
            key: '8',
            code: '#78C9DV',
            patient_name: 'Sachin Ganachari',
            age: 32,
            weight: 75,
            gender: 'male',
            issued_at: new Date('2025-06-17'),
            status: 'cancelled'
        },
        {
            key: '9',
            code: '#78C9DV',
            patient_name: 'Sachin Ganachari',
            age: 32,
            weight: 75,
            gender: 'male',
            issued_at: new Date('2025-06-17'),
            status: 'cancelled'
        },
        {
            key: '10',
            code: '#78C9DV',
            patient_name: 'Sachin Ganachari',
            age: 32,
            weight: 75,
            gender: 'male',
            issued_at: new Date('2025-06-17'),
            status: 'cancelled'
        },
        {
            key: '11',
            code: '#78C9DV',
            patient_name: 'Sachin Ganachari',
            age: 32,
            weight: 75,
            gender: 'male',
            issued_at: new Date('2025-06-17'),
            status: 'cancelled'
        },
    ];
    const [pagination, setPagination] = useState<TablePaginationConfig>({
        current: 1,
        pageSize: 10,
        total: data.length,
    })
    const currentData = data.slice(
        ((pagination.current || 1) - 1) * (pagination.pageSize || 10),
        (pagination.current || 1) * (pagination.pageSize || 10)
    );
    const onChange: TableProps<DataType>['onChange'] = (pagination, filters, sorter, extra) => {
        console.log('params', pagination, filters, sorter, extra);

        //setPagination(pagination)
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
                                Add Appointment
                            </Button>
                        </div>
                        <div className="search-layout">

                            <Input placeholder='search patients' className='search-input' suffix={<SearchOutlined
                                style={{ cursor: 'pointer', width: '14px', height: '14px' }}
                            />} />
                        </div>
                        <div className="table-data">
                            <Table<DataType>
                                columns={columns}
                                dataSource={currentData}
                                showSorterTooltip={{ target: 'sorter-icon' }}
                                scroll={{ y: 400 }}
                                pagination={false}
                                onChange={onChange}
                            />
                        </div>
                        <div className="pagination-tab">
                            <h3>Total Patients ({data.length})</h3>
                            <Pagination
                                current={pagination.current}
                                total={data.length}
                                onChange={(page, pageSize) => {
                                    setPagination({ current: page, pageSize, total: data.length });
                                }}
                            />
                        </div>
                    </Content>
                </Layout>
            </Layout>
        </>
    )
}

export default PatientList

function dayjs(date: Date) {
    throw new Error('Function not implemented.')
}
