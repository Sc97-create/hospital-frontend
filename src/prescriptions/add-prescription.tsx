// PrescriptionPage.tsx

import { useEffect, useState } from "react";
import {
    Layout,
    Form,
    Row,
    Col,
    Card,
    Input,
    InputNumber,
    Select,
    Radio,
    Button,
    Typography,
    Space,
    Divider,
    Pagination,
    Breadcrumb,
    AutoComplete,
    message,
    Drawer,
    Popconfirm,
    Grid,
} from "antd";

import {
    MedicineBoxOutlined,
    DeleteOutlined,
    EditOutlined,
    FilePdfOutlined,
    CheckOutlined,
    SearchOutlined,
    CalendarOutlined,
    HomeOutlined,
    PlusOutlined,
} from "@ant-design/icons";

import "./add-prescription.css";
import Sidebar from "../sidebar";
import { StatusTag } from "../components/status-tag";
import { STATUS_INFO } from "../constants/status-colors";
import { Link, useParams, useNavigate } from "react-router-dom";
import type { CreatePrescription, Medicine, medicineResponse, SearchMedicineItem, UpdatePrescriptionStatus } from "./types/prescriptionmodel";
import { CreatePrescriptionApi, FindOnePrescription, SearchMedicines, UpdatePrescription, UpdatePrescriptionItem, UpdateStatus } from "./api/prescription";
import type { DefaultOptionType } from "antd/es/select";

const { Content } = Layout;
const { Text, Title } = Typography;
const { Option } = Select;

interface MedicineOption extends DefaultOptionType {
    medicine: SearchMedicineItem;
}

interface PrescriptionFormValues {
    medicine: string;
    medicine_id: string;
    prescription_item_id?: string;
    morning: string | number;
    afternoon: string | number;
    night: string | number;
    dosage: string;
    duration: string | number;
    duration_type: string;
    food_instruction: string;
    medicine_type: string;
}

function getApiResponseData(error: unknown): unknown {
    if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response
    ) {
        return (error.response as { data: unknown }).data;
    }
    return undefined;
}

function getApiErrorStatus(error: unknown): number | null {
    if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "status" in error.response &&
        typeof (error.response as { status: unknown }).status === "number"
    ) {
        return (error.response as { status: number }).status;
    }
    return null;
}

function getApiErrorMessage(error: unknown): string | null {
    const data = getApiResponseData(error);
    if (typeof data === "string" && data.trim()) {
        return data;
    }
    if (data && typeof data === "object") {
        const record = data as Record<string, unknown>;
        if (typeof record.message === "string" && record.message.trim()) {
            return record.message;
        }
        if (typeof record.error === "string" && record.error.trim()) {
            return record.error;
        }
    }
    if (error instanceof Error) return error.message;
    return null;
}

function isMedicineAlreadyPresentMessage(message: string | null | undefined): boolean {
    return Boolean(message?.toLowerCase().includes("already present in prescription"));
}

function AddPrescription() {
    const params = useParams<{ appointmentID: string }>();
    const navigate = useNavigate();
    const [findonePrescriptionData, setFindOnePrescriptionData] = useState<medicineResponse[]>()
    const [prescriptionID, setPrescriptionID] = useState<string>('')
    const [currentPage, setCurrentPage] = useState(1);
    const [totalMedicines, setTotalMedicines] = useState(0);
    const pageSize = 3;

    const [form] = Form.useForm();
    const [messageApi, messageContextHolder] = message.useMessage();

    const [medicineOptions, setMedicineOptions] = useState<MedicineOption[]>([]);

    const [medicines] = useState<Medicine[]>([]);
    const [created_at, setCreatedAt] = useState<string>();
    const [isSent, setIsSent] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const screens = Grid.useBreakpoint();
    const isMobile = !screens.md;
    const handleUpdateStatus = async (payload: UpdatePrescriptionStatus) => {
        const response = await UpdateStatus(payload);
        if (response.code === "200") {
            setIsSent(true);
            messageApi.success("Status updated successfully!");
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
            const formatted = response.data.map((item: SearchMedicineItem) => ({
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
    const resetMedicineForm = () => {
        form.resetFields();
        setEditingItemId(null);
        setDrawerOpen(false);
    };

    const handleEditMedicine = (item: medicineResponse) => {
        const prescriptionItemId = item.prescription_item_id?.trim();
        if (!prescriptionItemId) {
            messageApi.error("Missing prescription_item_id for this medicine");
            return;
        }

        setEditingItemId(prescriptionItemId);
        form.setFieldsValue({
            medicine: item.medicine_name,
            medicine_id: item.medicine_id,
            prescription_item_id: prescriptionItemId,
            morning: item.frequency?.morning ?? 0,
            afternoon: item.frequency?.afternoon ?? 0,
            night: item.frequency?.night ?? 0,
            dosage: item.medicine_form,
            duration: item.duration_day,
            duration_type: item.duration_type,
            food_instruction: item.food_instruction,
            medicine_type: item.medicine_form,
        });
        if (isMobile) {
            setDrawerOpen(true);
        }
    };

    const handleFinalize = async (values: PrescriptionFormValues) => {
        const prescriptionItemId =
            editingItemId || values.prescription_item_id?.trim() || "";

        try {
            if (prescriptionItemId) {
                const response = await UpdatePrescriptionItem({
                    prescription_item_id: prescriptionItemId,
                    medicine_id: values.medicine_id,
                    duration: Number(values.duration),
                    duration_type: values.duration_type,
                    food_instruction: values.food_instruction,
                    morning: Number(values.morning),
                    afternoon: Number(values.afternoon),
                    night: Number(values.night),
                });
                if (response.code === "200") {
                    messageApi.success("Medicine updated successfully!");
                    if (prescriptionID) {
                        await findonePresc(prescriptionID, currentPage);
                    }
                    resetMedicineForm();
                } else if (isMedicineAlreadyPresentMessage(response.message)) {
                    messageApi.warning(response.message);
                } else {
                    messageApi.error(response.message || "Failed to update medicine");
                }
                return;
            }

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
                appointment_id: params.appointmentID || "",
                organisation_id: localStorage.getItem("organisation_id") || "",
                prescribed_by: localStorage.getItem("user_id") || "",
                medicine_array: updatedMedicines,
                prescription_id: prescriptionID ? prescriptionID : "",
            };

            if (!prescriptionID) {
                const response = await CreatePrescriptionApi(finalPayload);
                if (response.code === "200") {
                    messageApi.success("Prescription updated successfully!");
                    findonePresc(response.data.id, currentPage)
                    setPrescriptionID(response.data.id)
                    resetMedicineForm();
                } else if (isMedicineAlreadyPresentMessage(response.message)) {
                    messageApi.warning(response.message);
                } else {
                    messageApi.error(response.message || "Failed to update prescription");
                }
            } else {
                const response = await UpdatePrescription(finalPayload);
                if (response.code === "200") {
                    messageApi.success("Prescription updated successfully!");
                    findonePresc(response.data.id, currentPage)
                    setPrescriptionID(response.data.id)
                    resetMedicineForm();
                } else if (isMedicineAlreadyPresentMessage(response.message)) {
                    messageApi.warning(response.message);
                } else {
                    messageApi.error(response.message || "Failed to update prescription");
                }
            }
        } catch (err) {
            console.error("API Error:", err);
            const apiMessage = getApiErrorMessage(err);
            const status = getApiErrorStatus(err);
            if (status === 409 || isMedicineAlreadyPresentMessage(apiMessage)) {
                messageApi.warning(apiMessage || "This medicine is already present in the prescription");
                return;
            }
            messageApi.error(
                apiMessage ||
                    (editingItemId ? "Failed to update medicine" : "Failed to update prescription"),
            );
        }
    }

    const medicineForm = (
        <Form
            form={form}
            layout="vertical"
            className="medicine-form"
            onFinish={handleFinalize}
        >
            <Form.Item
                label="Search Medicine"
                name="medicine"
                className="search-medicine-item"
                rules={[{ required: true, message: 'Please search medicine' }]}
                required
            >
                <AutoComplete
                    className="medicine-search"
                    options={medicineOptions}
                    onSearch={searchMedicine}
                    onSelect={(value, option) => {
                        const med = (option as MedicineOption).medicine;
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
                    />
                </AutoComplete>
            </Form.Item>

            <div className="medicine-form-section">
            <Form.Item
                label="Dosage per day"
                className="frequency-section"
            >
                <Row gutter={8} className="frequency-row" wrap={false}>
                    <Col flex="1">
                        <span className="freq-col-label">Morning</span>
                        <Form.Item name="morning" initialValue={1} noStyle>
                            <InputNumber min={0} max={9} controls={false} className="full-width freq-input" aria-label="Morning dose" />
                        </Form.Item>
                    </Col>
                    <Col flex="1">
                        <span className="freq-col-label">Afternoon</span>
                        <Form.Item name="afternoon" initialValue={1} noStyle>
                            <InputNumber min={0} max={9} controls={false} className="full-width freq-input" aria-label="Afternoon dose" />
                        </Form.Item>
                    </Col>
                    <Col flex="1">
                        <span className="freq-col-label">Night</span>
                        <Form.Item name="night" initialValue={1} noStyle>
                            <InputNumber min={0} max={9} controls={false} className="full-width freq-input" aria-label="Night dose" />
                        </Form.Item>
                    </Col>
                </Row>
            </Form.Item>

            <Row gutter={8} className="details-row" wrap={false}>
                <Col flex="1">
                    <Form.Item label="Dosage" name="dosage">
                        <Input
                            readOnly
                            placeholder="Auto-filled"
                            className="read-only-input full-width"
                        />
                    </Form.Item>
                </Col>
                <Col flex="1">
                    <Form.Item label="Medicine Type" name="medicine_type">
                        <Input
                            readOnly
                            placeholder="Auto-filled"
                            className="read-only-input full-width"
                        />
                    </Form.Item>
                </Col>
            </Row>

            </div>

            <Form.Item label="Duration" className="duration-field">
                <Row gutter={8} className="duration-row" wrap={false}>
                    <Col flex="0 0 96px">
                        <Form.Item name="duration" initialValue={1} noStyle>
                            <InputNumber min={1} max={365} controls={false} placeholder="1" className="full-width duration-input" />
                        </Form.Item>
                    </Col>
                    <Col flex="1">
                        <Form.Item name="duration_type" initialValue="Days" noStyle>
                            <Select className="full-width duration-select">
                                <Option value="Days">Days</Option>
                                <Option value="Weeks">Weeks</Option>
                                <Option value="Months">Months</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
            </Form.Item>

            <Divider className="form-divider" />

            <Form.Item
                label="Food Instruction"
                name="food_instruction"
                initialValue="after"
            >
                <Radio.Group className="food-radio">
                    <Radio value="before">Before Food</Radio>
                    <Radio value="after">After Food</Radio>
                    <Radio value="any">Doesn't Matter</Radio>
                </Radio.Group>
            </Form.Item>

            <Form.Item name="medicine_id" hidden>
                <Input />
            </Form.Item>
            <Form.Item name="prescription_item_id" hidden>
                <Input />
            </Form.Item>

            <Button type="primary" size="large" block className="add-btn" htmlType="submit">
                {editingItemId ? "Update Medicine" : "Add Medicine"}
            </Button>
        </Form>
    );

    return (
        <Layout>
            {messageContextHolder}
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
                    {!isMobile && (
                        <div className="prescription-sidebar prescription-sidebar-desktop">
                            <Title level={4} className="sidebar-title">
                                {editingItemId ? "Edit Medicine" : "Add Medicine"}
                            </Title>
                            {medicineForm}
                        </div>
                    )}

                    <Content className="prescription-content">
                        <div className="prescription-content-body">
                        {isMobile && (
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                size="large"
                                className="open-medicine-drawer-btn"
                                onClick={() => {
                                    setEditingItemId(null);
                                    form.resetFields();
                                    setDrawerOpen(true);
                                }}
                            >
                                Add Medicine
                            </Button>
                        )}
                        {/* Header */}
                        <Row justify="space-between" align="middle">
                            <Col>
                                <Space align="center">
                                    <Title level={3} className="preview-title">
                                        Prescription Preview
                                    </Title>

                                    <StatusTag type={STATUS_INFO}>{totalMedicines} Medicines</StatusTag>
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
                            <StatusTag type={STATUS_INFO} className="stats-tag">
                                Total Medicines: {totalMedicines}
                            </StatusTag>
                        </Space>

                        {/* Medicine Cards */}
                        <Space direction="vertical" size={16} className="full-width">
                            {findonePrescriptionData?.map((item) => (
                                <Card key={item.prescription_item_id || item.medicine_id} className="medicine-card">
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
                                                        <StatusTag type={STATUS_INFO} className="dosage-tag">{item.medicine_form}</StatusTag>

                                                        <div className="frequency-badges">
                                                            <span className={`freq-badge ${item.frequency?.morning > 0 ? 'active' : ''}`}>
                                                                M: {item.frequency?.morning ?? 0}
                                                            </span>
                                                            <span className={`freq-badge ${item.frequency?.afternoon > 0 ? 'active' : ''}`}>
                                                                A: {item.frequency?.afternoon ?? 0}
                                                            </span>
                                                            <span className={`freq-badge ${item.frequency?.night > 0 ? 'active' : ''}`}>
                                                                N: {item.frequency?.night ?? 0}
                                                            </span>
                                                        </div>
                                                    </Space>

                                                    <div className="medicine-details">
                                                        <Text type="secondary" className="detail-item">
                                                            <CalendarOutlined /> {item.duration_day + " " + item.duration_type}
                                                        </Text>
                                                        <span className="separator">•</span>
                                                        <Text type="secondary" className="detail-item">
                                                            {item.food_instruction === "any"
                                                                ? "Doesn't matter"
                                                                : `${item.food_instruction} food`}
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
                                                    onClick={() => handleEditMedicine(item)}
                                                >
                                                    Edit
                                                </Button>
                                                <Popconfirm
                                                    title="Remove medicine?"
                                                    description="This medicine will be removed from the prescription."
                                                    okText="Delete"
                                                    okType="danger"
                                                    onConfirm={() => messageApi.warning('Delete medicine API not yet connected')}
                                                >
                                                    <Button
                                                        danger
                                                        type="text"
                                                        icon={<DeleteOutlined />}
                                                        className="action-btn delete-btn"
                                                    >
                                                        Delete
                                                    </Button>
                                                </Popconfirm>
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
                                    onClick={() => handleUpdateStatus({
                                        prescription_id: prescriptionID,
                                        appointment_id: params.appointmentID ? params.appointmentID : "",
                                        status: "sent",
                                    })}
                                    disabled={isSent || !prescriptionID}
                                >
                                    {isSent ? "Prescription Sent" : "Finalize Prescription"}
                                </Button>
                            </Col>
                        </Row>
                    </Content>

                    {isMobile && (
                        <Drawer
                            title={editingItemId ? "Edit Medicine" : "Add Medicine"}
                            placement="bottom"
                            open={drawerOpen}
                            onClose={() => {
                                setDrawerOpen(false);
                                setEditingItemId(null);
                                form.resetFields();
                            }}
                            height="min(90vh, 720px)"
                            className="prescription-medicine-drawer"
                            destroyOnClose={false}
                        >
                            {medicineForm}
                        </Drawer>
                    )}
                </Layout>
            </Layout>
        </Layout >
    );
};

export default AddPrescription;