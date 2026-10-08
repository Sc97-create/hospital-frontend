import "./Login.css";
import "./forgot-password.css";
import { Button, Form, Input, message } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useState } from "react";

import { RequestPasswordReset } from "./api/login-api";
import type { ForgotPasswordRequestPayload } from "./types/auth";

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

function ForgotPasswordPage() {
    const [form] = Form.useForm<ForgotPasswordRequestPayload>();
    const [messageApi, contextHolder] = message.useMessage();
    const [submitting, setSubmitting] = useState(false);

    const onFinish = async (values: ForgotPasswordRequestPayload) => {
        setSubmitting(true);
        try {
            const response = await RequestPasswordReset({
                email_id: values.email_id.trim(),
            });
            const code = response.code != null ? String(response.code) : "200";
            if (code !== "200") {
                throw new Error(response.message || "Failed to send reset email");
            }
            messageApi.success(response.message || "Reset email sent. Please check your inbox.");
            form.resetFields();
        } catch (error) {
            if (error && typeof error === "object" && "errorFields" in error) {
                return;
            }
            messageApi.error(getApiErrorMessage(error, "Failed to send reset email. Try again."));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="login-page">
            {contextHolder}
            <aside className="login-brand">
                <div className="login-brand-logo">
                    <img
                        src="/sample-icon.ico"
                        alt=""
                        className="login-brand-logo-mark"
                    />
                    <span className="login-brand-logo-name">Hospital Management System</span>
                </div>
                <div className="login-brand-content">
                    <h1 className="login-brand-headline">Reset your access</h1>
                    <p className="login-brand-support">
                        Enter the email on your account and we will send a password reset link.
                    </p>
                </div>
            </aside>

            <main className="login-form-panel">
                <div className="login-form-shell">
                    <header className="login-form-header">
                        <h2 className="login-form-title">Forgot password</h2>
                        <p className="login-form-subtitle">
                            We will email a reset link if this address belongs to a user.
                        </p>
                    </header>

                    <Form
                        name="forgot-password"
                        layout="vertical"
                        onFinish={onFinish}
                        className="login-form"
                        autoComplete="on"
                        form={form}
                        requiredMark={false}
                    >
                        <Form.Item
                            label="Email"
                            name="email_id"
                            rules={[
                                { required: true, message: "Please enter your email" },
                                { type: "email", message: "Please enter a valid email" },
                            ]}
                        >
                            <Input
                                prefix={<MailOutlined />}
                                placeholder="your work email"
                                allowClear
                                autoComplete="email"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item className="login-submit-item">
                            <Button
                                htmlType="submit"
                                type="primary"
                                className="login-submit-button"
                                block
                                size="large"
                                loading={submitting}
                            >
                                Send reset email
                            </Button>
                        </Form.Item>

                        <Form.Item className="login-links-item">
                            <div className="auth-links">
                                <Link to="/login">Back to Sign in</Link>
                            </div>
                        </Form.Item>
                    </Form>
                </div>
            </main>
        </div>
    );
}

export default ForgotPasswordPage;
