import {
    Breadcrumb,
    Button,
    Card,
    Col,
    Form,
    Input,
    Layout,
    Row,
    Typography,
    message,
} from "antd";
import { EnvironmentOutlined, HomeOutlined } from "@ant-design/icons";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../sidebar";
import { CreateDiagnosticCentre } from "./api/diagnostic-center";
import type { CreateDiagnosticCentrePayload } from "./types/diagnostic-center";
import "./add-diagnostic-center.css";

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

interface DiagnosticCentreFormValues {
    name: string;
    address: string;
    email: string;
    contact_number: string;
}

function extractApiErrorMessage(error: unknown, fallback: string): string {
    if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string"
    ) {
        return error.response.data.message;
    }
    if (error instanceof Error && error.message) {
        return error.message;
    }
    return fallback;
}

function AddDiagnosticCenter() {
    const [form] = Form.useForm<DiagnosticCentreFormValues>();
    const [submitting, setSubmitting] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const navigate = useNavigate();

    const onFinish = async (values: DiagnosticCentreFormValues) => {
        const organisation_id = localStorage.getItem("organisation_id") || "";
        if (!organisation_id) {
            messageApi.error("Missing organisation — please log in again");
            return;
        }

        const payload: CreateDiagnosticCentrePayload = {
            organisation_id,
            name: values.name.trim(),
            address: values.address.trim(),
            email: values.email.trim(),
            contact_number: values.contact_number.trim(),
        };

        setSubmitting(true);
        try {
            const response = await CreateDiagnosticCentre(payload);
            const code = response.code != null ? String(response.code) : "200";
            if (code !== "200") {
                throw new Error(response.message || "Failed to create diagnostic centre");
            }
            messageApi.success(response.message || "Diagnostic centre created");
            navigate("/lab/diagnostic-center");
        } catch (error) {
            console.error("Create diagnostic centre failed:", error);
            messageApi.error(
                extractApiErrorMessage(error, "Failed to create diagnostic centre. Try again."),
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Layout className="diagnostic-add-layout">
            {contextHolder}
            <Sidebar />
            <Layout>
                <Breadcrumb
                    className="diagnostic-add-breadcrumb"
                    items={[
                        {
                            href: "/dashboard",
                            title: <HomeOutlined />,
                        },
                        {
                            title: (
                                <Link to="/lab/diagnostic-center">
                                    <EnvironmentOutlined />
                                    <span>Diagnostic Center</span>
                                </Link>
                            ),
                        },
                        {
                            title: "Add Diagnostic Centre",
                        },
                    ]}
                />

                <Content className="diagnostic-add-content">
                    <div className="diagnostic-add-header">
                        <Title level={3} className="diagnostic-add-title">
                            Add Diagnostic Centre
                        </Title>
                        <Text className="diagnostic-add-subtitle">
                            Create a diagnostic centre for lab order assignment.
                        </Text>
                    </div>

                    <Card className="diagnostic-add-card" bordered={false}>
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                            className="diagnostic-add-form"
                            requiredMark="optional"
                        >
                            <Form.Item
                                label="Name"
                                name="name"
                                rules={[
                                    { required: true, message: "Please enter diagnostic centre name" },
                                ]}
                            >
                                <Input
                                    className="diagnostic-add-input"
                                    placeholder="e.g. City Pathology Lab"
                                    maxLength={120}
                                />
                            </Form.Item>

                            <Form.Item
                                label="Address"
                                name="address"
                                rules={[{ required: true, message: "Please enter address" }]}
                            >
                                <TextArea
                                    className="diagnostic-add-input"
                                    placeholder="Street, area, city, pincode"
                                    rows={3}
                                    maxLength={300}
                                />
                            </Form.Item>

                            <Row gutter={[16, 0]}>
                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        label="Email"
                                        name="email"
                                        rules={[
                                            { required: true, message: "Please enter email" },
                                            { type: "email", message: "Enter a valid email" },
                                        ]}
                                    >
                                        <Input
                                            className="diagnostic-add-input"
                                            placeholder="lab@example.com"
                                            maxLength={120}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        label="Contact Number"
                                        name="contact_number"
                                        rules={[
                                            {
                                                required: true,
                                                message: "Please enter contact number",
                                            },
                                            {
                                                pattern: /^[0-9+\-\s()]{7,20}$/,
                                                message: "Enter a valid contact number",
                                            },
                                        ]}
                                    >
                                        <Input
                                            className="diagnostic-add-input"
                                            placeholder="9876543210"
                                            maxLength={20}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <div className="diagnostic-add-actions">
                                <Button
                                    disabled={submitting}
                                    onClick={() => navigate("/lab/diagnostic-center")}
                                >
                                    Cancel
                                </Button>
                                <Button type="primary" htmlType="submit" loading={submitting}>
                                    Create Diagnostic Centre
                                </Button>
                            </div>
                        </Form>
                    </Card>
                </Content>
            </Layout>
        </Layout>
    );
}

export default AddDiagnosticCenter;
