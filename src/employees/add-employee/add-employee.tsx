import {
    Avatar,
    Badge,
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
    Tag,
    TimePicker,
    Typography,
    Upload,
} from 'antd';

import {
    CameraOutlined,
    HomeOutlined,
    MailOutlined,
    PhoneOutlined,
    PlusOutlined,
    TeamOutlined,
    UserOutlined,
} from '@ant-design/icons';

import './add-employee.css';
import Sidebar from '../../sidebar';
import { Link } from 'react-router-dom';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

function AddEmployee() {

    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();

    const handleSaveDraft = async () => {
        const values = form.getFieldsValue();
        if (!values.name && !values.email) {
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
            <Layout className='employee-layout'>

                <Content className='employee-content'>

                    {/* HEADER */}

                    <div className='employee-header'>

                        <div>

                            <Breadcrumb>

                                <Breadcrumb.Item href='/dashboard'>
                                    <HomeOutlined />
                                </Breadcrumb.Item>

                                <Breadcrumb.Item>
                                    <Link to="/employees">Staff Management</Link>
                                </Breadcrumb.Item>

                                <Breadcrumb.Item>
                                    Add Employee
                                </Breadcrumb.Item>

                            </Breadcrumb>

                            <div className='employee-title-row'>

                                <Title level={2} className='employee-title'>
                                    Add Employee
                                </Title>

                                <Tag color='default'>
                                    Draft
                                </Tag>

                            </div>

                        </div>

                    </div>

                    <Form
                        form={form}
                        layout='vertical'
                    >

                        <Row gutter={[20, 20]}>

                            {/* LEFT */}

                            <Col xs={24} lg={16}>

                                {/* PERSONAL INFO */}

                                <Card
                                    className='employee-card'
                                    title='Personal Information'
                                >

                                    <Row gutter={[20, 20]}>

                                        {/* PROFILE */}

                                        <Col xs={24} sm={8} md={6} lg={6}>

                                            <div className='upload-section'>

                                                <Upload
                                                    showUploadList={false}
                                                >

                                                    <div className='upload-box'>

                                                        <CameraOutlined className='upload-icon' />

                                                    </div>

                                                </Upload>

                                                <Text className='upload-text'>
                                                    JPG or PNG, max 2MB
                                                </Text>

                                            </div>

                                        </Col>

                                        {/* FORM */}

                                        <Col xs={24} sm={16} md={18} lg={18}>

                                            <Row gutter={14}>

                                                <Col xs={24} sm={12}>

                                                    <Form.Item
                                                        label='First Name'
                                                        name='first_name'
                                                        rules={[{ required: true, message: 'First name is required' }]}
                                                    >

                                                        <Input
                                                            placeholder='e.g. John'
                                                            className='input-form-layout'
                                                        />

                                                    </Form.Item>

                                                </Col>

                                                <Col xs={24} sm={12}>

                                                    <Form.Item
                                                        label='Last Name'
                                                        name='last_name'
                                                        rules={[{ required: true, message: 'Last name is required' }]}
                                                    >

                                                        <Input
                                                            placeholder='e.g. Doe'
                                                            className='input-form-layout'
                                                        />

                                                    </Form.Item>

                                                </Col>

                                                <Col xs={24} sm={12}>

                                                    <Form.Item
                                                        label='Gender'
                                                        name='gender'
                                                        rules={[{ required: true, message: 'Please select a gender' }]}
                                                    >

                                                        <Select
                                                            placeholder='Select Gender'
                                                            className='dropdown-input-class'
                                                        >

                                                            <Select.Option value='male'>
                                                                Male
                                                            </Select.Option>

                                                            <Select.Option value='female'>
                                                                Female
                                                            </Select.Option>

                                                        </Select>

                                                    </Form.Item>

                                                </Col>

                                                <Col xs={24} sm={12}>

                                                    <Form.Item
                                                        label='Date of Birth'
                                                        name='dob'
                                                        rules={[{ required: true, message: 'Date of birth is required' }]}
                                                    >

                                                        <DatePicker
                                                            className='date-picker-layout'
                                                        />

                                                    </Form.Item>

                                                </Col>

                                                <Col xs={24} sm={12}>

                                                    <Form.Item
                                                        label='Mobile Number'
                                                        name='mobile'
                                                        rules={[
                                                            { required: true, message: 'Mobile number is required' },
                                                            { pattern: /^\d{10}$/, message: 'Enter a valid 10-digit number' },
                                                        ]}
                                                    >

                                                        <Input
                                                            prefix={<PhoneOutlined />}
                                                            className='input-form-layout'
                                                            maxLength={10}
                                                        />

                                                    </Form.Item>

                                                </Col>

                                                <Col xs={24} sm={12}>

                                                    <Form.Item
                                                        label='Email Address'
                                                        name='email'
                                                        rules={[
                                                            { required: true, message: 'Email address is required' },
                                                            { type: 'email', message: 'Enter a valid email address' },
                                                        ]}
                                                    >

                                                        <Input
                                                            prefix={<MailOutlined />}
                                                            className='input-form-layout'
                                                        />

                                                    </Form.Item>

                                                </Col>

                                                <Col span={24}>

                                                    <Form.Item
                                                        label='Address'
                                                        name='address'
                                                        rules={[{ required: true, message: 'Address is required' }]}
                                                    >

                                                        <TextArea
                                                            rows={3}
                                                            className='text-area-layout'
                                                        />

                                                    </Form.Item>

                                                </Col>

                                            </Row>

                                        </Col>

                                    </Row>

                                </Card>

                                {/* EMPLOYEE INFO */}

                                <Card
                                    className='employee-card top-space'
                                    title='Employee Information'
                                >

                                    <Row gutter={16}>

                                        <Col xs={24} sm={12}>

                                            <Form.Item
                                                label='Auto-generated ID'
                                            >

                                                <Input
                                                    value='HMS-2024-001'
                                                    disabled
                                                    className='input-form-layout'
                                                />

                                            </Form.Item>

                                        </Col>

                                        <Col xs={24} sm={12}>

                                            <Form.Item
                                                label='Department'
                                                name='department'
                                                rules={[{ required: true, message: 'Please select a department' }]}
                                            >

                                                <Select className='dropdown-input-class' placeholder='Select department'>

                                                    <Select.Option value='cardiology'>
                                                        Cardiology
                                                    </Select.Option>

                                                    <Select.Option value='pharmacy'>
                                                        Pharmacy
                                                    </Select.Option>

                                                    <Select.Option value='reception'>
                                                        Reception
                                                    </Select.Option>

                                                </Select>

                                            </Form.Item>

                                        </Col>

                                    </Row>

                                    {/* ROLE */}

                                    <div className='role-section'>

                                        <Text className='role-title'>
                                            Role Selection
                                        </Text>

                                        <div className='role-grid'>

                                            <div className='role-card active-role'>
                                                <UserOutlined />
                                                <span>Doctor</span>
                                            </div>

                                            <div className='role-card'>
                                                <TeamOutlined />
                                                <span>Nurse</span>
                                            </div>

                                            <div className='role-card'>
                                                <PlusOutlined />
                                                <span>Pharmacist</span>
                                            </div>

                                            <div className='role-card'>
                                                <UserOutlined />
                                                <span>Receptionist</span>
                                            </div>

                                            <div className='role-card'>
                                                <TeamOutlined />
                                                <span>Attendant</span>
                                            </div>

                                            <div className='role-card'>
                                                <UserOutlined />
                                                <span>Admin</span>
                                            </div>

                                        </div>

                                    </div>

                                </Card>

                                {/* SHIFT */}

                                <Card
                                    className='employee-card top-space'
                                    title='Shift Assignment'
                                >

                                    <div className='shift-wrapper'>

                                        <Radio.Group defaultValue='general'>

                                            <Radio.Button value='general'>
                                                General Shift
                                            </Radio.Button>

                                            <Radio.Button value='morning'>
                                                Morning Shift
                                            </Radio.Button>

                                            <Radio.Button value='evening'>
                                                Evening Shift
                                            </Radio.Button>

                                            <Radio.Button value='night'>
                                                Night Shift
                                            </Radio.Button>

                                            <Radio.Button value='rotational'>
                                                Rotational
                                            </Radio.Button>

                                        </Radio.Group>

                                    </div>

                                    <Row gutter={16} className='top-space'>

                                        <Col xs={24} sm={12}>

                                            <Form.Item
                                                label='Start Time'
                                                name='start_time'
                                            >

                                                <TimePicker
                                                    className='time-picker-layout'
                                                />

                                            </Form.Item>

                                        </Col>

                                        <Col xs={24} sm={12}>

                                            <Form.Item
                                                label='End Time'
                                                name='end_time'
                                            >

                                                <TimePicker
                                                    className='time-picker-layout'
                                                />

                                            </Form.Item>

                                        </Col>

                                    </Row>

                                </Card>

                            </Col>

                            {/* RIGHT */}

                            <Col xs={24} lg={8}>

                                <Card className='preview-card'>

                                    <div className='preview-top'>

                                        <Badge status='success' text='Active' />

                                    </div>

                                    <div className='preview-profile'>

                                        <Avatar
                                            size={90}
                                            src='https://i.pravatar.cc/150'
                                        />

                                        <Text className='preview-id'>
                                            HMS-2024-001
                                        </Text>

                                        <Title level={4}>
                                            Dr. John Doe
                                        </Title>

                                        <Tag color='blue'>
                                            Doctor
                                        </Tag>

                                    </div>

                                    <div className='preview-section'>

                                        <Text strong>
                                            Shift Summary
                                        </Text>

                                        <p>
                                            General Shift (09:00 - 17:00)
                                        </p>

                                    </div>

                                    <div className='preview-section'>

                                        <Text strong>
                                            System Permissions
                                        </Text>

                                        <ul className='permission-list'>

                                            <li>Patient Records</li>

                                            <li>Prescription Access</li>

                                            <li>Billing Access</li>

                                            <li>Inventory Management</li>

                                        </ul>

                                    </div>

                                </Card>

                            </Col>

                        </Row>

                    </Form>

                    {/* FOOTER */}

                    <div className='employee-footer'>

                        <Button onClick={() => form.resetFields()}>
                            Cancel
                        </Button>

                        <div className='footer-right'>

                            <Button onClick={handleSaveDraft}>
                                Save Draft
                            </Button>

                            <Button type='primary' onClick={handleCreateEmployee}>
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

