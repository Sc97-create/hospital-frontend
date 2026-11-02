import "../../authentication/Login.css";
import "./login.css";
import { Form, Input, Button, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { CustomerLogin } from "../api/login";
import {
    GetSubscriptionByTenant,
    normalizeSubscriptionByTenant,
    persistSubscriptionLookup,
} from "../subscription";
import { isSubscriptionExpiredFlag, setSubscriptionExpired, SUBSCRIPTION_RENEW_PATH } from "../subscription/access";
import type { CustomerLoginPayload, CustomerLoginResponse } from "../types/signup";

function getApiErrorMessage(error: unknown, fallback: string): string {
    if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object"
    ) {
        const data = error.response.data;
        if ("message" in data && typeof data.message === "string" && data.message.trim()) {
            return data.message;
        }
        if ("error" in data && typeof data.error === "string" && data.error.trim()) {
            return data.error;
        }
    }
    if (error instanceof Error && error.message) {
        return error.message;
    }
    return fallback;
}

function destinationAfterLogin(data: CustomerLoginResponse): string {
    const status = data.status?.trim().toLowerCase() ?? "";
    if (
        status.includes("unverified") ||
        status === "pending_verification" ||
        status === "email_pending"
    ) {
        return "/signup/verify";
    }
    if (isSubscriptionExpiredFlag(data.subscription_expired)) {
        return SUBSCRIPTION_RENEW_PATH;
    }
    if (data.organisation_id?.trim() || data.tenant_id?.trim()) {
        return "/dashboard";
    }
    return "/signup/organisation";
}

function CustomerLoginPage() {
    const [form] = Form.useForm<CustomerLoginPayload>();
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();
    const [loggingIn, setLoggingIn] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const login = async (values: CustomerLoginPayload) => {
        setLoggingIn(true);
        setFormError(null);
        try {
            const data = await CustomerLogin({
                work_email: values.work_email.trim(),
                password: values.password,
            });
            const code = data.code != null ? String(data.code) : "200";
            if (code !== "200") {
                throw new Error(data.message || "Invalid email or password. Please try again.");
            }
            const token = data.access_token || data.token;
            if (!token) {
                throw new Error(data.message || "Login failed. Please try again.");
            }

            localStorage.setItem("access_token", token);
            if (data.customer_id) localStorage.setItem("customer_id", data.customer_id);
            localStorage.setItem("customer_email", data.work_email || values.work_email.trim());
            if (data.status) localStorage.setItem("customer_status", data.status);
            setSubscriptionExpired(isSubscriptionExpiredFlag(data.subscription_expired));
            if (data.organisation_id) localStorage.setItem("organisation_id", data.organisation_id);
            if (data.tenant_id) {
                localStorage.setItem("tenant_id", data.tenant_id);
                try {
                    const subscription = normalizeSubscriptionByTenant(
                        await GetSubscriptionByTenant(data.tenant_id),
                    );
                    if (subscription) persistSubscriptionLookup(subscription);
                } catch (lookupError) {
                    console.error("Failed to load subscription:", lookupError);
                }
            }

            messageApi.success(data.message || "Signed in");
            navigate(destinationAfterLogin(data));
        } catch (error) {
            const text = getApiErrorMessage(error, "Invalid email or password. Please try again.");
            setFormError(text);
            messageApi.error(text);
        } finally {
            setLoggingIn(false);
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
                    <h1 className="login-brand-headline">
                        Hospital operations, in one place
                    </h1>
                    <p className="login-brand-support">
                        Sign in to manage patients, pharmacy, and day-to-day care workflows.
                    </p>
                </div>
            </aside>

            <main className="login-form-panel">
                <div className="login-form-shell">
                    <header className="login-form-header">
                        <h2 className="login-form-title">Sign in</h2>
                        <p className="login-form-subtitle">
                            Access your organisation workspace with your work email.
                        </p>
                        {formError ? (
                            <p className="customer-login-error" role="alert">
                                {formError}
                            </p>
                        ) : null}
                    </header>

                    <Form
                        name="customer-login"
                        layout="vertical"
                        onFinish={login}
                        className="login-form"
                        autoComplete="on"
                        form={form}
                        requiredMark={false}
                    >
                        <Form.Item
                            label="Email"
                            name="work_email"
                            rules={[
                                { required: true, message: "Please enter your email" },
                                { type: "email", message: "Please enter a valid email" },
                            ]}
                        >
                            <Input
                                prefix={<UserOutlined />}
                                placeholder="your work email"
                                allowClear
                                autoComplete="username"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Password"
                            name="password"
                            rules={[{ required: true, message: "Please enter your password" }]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="your password"
                                autoComplete="current-password"
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
                                loading={loggingIn}
                            >
                                Login
                            </Button>
                        </Form.Item>

                        <Form.Item className="login-links-item">
                            <div className="auth-links">
                                <span>
                                    Don't have Account? <Link to="/signup">Sign Up</Link>
                                </span>
                                <Link to="/forgot-password">Forgot Password?</Link>
                            </div>
                        </Form.Item>
                    </Form>
                </div>
            </main>
        </div>
    );
}

export default CustomerLoginPage;
