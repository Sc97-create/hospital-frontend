// PrescriptionPage.tsx

import React, { useEffect, useState } from "react";
import {
    Layout,
    Form,
    Row,
    Col,
    Card,
    Input,
    Select,
    Radio,
    Button,
    Typography,
    Space,
    Tag,
    Pagination,
    Breadcrumb,
    AutoComplete,
    message,
} from "antd";

import {
    MedicineBoxOutlined,
    DeleteOutlined,
    EditOutlined,
    FilePdfOutlined,
    CheckOutlined,
    SearchOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    HomeOutlined,
} from "@ant-design/icons";

import "./add-prescription.css";
import Sidebar from "../sidebar";
import { Header } from "antd/es/layout/layout";
import { Link, useParams, useNavigate } from "react-router-dom";
import type { CreatePrescription, medicineResponse, UpdatePrescriptionStatus } from "./types/prescriptionmodel";
import { CreatePrescriptionApi, FindOnePrescription, SearchMedicines, UpdatePrescription, UpdateStatus } from "./api/prescription";

const { Sider, Content } = Layout;
const { Text, Title } = Typography;
const { Option } = Select;

const medicines = [
    {
        id: 1,
        name: "Dolo 650",
        dosage: "650mg",
        duration: "5 Days",
        food: "After Food",
        type: "Tablet",
        timing: "Morning 1 Afternoon 0 Night 1",
    },
    {
        id: 2,
        name: "Amoxicillin",
        dosage: "500mg",
        duration: "7 Days",
        food: "Before Food",
        type: "Capsule",
        timing: "Morning 1 Afternoon 1 Night 1",
    },
    {
        id: 3,
        name: "B-Complex",
        dosage: "2ml",
        duration: "3 Days",
        food: "Doesn't Matter",
        type: "Injection",
        timing: "Morning 0 Afternoon 0 Night 1",
    },
];

function AddPrescription() {
    const params = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchValue, setSearchValue] = useState('');
    const [findonePrescriptionData, setFindOnePrescriptionData] = useState<medicineResponse[]>()
    const [prescriptionID, setPrescriptionID] = useState<string>('')
    const [currentPage, setCurrentPage] = useState(1);
    const [totalMedicines, setTotalMedicines] = useState(0);
    const pageSize = 3;
    // const [medicineOptions, setMedicineOptions] = useState<any[]>([]);

    const [form] = Form.useForm();

    const [medicineOptions, setMedicineOptions] = useState<any[]>([]);

    const [medicines, setMedicines] = useState<any[]>([]);
    const [created_at, setCreatedAt] = useState<string>();
    const [isSent, setIsSent] = useState(false);
    const handleUpdateStatus = async (payload: UpdatePrescriptionStatus) => {
        const response = await UpdateStatus(payload);
        if (response.code === "200") {
            setIsSent(true);
            message.success("Status updated successfully!");
            setTimeout(() => {
                navigate('/prescription');
            }, 1000);
        }
    }
    const searchMedicine = async (value: string) => {
        if (value.length < 1) {
            setMedicineOptions([]);
            return;
        }
        try {
            const response = await SearchMedicines(value);
            const formatted = response.data.map((item: any) => ({
                value: item.name,
                label: (
                    <div className="medicine-option">
                        <div className="medicine-option-name">{item.name}</div>
                        <div className="medicine-option-generic">{item.generic_name}</div>
                    </div>
                ),
                medicine: item,
            }));
            setMedicineOptions(formatted);
        } catch (err) {
            console.error(err);
        }
    };
    useEffect(() => {
        if (prescriptionID) {
            findonePresc(prescriptionID, currentPage);
        }
    }, [prescriptionID]);
    const findonePresc = async (id: string, page: number = 1) => {
        const offset = (page - 1) * pageSize;
        const findoneesponse = await FindOnePrescription(id, pageSize, offset);
        setFindOnePrescriptionData(findoneesponse.data.medicines);
        setTotalMedicines(findoneesponse.data.total_count);
        setCreatedAt(findoneesponse.data.created_at.toString());
        setCurrentPage(page);
    }
    const handleFinalize = async (values: any) => {
        // 1. Format the new medicine from the current form values
        const newMedicine = {
            medicine_id: values.medicine_id,
            medicine_name: values.medicine,
            morning: Number(values.morning),
            afternoon: Number(values.afternoon),
            night: Number(values.night),
            dosage: values.dosage,
            duration: Number(values.duration),
            duration_type: values.duration_type,
            food_instruction: values.food_instruction,
            medicine_type: values.medicine_type,
        };

        // 2. Prepare the full list (existing medicines + the one we just filled)
        const updatedMedicines = [...medicines, newMedicine];

        const finalPayload: CreatePrescription = {
            patient_id: params.id || "",
            organisation_id: "4c02d9f5-7388-4382-b2c7-aa3fe3852625",
            prescribed_by: "55e59798-a5d2-4c93-86fb-387dd92a0c8c",
            medicine_array: updatedMedicines,
            prescription_id: prescriptionID ? prescriptionID : "",
        };

        try {
            if (!prescriptionID) {
                const response = await CreatePrescriptionApi(finalPayload);
                if (response.code === "200") {
                    message.success("Prescription updated successfully!");
                    // setMedicines(updatedMedicines); // Update the list on the right  
                    findonePresc(response.data.id, currentPage)
                    setPrescriptionID(response.data.id)
                    form.resetFields();
                    // Clear the form for the next entry
                }
            } else {
                const response = await UpdatePrescription(finalPayload);
                if (response.code === "200") {
                    message.success("Prescription updated successfully!");
                    // setMedicines(updatedMedicines); // Update the list on the right  
                    findonePresc(response.data.id, currentPage)
                    setPrescriptionID(response.data.id)
                    form.resetFields();
                    // Clear the form for the next entry
                }
            }
        } catch (err) {
            console.error("API Error:", err);
            message.error("Failed to update prescription");
        }
    }

    return (
        <Layout>
            <Sidebar />
            <Layout>
                <div className="breadcrumb-layout">
                    <Breadcrumb>
                        <Breadcrumb.Item>
                            <HomeOutlined />
                            <Link to={'/prescription'}>Prescription</Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            Add Prescription
                        </Breadcrumb.Item>
                    </Breadcrumb>
                </div>


                <Layout className="prescription-layout">
                    {/* LEFT PANEL - Form */}
                    <Sider width={420} className="prescription-sidebar" breakpoint="lg" collapsedWidth="0" trigger={null}>
                        <Title level={4} className="sidebar-title">
                            Add Medicine
                        </Title>

                        <Form
                            form={form}
                            layout="vertical"
                            className="medicine-form"
                            onFinish={handleFinalize}
                        >
                            <Form.Item
                                label="Search Medicine"
                                name="medicine"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please search medicine',
                                    },
                                ]}
                            >

                                <AutoComplete
                                    className="medicine-search"
                                    options={medicineOptions}
                                    onSearch={searchMedicine}
                                    onSelect={(value, option: any) => {
                                        const med = option.medicine;
                                        form.setFieldsValue({
                                            medicine: value,
                                            medicine_id: med.id,
                                            dosage: med.strength,
                                            medicine_type: med.form,
                                        });
                                    }}
                                >

                                    <Input
                                        prefix={<SearchOutlined />}
                                        placeholder="Search medicine..."
                                        size="large"
                                    />

                                </AutoComplete>

                            </Form.Item>

                            <Form.Item name="medicine_id" hidden>
                                <Input />
                            </Form.Item>



                            {/* Timing */}
                            <Row gutter={12}>
                                <Col span={8}>
                                    <Form.Item
                                        label="Morning"
                                        name="morning"
                                        initialValue={1}
                                    >

                                        <Input
                                            className="full-width"
                                            size="large"
                                            min={0}
                                        />

                                    </Form.Item>
                                </Col>

                                <Col span={8}>
                                    <Form.Item
                                        label="Afternoon"
                                        name="afternoon"
                                        initialValue={1}
                                    >

                                        <Input
                                            className="full-width"
                                            size="large"
                                            min={0}
                                        />

                                    </Form.Item>
                                </Col>

                                <Col span={8}>
                                    <Form.Item
                                        label="Night"
                                        name="night"
                                        initialValue={1}
                                    >

                                        <Input
                                            className="full-width"
                                            size="large"
                                            min={0}
                                        />

                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={12}>
                                <Col span={12}>
                                    <Form.Item
                                        label="Dosage"
                                        name="dosage"
                                    >
                                        <Input
                                            readOnly
                                            placeholder="Dosage"
                                            size="large"
                                            className="read-only-input"
                                        />
                                    </Form.Item>
                                </Col>

                                <Col span={12}>
                                    <Form.Item
                                        label="Medicine Type"
                                        name="medicine_type"
                                    >
                                        <Input
                                            readOnly
                                            placeholder="Type"
                                            size="large"
                                            className="read-only-input"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            {/* Duration */}

                            <Row gutter={12}>
                                <Col span={12}>
                                    <Form.Item
                                        label="Duration"
                                        name="duration"
                                        initialValue={1}
                                    >
                                        <Input
                                            placeholder="5"
                                            size="large"
                                            className="top-spacing"
                                        />
                                    </Form.Item>
                                </Col>

                                <Col span={12}>
                                    <Form.Item
                                        label="Day"
                                        name="duration_type"
                                        initialValue="Days"
                                    >
                                        <Select
                                            defaultValue="Days"
                                            size="large"
                                            className="full-width top-spacing"
                                        >
                                            <Option value="Days">Days</Option>
                                            <Option value="Weeks">Weekly</Option>
                                            <Option value="Months">Monthly</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>


                            <Form.Item
                                label="Food Instruction"
                                name="food_instruction"
                                initialValue="after"
                            >
                                <Radio.Group className="food-radio">
                                    <Space>
                                        <Radio value="before">Before Food</Radio>
                                        <Radio value="after">After Food</Radio>
                                        <Radio value="any">Doesn't Matter</Radio>
                                    </Space>
                                </Radio.Group>
                            </Form.Item>

                            {/* Add Button */}
                            <Button type="primary" size="large" block className="add-btn" htmlType="submit">
                                Add Medicine
                            </Button>
                        </Form>
                    </Sider>

                    {/* RIGHT PANEL */}
                    <Content className="prescription-content">
                        {/* Header */}
                        <Row justify="space-between" align="middle">
                            <Col>
                                <Space align="center">
                                    <Title level={3} className="preview-title">
                                        Prescription Preview
                                    </Title>

                                    <Tag color="blue">{totalMedicines} Medicines</Tag>
                                </Space>
                            </Col>

                            <Col>
                                <Space>
                                    <CalendarOutlined />
                                    <Text>{created_at ? new Date(created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    }) : '---'}</Text>
                                </Space>
                            </Col>
                        </Row>

                        {/* Stats */}
                        <Space size={16} className="stats-wrapper">
                            <Tag className="stats-tag">Total Medicines: {totalMedicines}</Tag>
                        </Space>

                        {/* Medicine Cards */}
                        <Space direction="vertical" size={16} className="full-width">
                            {findonePrescriptionData?.map((item) => (
                                <Card key={item.medicine_id} className="medicine-card">
                                    <Row justify="space-between" align="middle">
                                        <Col flex="auto">
                                            <Space align="start">
                                                <div className="medicine-icon-wrapper">
                                                    <MedicineBoxOutlined className="medicine-icon" />
                                                </div>

                                                <div className="medicine-info">
                                                    <Title level={5} className="medicine-title">
                                                        {item.medicine_name}
                                                    </Title>

                                                    <Space size={12} className="medicine-meta">
                                                        <Tag color="blue" className="dosage-tag">{item.dosage}</Tag>

                                                        <div className="frequency-badges">
                                                            <span className={`freq-badge ${item.frequency.morning > 0 ? 'active' : ''}`}>
                                                                M: {item.frequency.morning}
                                                            </span>
                                                            <span className={`freq-badge ${item.frequency.afternoon > 0 ? 'active' : ''}`}>
                                                                A: {item.frequency.afternoon}
                                                            </span>
                                                            <span className={`freq-badge ${item.frequency.night > 0 ? 'active' : ''}`}>
                                                                N: {item.frequency.night}
                                                            </span>
                                                        </div>
                                                    </Space>

                                                    <div className="medicine-details">
                                                        <Text type="secondary" className="detail-item">
                                                            <CalendarOutlined /> {item.duration_day + " " + item.duration_type}
                                                        </Text>
                                                        <span className="separator">•</span>
                                                        <Text type="secondary" className="detail-item">
                                                            {item.food_instruction} food
                                                        </Text>
                                                        <span className="separator">•</span>
                                                        <Text type="secondary" className="detail-item">
                                                            {item.medicine_type}
                                                        </Text>
                                                    </div>
                                                </div>
                                            </Space>
                                        </Col>

                                        <Col>
                                            <Space size={0} className="medicine-actions">
                                                <Button
                                                    type="text"
                                                    icon={<EditOutlined />}
                                                    className="action-btn edit-btn"
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    danger
                                                    type="text"
                                                    icon={<DeleteOutlined />}
                                                    className="action-btn delete-btn"
                                                >
                                                    Delete
                                                </Button>
                                            </Space>
                                        </Col>
                                    </Row>
                                </Card>
                            ))}
                        </Space>

                        {/* Pagination */}
                        <div className="pagination-wrapper">
                            <Pagination
                                current={currentPage}
                                total={totalMedicines}
                                pageSize={pageSize}
                                onChange={(page) => findonePresc(prescriptionID, page)}
                                showSizeChanger={false}
                                hideOnSinglePage
                            />
                        </div>



                        {/* Footer Buttons */}
                        <Row justify="end" gutter={8} className="footer-actions">
                            <Col>
                                <Button
                                    icon={<FilePdfOutlined />}
                                    size="large"
                                    className="pdf-btn"
                                >
                                    Generate PDF Preview
                                </Button>
                            </Col>

                            <Col>
                                <Button
                                    type="primary"
                                    icon={<CheckOutlined />}
                                    className="finalize-btn"
                                    onClick={() => handleUpdateStatus({ prescription_id: prescriptionID })}
                                    disabled={isSent || !prescriptionID}
                                >
                                    {isSent ? "Prescription Sent" : "Finalize Prescription"}
                                </Button>
                            </Col>
                        </Row>
                    </Content>
                </Layout>
            </Layout>
        </Layout >
    );
};

export default AddPrescription;