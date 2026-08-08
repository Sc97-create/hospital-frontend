import './Login.css'
import { Form, Input, Button, message } from "antd";
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import type { loginPayload } from './types/auth';
import { LoginReq } from './api/login-api';

function Login() {
    const [form] = Form.useForm<loginPayload>();
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();

    const login = async (values: loginPayload) => {
        try {
            const data = await LoginReq(values);
            localStorage.setItem("access_token", data.token);
            localStorage.setItem("user_id", data.user_id);
            localStorage.setItem("organisation_id", data.organisation_id);
            navigate('/dashboard');
        } catch {
            messageApi.error("Invalid email or password. Please try again.");
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
                    </header>

                    <Form
                        name="login"
                        layout="vertical"
                        onFinish={login}
                        className="login-form"
                        autoComplete="on"
                        form={form}
                        requiredMark={false}
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

export default Login;
