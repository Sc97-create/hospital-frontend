import { Layout, Breadcrumb, Button, Input, Table, Pagination, message } from 'antd'
import { useState, useEffect, useRef } from 'react'
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
import { usePermissions } from '../../auth/permissions-context'

const { Content } = Layout
const SEARCH_DEBOUNCE_MS = 400;

interface DataType {
    key: React.Key;
    code: string;
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
    const { canCreate } = usePermissions()
    const [messageApi, contextHolder] = message.useMessage()
    const [response, setresponse] = useState<Patientlistresponse>();
    const [loading, setLoading] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [pagination, setPagination] = useState<TablePaginationConfig>({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const organisationId = localStorage.getItem("organisation_id") || "";
    const requestIdRef = useRef(0);

    const columns: TableColumnsType<DataType> = [
        {
            title: 'Code',
            dataIndex: 'code',
            className: 'column-layout',
            showSorterTooltip: { target: 'full-header' },
            render: (text: string) => (
                <StatusTag type={STATUS_INFO} className="code-badge">{text}</StatusTag>
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

    useEffect(() => {
        const nextSearch = searchInput.trim();
        if (nextSearch === debouncedSearch) return;
        const timer = window.setTimeout(() => {
            setDebouncedSearch(nextSearch);
            setPagination((prev) => ({ ...prev, current: 1 }));
        }, SEARCH_DEBOUNCE_MS);
        return () => window.clearTimeout(timer);
    }, [searchInput, debouncedSearch]);

    const patientlist = async (page = 1, pageSize = 10, search = "") => {
        if (!organisationId) {
            messageApi.error("Missing organisation — please log in again");
            return;
        }

        const requestId = ++requestIdRef.current;
        setLoading(true);
        try {
            const trimmedSearch = search.trim();
            const res = await findMany({
                organisation_id: organisationId,
                limit: pageSize,
                page_no: page,
                ...(trimmedSearch ? { search: trimmedSearch } : {}),
            });
            if (requestId !== requestIdRef.current) return;

            const total = Number(res?.total);
            setresponse(res);
            setPagination((prev) => ({
                ...prev,
                current: page,
                pageSize,
                total: Number.isFinite(total) ? total : 0,
            }));
        } catch (e) {
            if (requestId !== requestIdRef.current) return;
            console.error(e);
            messageApi.error("Failed to load patients");
            setresponse(undefined);
            setPagination((prev) => ({ ...prev, total: 0 }));
        } finally {
            if (requestId === requestIdRef.current) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        patientlist(pagination.current || 1, pagination.pageSize || 10, debouncedSearch);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch when page / search changes
    }, [pagination.current, pagination.pageSize, debouncedSearch, organisationId]);

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
        setPagination((prev) => ({
            ...prev,
            current: page,
            pageSize: pageSize || prev.pageSize,
        }));
    };

    return (
        <>
            {contextHolder}
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
                            {canCreate("patient") ? (
                                <Button
                                    className='appointment-button'
                                    icon={<PlusCircleOutlined />}
                                    onClick={() => { navigate('/patients/add-patient') }}
                                >
                                    Add New Patient
                                </Button>
                            ) : null}
                        </div>
                        <div className="search-layout">
                            <Input
                                allowClear
                                placeholder='Search by patient name, code, or phone...'
                                className='search-input1'
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                suffix={
                                    <SearchOutlined
                                        style={{ cursor: 'pointer', width: '14px', height: '14px' }}
                                    />
                                }
                            />
                        </div>
                        <div className="table-data">
                            <Table<DataType>
                                columns={columns}
                                dataSource={currentData}
                                showSorterTooltip={{ target: 'sorter-icon' }}
                                pagination={false}
                                loading={loading}
                                size="small"
                            />
                        </div>
                        <div className="pagination-tab">
                            <span className="count-label">
                                Total Patients ({pagination.total || 0})
                            </span>
                            <Pagination
                                current={pagination.current}
                                pageSize={pagination.pageSize}
                                total={pagination.total}
                                onChange={onChange}
                                showSizeChanger={false}
                            />
                        </div>
                    </Content>
                </Layout>
            </Layout>
        </>
    )
}

export default PatientList
