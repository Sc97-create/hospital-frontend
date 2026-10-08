import {
    Breadcrumb,
    Button,
    Card,
    Col,
    DatePicker,
    Form,
    Input,
    Layout,
    message,
    Row,
    Select,
    Spin,
    TimePicker,
    Typography,
} from 'antd';

import {
    HomeOutlined,
    MailOutlined,
    PhoneOutlined,
} from '@ant-design/icons';

import { useCallback, useRef, useState } from 'react';
import type { UIEvent } from 'react';
import type { Dayjs } from 'dayjs';
import { Link, useNavigate } from 'react-router-dom';

import './add-employee.css';
import Sidebar from '../../sidebar';
import { GetDepartments, GetRoles } from '../../shared/api/shared-api';
import { AddEmployeeApi } from '../api/employee';
import type { AddEmployeePayload, EmployeeEmergencyDetails } from '../types/employee';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;
const LOOKUP_PAGE_SIZE = 10;

interface LookupOption {
    value: string;
    label: string;
}

interface EmployeeFormValues {
    first_name: string;
    last_name: string;
    mobile_number: string;
    email_id: string;
    address?: string;
    date_of_birth?: Dayjs;
    date_of_joining?: Dayjs;
    role_id?: string;
    dept_id?: string;
    license_no?: string;
    qualification?: string;
    employee_type?: string;
    start_time?: Dayjs;
    end_time?: Dayjs;
    emergency_name?: string;
    emergency_email?: string;
    emergency_contact?: string;
}

function usePagedLookup(
    fetchPage: (
        organisationId: string,
        page: number,
        limit: number,
    ) => Promise<{ code?: number | string; data?: Array<{ id: string; name: string }>; total?: number }>,
) {
    const organisationId = localStorage.getItem('organisation_id') || '';
    const [options, setOptions] = useState<LookupOption[]>([]);
    const [loading, setLoading] = useState(false);
    const pageRef = useRef(0);
    const hasMoreRef = useRef(true);
    const loadingRef = useRef(false);
    const seenIdsRef = useRef(new Set<string>());

    const loadPage = useCallback(async () => {
        if (!organisationId || loadingRef.current || !hasMoreRef.current) return;

        const nextPage = pageRef.current + 1;
        loadingRef.current = true;
        setLoading(true);
        try {
            const response = await fetchPage(organisationId, nextPage, LOOKUP_PAGE_SIZE);
            const ok = response?.code === 200 || response?.code === '200';
            const rows = ok && Array.isArray(response?.data) ? response.data : [];
            const nextOptions = rows
                .filter((row) => row?.id && !seenIdsRef.current.has(row.id))
                .map((row) => {
                    seenIdsRef.current.add(row.id);
                    return { value: row.id, label: row.name || '—' };
                });

            setOptions((prev) => [...prev, ...nextOptions]);
            pageRef.current = nextPage;

            const loadedCount = seenIdsRef.current.size;
            const total = Number(response?.total);
            hasMoreRef.current = Number.isFinite(total)
                ? loadedCount < total
                : rows.length >= LOOKUP_PAGE_SIZE;
        } catch (error) {
            console.error('Failed to load lookup options:', error);
            hasMoreRef.current = false;
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }, [fetchPage, organisationId]);

    const handlePopupScroll = (event: UIEvent<HTMLDivElement>) => {
        const target = event.target as HTMLDivElement;
        const nearBottom =
            target.scrollTop + target.offsetHeight >= target.scrollHeight - 24;
        if (nearBottom) {
            void loadPage();
        }
    };

    const handleDropdownVisibleChange = (open: boolean) => {
        if (open && pageRef.current === 0) {
            void loadPage();
        }
    };

    return {
        options,
        loading,
        handlePopupScroll,
        handleDropdownVisibleChange,
    };
}

function getApiErrorMessage(error: unknown, fallback: string): string {
    if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data &&
        typeof error.response.data.message === 'string'
    ) {
        return error.response.data.message;
    }
    if (error instanceof Error && error.message) {
        return error.message;
    }
    return fallback;
}

function buildAddEmployeePayload(
    organisationId: string,
    values: EmployeeFormValues,
): AddEmployeePayload {
    const payload: AddEmployeePayload = {
        organisation_id: organisationId,
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        mobile_number: values.mobile_number.trim(),
        email_id: values.email_id.trim(),
    };

    const address = values.address?.trim();
    if (address) payload.address = address;

    if (values.date_of_birth) {
        payload.date_of_birth = values.date_of_birth.format('YYYY-MM-DD');
    }
    if (values.date_of_joining) {
        payload.date_of_joining = values.date_of_joining.format('YYYY-MM-DD');
    }
    if (values.role_id) payload.role_id = values.role_id;
    if (values.dept_id) payload.dept_id = values.dept_id;

    const licenseNo = values.license_no?.trim();
    if (licenseNo) payload.license_no = licenseNo;

    const qualification = values.qualification?.trim();
    if (qualification) payload.qualification = qualification;

    if (values.employee_type) payload.employee_type = values.employee_type;

    if (values.start_time && values.end_time) {
        payload.shift_timings = {
            start_time: values.start_time.format('H:mm'),
            end_time: values.end_time.format('H:mm'),
        };
    }

    const emergency: EmployeeEmergencyDetails = {};
    const emergencyName = values.emergency_name?.trim();
    const emergencyEmail = values.emergency_email?.trim();
    const emergencyContact = values.emergency_contact?.trim();
    if (emergencyName) emergency.name = emergencyName;
    if (emergencyEmail) emergency.email = emergencyEmail;
    if (emergencyContact) emergency.contact = emergencyContact;
    if (Object.keys(emergency).length > 0) {
        payload.emergency_details = emergency;
    }

    return payload;
}

function AddEmployee() {
    const [form] = Form.useForm<EmployeeFormValues>();
    const [messageApi, contextHolder] = message.useMessage();
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const roles = usePagedLookup(GetRoles);
    const departments = usePagedLookup(GetDepartments);

    const handleCreateEmployee = async () => {
        try {
            const values = await form.validateFields();
            const organisationId = localStorage.getItem('organisation_id') || '';
            if (!organisationId) {
                messageApi.error('Missing organisation — please log in again');
                return;
            }

            setSubmitting(true);
            const response = await AddEmployeeApi(buildAddEmployeePayload(organisationId, values));
            const code = response.code != null ? String(response.code) : '200';
            if (code !== '200') {
                throw new Error(response.message || 'Failed to create employee');
            }
            messageApi.success(response.message || 'Employee created successfully');
            navigate('/employees');
        } catch (error) {
            if (error && typeof error === 'object' && 'errorFields' in error) {
                messageApi.error('Please fill in first name, last name, mobile number, and email');
                return;
            }
            console.error('Create employee failed:', error);
            messageApi.error(getApiErrorMessage(error, 'Failed to create employee. Try again.'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Layout>
            {contextHolder}
            <Sidebar />
            <Layout className="employee-layout">
                <Content className="employee-content">
                    <div className="employee-header">
                        <Breadcrumb
                            items={[
                                { href: '/dashboard', title: <HomeOutlined /> },
                                { title: <Link to="/employees">Staff Management</Link> },
                                { title: 'Add Employee' },
                            ]}
                        />

                        <div className="employee-title-row">
                            <div>
                                <Title level={2} className="employee-title">
                                    Add Employee
                                </Title>
                                <Text type="secondary" className="employee-subtitle">
                                    Register hospital staff with role, department, and shift details for scheduling and access control.
                                </Text>
                            </div>
                        </div>
                    </div>

                    <Form form={form} layout="vertical" className="employee-form">
                        <Card className="employee-card" title="Personal Information">
                            <Row gutter={[16, 0]}>
                                <Col xs={24} sm={12} lg={8}>
                                    <Form.Item
                                        label="First Name"
                                        name="first_name"
                                        rules={[{ required: true, message: 'First name is required' }]}
                                    >
                                        <Input placeholder="e.g. Priya" className="input-form-layout" />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={12} lg={8}>
                                    <Form.Item
                                        label="Last Name"
                                        name="last_name"
                                        rules={[{ required: true, message: 'Last name is required' }]}
                                    >
                                        <Input placeholder="e.g. Nair" className="input-form-layout" />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={12} lg={8}>
                                    <Form.Item
                                        label="Mobile Number"
                                        name="mobile_number"
                                        rules={[
                                            { required: true, message: 'Mobile number is required' },
                                            { pattern: /^\d{10}$/, message: 'Enter a valid 10-digit number' },
                                        ]}
                                    >
                                        <Input
                                            prefix={<PhoneOutlined />}
                                            placeholder="10-digit mobile"
                                            className="input-form-layout"
                                            maxLength={10}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={12} lg={8}>
                                    <Form.Item
                                        label="Email Address"
                                        name="email_id"
                                        rules={[
                                            { required: true, message: 'Email address is required' },
                                            { type: 'email', message: 'Enter a valid email address' },
                                        ]}
                                    >
                                        <Input
                                            prefix={<MailOutlined />}
                                            placeholder="work@hospital.com"
                                            className="input-form-layout"
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={12} lg={8}>
                                    <Form.Item label="Date of Birth" name="date_of_birth">
                                        <DatePicker className="date-picker-layout" placeholder="Select date" />
                                    </Form.Item>
                                </Col>

                                <Col span={24}>
                                    <Form.Item label="Residential Address" name="address">
                                        <TextArea
                                            rows={2}
                                            placeholder="Street, city, state, PIN code"
                                            className="text-area-layout"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>

                        <Card className="employee-card top-space" title="Professional Details">
                            <Row gutter={[16, 0]}>
                                <Col xs={24} sm={12} lg={8}>
                                    <Form.Item
                                        label="Role"
                                        name="role_id"
                                        extra="Determines system access and clinical responsibilities"
                                    >
                                        <Select
                                            placeholder="Select role"
                                            className="dropdown-input-class"
                                            options={roles.options}
                                            loading={roles.loading}
                                            allowClear
                                            onPopupScroll={roles.handlePopupScroll}
                                            onOpenChange={roles.handleDropdownVisibleChange}
                                            notFoundContent={roles.loading ? <Spin size="small" /> : undefined}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={12} lg={8}>
                                    <Form.Item label="Department" name="dept_id">
                                        <Select
                                            placeholder="Select department"
                                            className="dropdown-input-class"
                                            options={departments.options}
                                            loading={departments.loading}
                                            allowClear
                                            onPopupScroll={departments.handlePopupScroll}
                                            onOpenChange={departments.handleDropdownVisibleChange}
                                            notFoundContent={departments.loading ? <Spin size="small" /> : undefined}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={12} lg={8}>
                                    <Form.Item label="License / Registration No." name="license_no">
                                        <Input
                                            placeholder="Medical council or board ID"
                                            className="input-form-layout"
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={12} lg={8}>
                                    <Form.Item label="Qualification" name="qualification">
                                        <Input
                                            placeholder="e.g. MBBS, B.Pharm, GNM"
                                            className="input-form-layout"
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={12} lg={8}>
                                    <Form.Item label="Joining Date" name="date_of_joining">
                                        <DatePicker className="date-picker-layout" placeholder="Select date" />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={12} lg={8}>
                                    <Form.Item label="Employment Type" name="employee_type">
                                        <Select placeholder="Select type" className="dropdown-input-class" allowClear>
                                            <Select.Option value="full_time">Full-time</Select.Option>
                                            <Select.Option value="part_time">Part-time</Select.Option>
                                            <Select.Option value="contract">Contract</Select.Option>
                                            <Select.Option value="locum">Locum / Visiting</Select.Option>
                                        </Select>
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={12} lg={8}>
                                    <Form.Item label="Emergency Contact Name" name="emergency_name">
                                        <Input placeholder="Full name" className="input-form-layout" />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={12} lg={8}>
                                    <Form.Item
                                        label="Emergency Contact Email"
                                        name="emergency_email"
                                        rules={[{ type: 'email', message: 'Enter a valid email address' }]}
                                    >
                                        <Input
                                            prefix={<MailOutlined />}
                                            placeholder="emergency@example.com"
                                            className="input-form-layout"
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={12} lg={8}>
                                    <Form.Item
                                        label="Emergency Contact Phone"
                                        name="emergency_contact"
                                        rules={[{ pattern: /^\d{10}$/, message: 'Enter a valid 10-digit number' }]}
                                    >
                                        <Input
                                            prefix={<PhoneOutlined />}
                                            placeholder="10-digit number"
                                            className="input-form-layout"
                                            maxLength={10}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>

                        <Card className="employee-card top-space" title="Shift & Availability">
                            <Text type="secondary" className="section-hint">
                                Optional default shift for rostering, OPD coverage, and ward duty planning.
                            </Text>

                            <Row gutter={[16, 0]}>
                                <Col xs={24} sm={12} lg={8}>
                                    <Form.Item label="Shift Start Time" name="start_time">
                                        <TimePicker className="time-picker-layout" format="HH:mm" placeholder="Start" />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={12} lg={8}>
                                    <Form.Item label="Shift End Time" name="end_time">
                                        <TimePicker className="time-picker-layout" format="HH:mm" placeholder="End" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>
                    </Form>

                    <div className="employee-footer">
                        <Button onClick={() => navigate('/employees')} disabled={submitting}>
                            Cancel
                        </Button>

                        <div className="footer-right">
                            <Button type="primary" loading={submitting} onClick={handleCreateEmployee}>
                                Create Employee
                            </Button>
                        </div>
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}

export default AddEmployee;
