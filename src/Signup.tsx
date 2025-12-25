import * as React from 'react';
import { Row, Col, Form, Input, Button } from 'antd';
import { CheckCircleFilled } from '@ant-design/icons';
import './signup.css'

function Signup() {
    /*
      need to add row to form
      need to add plan with inputs 6 month is valid and then it goes on and year,month
    */
    const [form] = Form.useForm();
    const [password, setPassword] = React.useState('');
    const validateStrongPassword = (_: any, value: string) => {
        if (!value) return Promise.resolve();

        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        setPassword(value)
        if (!strongPasswordRegex.test(value)) {
            return Promise.reject(
                'Password must be at least 8 characters long and include uppercase, lowercase, and a number.'
            );
        }

        return Promise.resolve();
    };

    return (
        <>
            <div className="container-fluid">
                <Row>
                    <Col span={8}>
                        <div className="signup-panel">
                            <h1>Medi Record Manage</h1>
                            <h2>Sign Up</h2>
                            <p><span style={{ color: 'red' }}>*</span>  fill in detail to start exploring medical records and patient information</p>
                            
                            <Form
                                name='signup'
                                layout='vertical'
                                className='signup-form'
                            >
                                <Form.Item
                                    label="Organisation Name"
                                    name="organisation_name">
                                    <Input
                                        placeholder='organisation name'
                                        allowClear
                                        className='custom-input'
                                    />
                                </Form.Item>
                                <Form.Item
                                    label="Email ID"
                                    name="email_id">
                                    <Input
                                        placeholder='enter work email'
                                        className='custom-input'
                                        allowClear

                                    />
                                </Form.Item>
                                <Form.Item
                                    label="Phone number"
                                    name="mobile_number">
                                    <Input
                                        placeholder='mobile no'
                                        allowClear
                                        className='custom-input'
                                    />
                                </Form.Item>
                                <Form.Item
                                    label="Hospital Address"
                                    name="address">
                                    <Input.Search
                                        placeholder='add address to locate on map'
                                        allowClear
                                        className='custom-input'
                                    />
                                </Form.Item>
                                <Form.Item>
                                    <Button className='signup-button' block>
                                        Create Account
                                    </Button>
                                </Form.Item>

                            </Form>

                        </div>
                    </Col>
                    <Col span={12}>
                        <div className="signup-right-panel">
                            <img src="/signup-cover.jpg" alt="signup image" />
                        </div>
                    </Col>
                </Row>
            </div>
        </>
    )
}
export default Signup