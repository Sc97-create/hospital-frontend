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
    Radio,
    Row,
    Select,
    TimePicker,
    Typography,
} from 'antd';

import {
    HomeOutlined,
    IdcardOutlined,
    MailOutlined,
    PhoneOutlined,
} from '@ant-design/icons';

import './add-employee.css';
import Sidebar from '../../sidebar';
import { Link } from 'react-router-dom';
import { StatusTag } from '../../components/status-tag';
import { STATUS_WARNING } from '../../constants/status-colors';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

const EMPLOYEE_ROLES = [
    { value: 'doctor', label: 'Doctor' },
    { value: 'nurse', label: 'Nurse' },
    { value: 'pharmacist', label: 'Pharmacist' },
    { value: 'receptionist', label: 'Receptionist' },
    { value: 'attendant', label: 'Attendant' },
    { value: 'admin', label: 'Admin' },
];

const DEPARTMENTS = [
    { value: 'cardiology', label: 'Cardiology' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'icu', label: 'ICU' },
    { value: 'pharmacy', label: 'Pharmacy' },
    { value: 'reception', label: 'Reception' },
    { value: 'radiology', label: 'Radiology' },
    { value: 'pediatrics', label: 'Pediatrics' },
];

function AddEmployee() {
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();

    const handleSaveDraft = async () => {
        const values = form.getFieldsValue();
        if (!values.first_name && !values.email) {
            messageApi.warning('Fill in at least a name or email before saving a draft');
            return;
        }
        messageApi.loading({ content: 'Saving draft…', key: 'draft', duration: 1.5 });
        setTimeout(() => messageApi.success({ content: 'Draft saved', key: 'draft' }), 1500);
    };

    const handleCreateEmployee = async () => {
        try {
            await form.validateFields();
            messageApi.loading({ content: 'Creating employee…', key: 'create', duration: 2 });
            setTimeout(() => messageApi.success({ content: 'Employee created successfully', key: 'create' }), 2000);
        } catch {
            messageApi.error('Please fill in all required fields');
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
                            <StatusTag type={STATUS_WARNING}>Draft</StatusTag>
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
                                        <Input placeholder="e.g. John" className="input-form-layout" />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={12} lg={8}>
                                    <Form.Item
                                        label="Last Name"
                                        name="last_name"
                                        rules={[{ required: true, message: 'Last name is required' }]}
                                    >
                                        <Input placeholder="e.g. Doe" className="input-form-layout" />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={12} lg={8}>
                                    <Form.Item
                                        label="Gender"
                                        name="gender"
                                        rules={[{ required: true, message: 'Please select a gender' }]}
                                    >
                                        <Select placeholder="Select gender" className="dropdown-input-class">
                                            <Select.Option value="male">Male</Select.Option>
                                            <Select.Option value="female">Female</Select.Option>
                                            <Select.Option value="other">Other</Select.Option>
                                        </Select>
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={12} lg={8}>
                                    <Form.Item
                                        label="Date of Birth"
                                        name="dob"
                                        rules={[{ required: true, message: 'Date of birth is required' }]}
                                    >
                                        <DatePicker className="date-picker-layout" placeholder="Select date" />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={12} lg={8}>
                                    <Form.Item
                                        label="Mobile Number"
                                        name="mobile"
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
                                        name="email"
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

                                <Col span={24}>
                                    <Form.Item
                                        label="Residential Address"
                                        name="address"
                                        rules={[{ required: true, message: 'Address is required' }]}
                                    >
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
                                    <Form.Item label="Employee ID">
                                        <Input
                                            value="HMS-2024-001"
                                            disabled
                                            className="input-form-layout"
                                            prefix={<IdcardOutlined />}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={12} lg={8}>
                                    <Form.Item
                                        label="Role"
                                        name="role"
                                        rules={[{ required: true, message: 'Please select a role' }]}
                                        extra="Determines system access and clinical responsibilities"
                                    >
                                        <Select
                                            placeholder="Select role"
                                            className="dropdown-input-class"
                                            options={EMPLOYEE_ROLES}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={12} lg={8}>
                                    <Form.Item
                                        label="Department"
                                        name="department"
                                        rules={[{ required: true, message: 'Please select a department' }]}
                                    >
                                        <Select
                                            placeholder="Select department"
                                            className="dropdown-input-class"
                                            options={DEPARTMENTS}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={12} lg={8}>
                                    <Form.Item label="Specialization" name="specialization">
                                        <Input
                                            placeholder="e.g. Cardiologist, ICU Nurse"
                                            className="input-form-layout"
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={12} lg={8}>
                                    <Form.Item
                                        label="License / Registration No."
                                        name="license_number"
                                        rules={[{ required: true, message: 'License number is required' }]}
                                    >
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
                                    <Form.Item
                                        label="Joining Date"
                                        name="joining_date"
                                        rules={[{ required: true, message: 'Joining date is required' }]}
                                    >
                                        <DatePicker className="date-picker-layout" placeholder="Select date" />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={12} lg={8}>
                                    <Form.Item
                                        label="Employment Type"
                                        name="employment_type"
                                        rules={[{ required: true, message: 'Please select employment type' }]}
                                    >
                                        <Select placeholder="Select type" className="dropdown-input-class">
                                            <Select.Option value="full_time">Full-time</Select.Option>
                                            <Select.Option value="part_time">Part-time</Select.Option>
                                            <Select.Option value="contract">Contract</Select.Option>
                                            <Select.Option value="locum">Locum / Visiting</Select.Option>
                                        </Select>
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={12} lg={8}>
                                    <Form.Item
                                        label="Emergency Contact Name"
                                        name="emergency_contact_name"
                                        rules={[{ required: true, message: 'Emergency contact name is required' }]}
                                    >
                                        <Input placeholder="Full name" className="input-form-layout" />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={12} lg={8}>
                                    <Form.Item
                                        label="Emergency Contact Phone"
                                        name="emergency_contact_phone"
                                        rules={[
                                            { required: true, message: 'Emergency contact phone is required' },
                                            { pattern: /^\d{10}$/, message: 'Enter a valid 10-digit number' },
                                        ]}
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
                                Assign the default shift for rostering, OPD coverage, and ward duty planning.
                            </Text>

                            <Form.Item name="shift" initialValue="general" className="shift-field">
                                <Radio.Group className="shift-wrapper">
                                    <Radio.Button value="general">General Shift</Radio.Button>
                                    <Radio.Button value="morning">Morning Shift</Radio.Button>
                                    <Radio.Button value="evening">Evening Shift</Radio.Button>
                                    <Radio.Button value="night">Night Shift</Radio.Button>
                                    <Radio.Button value="rotational">Rotational</Radio.Button>
                                </Radio.Group>
                            </Form.Item>

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

                                <Col xs={24} sm={12} lg={8}>
                                    <Form.Item label="Weekly Off" name="weekly_off">
                                        <Select placeholder="Select day" className="dropdown-input-class" allowClear>
                                            <Select.Option value="sunday">Sunday</Select.Option>
                                            <Select.Option value="monday">Monday</Select.Option>
                                            <Select.Option value="saturday">Saturday</Select.Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>
                    </Form>

                    <div className="employee-footer">
                        <Button onClick={() => form.resetFields()}>Cancel</Button>

                        <div className="footer-right">
                            <Button onClick={handleSaveDraft}>Save Draft</Button>
                            <Button type="primary" onClick={handleCreateEmployee}>
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
