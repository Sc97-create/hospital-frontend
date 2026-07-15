import {
    Breadcrumb,
    Button,
    Card,
    Col,
    Form,
    Input,
    InputNumber,
    Layout,
    message,
    Row,
    Select,
} from "antd";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./add-manual-form.css";
import Sidebar from "../sidebar";
import Header from "../header";
import { CreateSupplier } from "./api/supplier";
import type { CreateSupplierPayload } from "./types/supplier";

interface SupplierFormValues {
    name: string;
    contact_number: string;
    email_id: string;
    payment_terms: string;
    supplier_status: string;
    gst_number: string;
    drug_license_number: string;
    credit_limit: number;
}

function AddManualForm() {
    const [form] = Form.useForm<SupplierFormValues>();
    const [submitting, setSubmitting] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const navigate = useNavigate();

    const onFinish = async (values: SupplierFormValues) => {
        const organisation_id = localStorage.getItem("organisation_id") || "";
        const user_id = localStorage.getItem("user_id") || "";

        if (!organisation_id || !user_id) {
            messageApi.error("Missing organisation or user — please log in again");
            return;
        }

        const payload: CreateSupplierPayload = {
            name: values.name.trim(),
            contact_number: values.contact_number.trim(),
            email_id: values.email_id.trim(),
            payment_terms: values.payment_terms,
            supplier_status: values.supplier_status,
            gst_number: values.gst_number.trim(),
            drug_license_number: values.drug_license_number.trim(),
            credit_limit: Number(values.credit_limit) || 0,
            organisation_id,
            user_id,
        };

        setSubmitting(true);
        try {
            const response = await CreateSupplier(payload);
            const code = response.code != null ? String(response.code) : "200";
            if (code !== "200") {
                throw new Error(response.message || "Failed to create supplier");
            }
            messageApi.success(response.message || "Supplier created");
            navigate("/suppliers");
        } catch (error) {
            console.error("Create supplier failed:", error);
            const apiMessage =
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
                    ? error.response.data.message
                    : error instanceof Error
                      ? error.message
                      : null;
            messageApi.error(apiMessage || "Failed to create supplier. Try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Layout>
            {contextHolder}
            <Sidebar />
            <Layout>
                <Header />
                <div className="breadcrumb-layout">
                    <Breadcrumb>
                        <Breadcrumb.Item>
                            <Link to="/suppliers">Suppliers</Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>Add Supplier</Breadcrumb.Item>
                    </Breadcrumb>
                </div>
                <div className="add-supplier-container">
                    <Card className="supplier-card" bordered={false}>
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                            className="supplier-form"
                            initialValues={{ supplier_status: "Active" }}
                        >
                            <Form.Item
                                label="Supplier Name"
                                name="name"
                                rules={[{ required: true, message: "Please enter supplier name" }]}
                            >
                                <Input placeholder="e.g. PharmaCorp Global" />
                            </Form.Item>

                            <Row gutter={[16, 0]}>
                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        label="Email"
                                        name="email_id"
                                        rules={[
                                            { required: true, message: "Please enter email" },
                                            { type: "email", message: "Enter a valid email" },
                                        ]}
                                    >
                                        <Input placeholder="contact@supplier.com" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        label="Contact Number"
                                        name="contact_number"
                                        rules={[
                                            { required: true, message: "Please enter contact number" },
                                        ]}
                                    >
                                        <Input placeholder="9876543210" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={[16, 0]}>
                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        label="GST Number"
                                        name="gst_number"
                                        rules={[
                                            { required: true, message: "Please enter GST number" },
                                        ]}
                                    >
                                        <Input placeholder="GSTIN" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        label="Drug License Number"
                                        name="drug_license_number"
                                        rules={[
                                            {
                                                required: true,
                                                message: "Please enter drug license number",
                                            },
                                        ]}
                                    >
                                        <Input placeholder="Drug license no." />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={[16, 0]}>
                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        label="Payment Terms"
                                        name="payment_terms"
                                        rules={[
                                            {
                                                required: true,
                                                message: "Please select payment terms",
                                            },
                                        ]}
                                    >
                                        <Select
                                            placeholder="Select payment terms"
                                            options={[
                                                { value: "Cash", label: "Cash" },
                                                { value: "15days", label: "15days" },
                                                { value: "30days", label: "30days" },
                                                { value: "45days", label: "45days" },
                                            ]}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        label="Credit Limit"
                                        name="credit_limit"
                                        rules={[
                                            {
                                                required: true,
                                                message: "Please enter credit limit",
                                            },
                                        ]}
                                    >
                                        <InputNumber
                                            className="supplier-credit-input"
                                            min={0}
                                            precision={0}
                                            placeholder="10000"
                                            style={{ width: "100%" }}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                label="Status"
                                name="supplier_status"
                                rules={[{ required: true, message: "Please select status" }]}
                            >
                                <Select
                                    options={[
                                        { value: "Active", label: "Active" },
                                        { value: "Inactive", label: "Inactive" },
                                    ]}
                                />
                            </Form.Item>

                            <div className="form-actions">
                                <Button
                                    className="cancel-btn"
                                    disabled={submitting}
                                    onClick={() => navigate("/suppliers")}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    className="submit-btn"
                                    loading={submitting}
                                >
                                    Save
                                </Button>
                            </div>
                        </Form>
                    </Card>
                </div>
            </Layout>
        </Layout>
    );
}

export default AddManualForm;
