import './Login.css'
import { Form, Input, Button, message, Modal } from "antd";
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { loginPayload, loginResponse, UpdatePasswordPayload } from './types/auth';
import { LoginReq, UpdatePasswordFirstLogin } from './api/login-api';
import { usePermissions } from '../auth/permissions-context';
import { resolveDefaultRouteFromEntries } from '../auth/default-route';
import { setSubscriptionExpired } from '../customer/subscription/access';
import { pickAccessToken, pickOrganisationId, pickUserId } from '../auth/session';

function LogoMark() {
    return (
        <svg className="login-brand-logo-mark" viewBox="0 0 36 36" aria-hidden="true">
            <rect width="36" height="36" rx="10" fill="#1B806A" />
            <path
                d="M11 19c2.4 3.4 5.5 5.3 10 5.8M15.5 11.5c1.9-.4 3.8-.3 5.7.4 1.7.6 3 1.8 3.8 3.3"
                fill="none"
                stroke="#fff"
                strokeWidth="2.2"
                strokeLinecap="round"
            />
            <circle cx="13.2" cy="14.2" r="1.7" fill="#fff" />
        </svg>
    );
}

function isPasswordCleared(data: loginResponse): boolean {
    const flag = data.passwordcleared ?? data.password_cleared;
    return flag === true || flag === "true";
}

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

function Login() {
    const [form] = Form.useForm<loginPayload>();
    const [passwordForm] = Form.useForm<UpdatePasswordPayload>();
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [updatingPassword, setUpdatingPassword] = useState(false);
    const [loggingIn, setLoggingIn] = useState(false);
    const { setAccess, getDefaultRoute } = usePermissions();

    useEffect(() => {
        const root = document.getElementById("root");
        if (!passwordModalOpen) {
            document.body.classList.remove("password-reset-lock");
            root?.removeAttribute("inert");
            return;
        }

        document.body.classList.add("password-reset-lock");
        root?.setAttribute("inert", "");

        return () => {
            document.body.classList.remove("password-reset-lock");
            root?.removeAttribute("inert");
        };
    }, [passwordModalOpen]);

    const storeSession = (data: loginResponse) => {
        const raw = data as unknown as Record<string, unknown>;
        const token = pickAccessToken(raw) || data.token;
        const userId = pickUserId(raw) || data.user_id;
        const organisationId = pickOrganisationId(raw) || data.organisation_id;

        if (token) localStorage.setItem("access_token", token);
        if (userId) localStorage.setItem("user_id", userId);
        if (organisationId) localStorage.setItem("organisation_id", organisationId);
        setSubscriptionExpired(false);
        setAccess(Boolean(data.is_admin), data.permissions);
    };

    const login = async (values: loginPayload) => {
        setLoggingIn(true);
        try {
            const data = await LoginReq(values);
            storeSession(data);
            if (!localStorage.getItem("user_id")) {
                messageApi.error("Login succeeded but user id was missing. Please contact support.");
                return;
            }
            if (isPasswordCleared(data)) {
                passwordForm.resetFields();
                setPasswordModalOpen(true);
                return;
            }
            navigate(resolveDefaultRouteFromEntries(Boolean(data.is_admin), data.permissions));
        } catch {
            messageApi.error("Invalid email or password. Please try again.");
        } finally {
            setLoggingIn(false);
        }
    };

    const submitNewPassword = async (values: UpdatePasswordPayload) => {
        setUpdatingPassword(true);
        try {
            const response = await UpdatePasswordFirstLogin({
                password: values.password,
                confirm_password: values.confirm_password,
            });
            const code = response.code != null ? String(response.code) : "200";
            if (code !== "200") {
                throw new Error(response.message || "Failed to update password");
            }
            messageApi.success(response.message || "Password updated successfully");
            setPasswordModalOpen(false);
            passwordForm.resetFields();
            navigate(getDefaultRoute());
        } catch (error) {
            if (error && typeof error === "object" && "errorFields" in error) {
                return;
            }
            console.error("Update password failed:", error);
            messageApi.error(getApiErrorMessage(error, "Failed to update password. Try again."));
        } finally {
            setUpdatingPassword(false);
        }
    };

    return (
        <div className={`login-page${passwordModalOpen ? " login-page--locked" : ""}`}>
            {contextHolder}
            <aside className="login-brand">
                <div className="login-brand-logo">
                    <LogoMark />
                    <div>
                        <div className="login-brand-logo-name">Floato</div>
                        <div className="login-brand-logo-tag">Healthcare OS</div>
                    </div>
                </div>
                <div className="login-brand-content">
                    <h1 className="login-brand-headline">
                        Healthcare operations, made simpler.
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
                    </header>

                    <Form
                        name="login"
                        layout="vertical"
                        onFinish={login}
                        className="login-form"
                        autoComplete="on"
                        form={form}
                        requiredMark={false}
                        disabled={passwordModalOpen}
                    >
                        <Form.Item
                            label="Email"
                            name="user_name"
                            rules={[{ required: true, message: "Please enter your email" }]}
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

            <Modal
                open={passwordModalOpen}
                title="Set a new password"
                closable={false}
                maskClosable={false}
                keyboard={false}
                footer={null}
                centered
                destroyOnClose
                zIndex={4000}
                getContainer={() => document.body}
                rootClassName="login-password-modal-root"
                className="login-password-modal"
            >
                <p className="login-password-modal-copy">
                    Your previous password was cleared. Choose a new password to continue.
                </p>
                <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={submitNewPassword}
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
                    <Button
                        type="primary"
                        htmlType="submit"
                        block
                        size="large"
                        loading={updatingPassword}
                    >
                        Update Password
                    </Button>
                </Form>
            </Modal>
        </div>
    );
}

export default Login;
