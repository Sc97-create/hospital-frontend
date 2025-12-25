import './Login.css'
import { Row, Col, Card, Form, Input, Button, Checkbox, Space } from "antd";
import { UserOutlined,LockOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
function Login() {
    const onFinish = (values: any) => {
        console.log('Success:', values);
        // You can add your login API call here
    };
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
                                    <h2 style={{ textAlign: 'center'}}>Welcome Back</h2>
                                    <Form
                                        name="login"
                                        layout="vertical"
                                        onFinish={onFinish}
                                        className='login-form'
                                    >
                                        <Form.Item
                                            label="Email"
                                            name="username"
                                        >
                                            <Input
                                                prefix={<UserOutlined />}
                                                placeholder='your work email'
                                                allowClear
                                            />

                                        </Form.Item>

                                        <Form.Item
                                            label="Password"
                                            name="password"
                                        >
                                            <Input
                                            prefix={<LockOutlined/>}
                                            placeholder='your password'
                                            type='password'
                                             />
                                        </Form.Item>
                                        <Form.Item
                                            name='remember'
                                            valuePropName='checked'
                                            label={null}
                                            className='checkbox-input'
                                        >
                                            <Space className='input-sample'>
                                                <Checkbox>Remember me</Checkbox>
                                                <a href="https://www.google.com">Forgot Password</a>
                                            </Space>
                                        </Form.Item>

                                        <Form.Item>
                                            <Button  htmlType="submit" className='login-submit-button' block>
                                                Login
                                            </Button>
                                        </Form.Item>
                                        <Form.Item
                                         name='createaccount'
                                         className='button-input'
                                        >
                                            <p>Don't have Account? <Link to={'/signup'}>Sign Up</Link></p>
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