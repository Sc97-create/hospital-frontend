import {
    Form,
    Input,
    Button,
    Card,
    Row,
    Col,
    Checkbox,
    Progress,
} from "antd";
import './third-step.css'
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";

interface ThirdStepProps {
    onNext: () => void;
    onBack: () => void;
}

function ThirdStep({ onNext, onBack }: ThirdStepProps) {
    return (
        <div className="main-layout">
            <h1>Set Up Root Admin Account</h1>
            <p className="muted-text" style={{ marginBottom: 32 }}>
                This account will have full control over the organization's platform
                settings and user management. Use a secure work email.
            </p>
            <Card>
                <Form layout="vertical">
                    <Form.Item label="Full Name" required>
                        <Input placeholder="e.g. Dr. Jane Smith" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Work Email" required>
                                <Input placeholder="jane.smith@hospital.com" />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item label="Phone Number" required>
                                <Input placeholder="+1 (555) 000-0000" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item label="Password" required>
                        <Input.Password
                            placeholder="Create a strong password"
                            iconRender={(visible) =>
                                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                            }
                        />
                    </Form.Item>
                    <div className="password-rules">
                        <div className="rule success">
                            <span className="icon check">✔</span>
                            At least 8 characters
                        </div>

                        <div className="rule pending">
                            <span className="icon dot" />
                            One numerical digit
                        </div>

                        <div className="rule pending">
                            <span className="icon dot" />
                            One special character
                        </div>

                        <div className="rule success">
                            <span className="icon check">✔</span>
                            Upper & lower case
                        </div>
                    </div>


                    <Form.Item label="Confirm Password" required>
                        <Input.Password placeholder="Re-enter password" />
                    </Form.Item>

                    <Form.Item>
                        <Checkbox>
                            I authorize this account to act as the primary Root Admin for the
                            organization. I understand this account has full administrative
                            privileges.
                        </Checkbox>
                    </Form.Item>
                    <div className="button-row1">
                        <Button onClick={onBack}>Back</Button>
                        <Button className="custom-primary-btn" onClick={onNext}>
                            Create Root Admin Account
                        </Button>
                    </div>
                </Form>
            </Card>

            <p className="help-text">
                Need help? <a href="#">Contact Platform Support</a>
            </p>
        </div>
    );
}

export default ThirdStep;
