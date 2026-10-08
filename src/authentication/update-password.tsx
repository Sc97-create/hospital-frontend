import { Breadcrumb, Button, Card, Form, Input, Layout, message, Typography } from "antd";
import { HomeOutlined, LockOutlined } from "@ant-design/icons";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Content } from "antd/es/layout/layout";

import Sidebar from "../sidebar";
import { UpdatePassword } from "./api/login-api";
import type { UpdatePasswordPayload } from "./types/auth";
import "./update-password.css";

const { Title, Text } = Typography;

function getApiErrorMessage(error: unknown, fallback: string): string {
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

function UpdatePasswordPage() {
    const [form] = Form.useForm<UpdatePasswordPayload>();
    const [messageApi, contextHolder] = message.useMessage();
    const [submitting, setSubmitting] = useState(false);

    const onFinish = async (values: UpdatePasswordPayload) => {
        setSubmitting(true);
        try {
            const response = await UpdatePassword({
                password: values.password,
                confirm_password: values.confirm_password,
            });
            const code = response.code != null ? String(response.code) : "200";
            if (code !== "200") {
                throw new Error(response.message || "Failed to update password");
            }
            messageApi.success(response.message || "Password updated successfully");
            form.resetFields();
        } catch (error) {
            if (error && typeof error === "object" && "errorFields" in error) {
                return;
            }
            console.error("Update password failed:", error);
            messageApi.error(getApiErrorMessage(error, "Failed to update password. Try again."));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Layout>
            {contextHolder}
            <Sidebar />
            <Layout>
                <Breadcrumb
                    className="update-password-breadcrumb"
                    items={[
                        { href: "/dashboard", title: <HomeOutlined /> },
                        { title: <Link to="/dashboard">Home</Link> },
                        { title: "Update Password" },
                    ]}
                />
                <Content className="update-password-content">
                    <Title level={3}>Update Password</Title>
                    <Text type="secondary">
                        Choose a new password for your account. You must be signed in to change it.
                    </Text>

                    <Card className="update-password-card">
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                            autoComplete="off"
                            requiredMark={false}
                        >
                            <Form.Item
                                label="New Password"
                                name="password"
                                rules={[
                                    { required: true, message: "Please enter a new password" },
                                    { min: 8, message: "Password must be at least 8 characters" },
                                ]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined />}
                                    placeholder="New password"
                                    autoComplete="new-password"
                                    size="large"
                                />
                            </Form.Item>

                            <Form.Item
                                label="Confirm Password"
                                name="confirm_password"
                                dependencies={["password"]}
                                rules={[
                                    { required: true, message: "Please confirm your password" },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue("password") === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error("Passwords do not match"));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined />}
                                    placeholder="Re-enter password"
                                    autoComplete="new-password"
                                    size="large"
                                />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" loading={submitting} size="large">
                                    Update Password
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Content>
            </Layout>
        </Layout>
    );
}

export default UpdatePasswordPage;
