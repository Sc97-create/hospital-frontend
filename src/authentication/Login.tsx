import './Login.css'
import { Row, Col, Card, Form, Input, Button, Checkbox, Space } from "antd";
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import type { loginPayload } from './types/auth';
import { LoginReq } from './api/login-api';
function Login() {
    const [form] = Form.useForm<loginPayload>();
    const navigate = useNavigate()
    const login = async (values: loginPayload) => {
        try {
            const data = await LoginReq(values)
            console.log("data", data)
            localStorage.setItem("access_token", data.accesstoken)
            localStorage.setItem("user_id", data.user_id)

            navigate('/dashboard')
        } catch (error) {
            console.log("error", error)
        }
    }

    return (
        <>

            <div className="container-fluid">
                <Row>
                    <Col span={12}>
                        <div className="left-panel">
                            <img src="/hospital-login.jpg" alt="Sample Image" />
                        </div>
                    </Col>
                    <Col span={12} className='right-panel'>
                        <div >
                            <Card className='login-card'>
                                <Form
                                    name="login"
                                    layout="vertical"
                                    onFinish={login}
                                    className='login-form'
                                    autoComplete='on'
                                    form={form}
                                >
                                    <Form.Item
                                        label="Email"
                                        name="user_name"
                                    >
                                        <Input
                                            prefix={<UserOutlined />}
                                            placeholder='your work email'
                                            allowClear
                                            autoComplete='on'
                                        />

                                    </Form.Item>

                                    <Form.Item
                                        label="Password"
                                        name="password"
                                    >
                                        <Input
                                            prefix={<LockOutlined />}
                                            placeholder='your password'
                                            type='password'
                                        />
                                    </Form.Item>

                                    <Form.Item>
                                        <Button htmlType="submit" className='login-submit-button' block>
                                            Login
                                        </Button>
                                    </Form.Item>
                                    <Form.Item className="button-input">
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                width: "100%",   // 👈 important
                                            }}
                                        >
                                            <span>
                                                Don't have Account? <Link to="/signup">Sign Up</Link>
                                            </span>

                                            <Link to="/forgot-password">Forgot Password?</Link>
                                        </div>
                                    </Form.Item>
                                </Form>
                            </Card>
                        </div>
                    </Col>


                </Row>
            </div>


        </>
    )
}
export default Login