import "./Login.css";
import "./forgot-password.css";
import { Alert, Button, Form, Input, message } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";

import { UpdatePassword } from "./api/login-api";
import type { UpdatePasswordPayload } from "./types/auth";

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

function ResetPasswordPage() {
    const [form] = Form.useForm<UpdatePasswordPayload>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();
    const [submitting, setSubmitting] = useState(false);

    const token = searchParams.get("token") ?? "";
    const hasToken = Boolean(token);

    const onFinish = async (values: UpdatePasswordPayload) => {
        if (!token) {
            messageApi.error("Invalid or missing reset link.");
            return;
        }

        setSubmitting(true);
        try {
            const response = await UpdatePassword({
                password: values.password,
                confirm_password: values.confirm_password,
                token,
            });
            const code = response.code != null ? String(response.code) : "200";
            if (code !== "200") {
                throw new Error(response.message || "Failed to reset password");
            }
            messageApi.success(response.message || "Password updated successfully");
            form.resetFields();
            navigate("/login", { replace: true });
        } catch (error) {
            if (error && typeof error === "object" && "errorFields" in error) {
                return;
            }
            messageApi.error(getApiErrorMessage(error, "Failed to reset password. Try again."));
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
                    <h1 className="login-brand-headline">Choose a new password</h1>
                    <p className="login-brand-support">
                        Set a new password for your account to finish the reset.
                    </p>
                </div>
            </aside>

            <main className="login-form-panel">
                <div className="login-form-shell">
                    <header className="login-form-header">
                        <h2 className="login-form-title">Reset password</h2>
                        <p className="login-form-subtitle">
                            Enter a new password to finish the reset.
                        </p>
                    </header>

                    {!hasToken && (
                        <Alert
                            className="forgot-password-mock-hint"
                            type="error"
                            showIcon
                            message="Missing reset token"
                            description={
                                <>
                                    Open this page from the reset email link, or request a new link
                                    from <Link to="/forgot-password">Forgot password</Link>.
                                </>
                            }
                        />
                    )}

                    <Form
                        name="reset-password"
                        layout="vertical"
                        onFinish={onFinish}
                        className="login-form"
                        autoComplete="off"
                        form={form}
                        requiredMark={false}
                        disabled={!hasToken}
                    >
                        <Form.Item
                            label="New password"
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
                            label="Confirm new password"
                            name="confirm_password"
                            dependencies={["password"]}
                            rules={[
                                { required: true, message: "Please confirm your new password" },
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
                                placeholder="Re-enter new password"
                                autoComplete="new-password"
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
                                disabled={!hasToken}
                            >
                                Update password
                            </Button>
                        </Form.Item>

                        <Form.Item className="login-links-item">
                            <div className="auth-links">
                                <Link to="/login">Back to Sign in</Link>
                                <Link to="/forgot-password">Request new link</Link>
                            </div>
                        </Form.Item>
                    </Form>
                </div>
            </main>
        </div>
    );
}

export default ResetPasswordPage;
