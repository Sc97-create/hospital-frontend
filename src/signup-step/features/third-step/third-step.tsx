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
import { createAdmin } from "./createadmin";
import type { CreateAdmin } from "../../types/third-step-signup";
import { useEffect, useState } from "react";
import { updateAdmin } from "./updateadmin";

interface ThirdStepProps {
    organisationID: string;
    onSuccess: (userID: string) => void;
    onNext: () => void;
    onBack: () => void;
    data: any;
}
const Rule = ({ valid, text }: { valid: boolean; text: string }) => (
    <div className={`rule ${valid ? "success" : "pending"}`}>
        <span className={`icon ${valid ? "check" : "dot"}`}>
            {valid ? "✔" : ""}
        </span>
        {text}
    </div>
); // need to create seperate folder for reusable component
function ThirdStep({ onSuccess, organisationID, onNext, onBack, data }: ThirdStepProps) {
    const { mutate: create, isPending: isPendingAdmin } = createAdmin();
    const { mutate: update, isPending: isPendingUpdate } = updateAdmin()
    const [password, setPassword] = useState("");
    const [confirmpassword, setconfirmpassword] = useState("");
    const hasMinLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasUpperAndLower = hasUpper && hasLower;
    const isPasswordValid = hasMinLength && hasSpecialChar && hasLower && hasNumber && hasUpper && hasUpperAndLower
    const passwordmatch = confirmpassword.length > 0 && password == confirmpassword
    const cansubmit = isPasswordValid && passwordmatch
    const [form] = Form.useForm<CreateAdmin>();
    const onFinish = (values: Omit<CreateAdmin, "organisation_id">) => {
        if (!data?.id) {
            create({
                organisation_id: organisationID,
                ...values,
            },
                {
                    onSuccess: (data) => {
                        console.log("API Success", data);
                        onSuccess(data.user_id)
                        onNext();
                    },
                    onError: (error) => {
                        console.error("API failed", error);
                    }
                }

            )
        } else {
            update({
                user_id: data?.id,
                ...values,
            },
                {
                    onSuccess: (data) => {
                        console.log("API Success", data);
                        onSuccess(data.user_id)
                        onNext();
                    },
                    onError: (error) => {
                        console.error("API failed", error);
                    }
                }

            )
        }

    }
    useEffect(() => {
        if (data) {
            console.log(data)
            form.setFieldsValue({
                first_name: data?.first_name ? data.first_name : 'random',
                last_name: data?.last_name ? data.last_name : 'shit',
                email_id: data?.email_id ? data.email_id : '',
                mob_no: data?.phone_number ? data.phone_number : '',

            })
        }
    }, [data, isPendingAdmin, isPendingUpdate])
    return (
        <div className="main-layout">
            <h1>Set Up Root Admin Account</h1>
            <p className="muted-text" style={{ marginBottom: 32 }}>
                This account will have full control over the organization's platform
                settings and user management. Use a secure work email.
            </p>
            <Form layout="vertical" form={form} onFinish={onFinish}>
                <Card>
                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item label="First Name" name="first_name" required>
                                <Input placeholder="e.g. Dr. Jane" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item label="Last Name" name="last_name" required>
                                <Input placeholder="e.g. Smith" />
                            </Form.Item>
                        </Col>

                    </Row>


                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item label="Work Email" name="email_id" required>
                                <Input placeholder="jane.smith@hospital.com" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                            <Form.Item label="Phone Number" name="mob_no" required>
                                <Input placeholder="+1 (555) 000-0000" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item label="Password" name="password" required>
                        <Input.Password
                            placeholder="Create a strong password"
                            onChange={(e) => setPassword(e.target.value)}
                            iconRender={(visible) =>
                                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                            }
                        />
                    </Form.Item>
                    <div className="password-rules">

                        <Rule valid={hasMinLength} text="At least 8 characters" />

                        <Rule valid={hasNumber} text="One numerical digit" />

                        <Rule valid={hasSpecialChar} text="One special character" />

                        <Rule valid={hasUpperAndLower} text="Upper & lower case" />

                    </div>
                    <Form.Item label="Confirm Password" name="confirm_password" required>
                        <Input.Password placeholder="Re-enter password" onChange={(e) => setconfirmpassword(e.target.value)} />
                    </Form.Item>
                    {!data?.id && (
                        <div className="setup-options">
                            <Form.Item name="assign_default_roles" valuePropName="checked">
                                <Checkbox className="setup-checkbox">
                                    Assign default administrative roles
                                </Checkbox>
                            </Form.Item>

                            <Form.Item name="assign_default_departments" valuePropName="checked">
                                <Checkbox className="setup-checkbox">
                                    Assign default hospital departments
                                </Checkbox>
                            </Form.Item>

                            <Form.Item name="assign_default_role_permissions" valuePropName="checked">
                                <Checkbox className="setup-checkbox">
                                    Assign default root-level role permissions
                                </Checkbox>
                            </Form.Item>
                        </div>
                    )}

                </Card>
                <div className="button-row1">
                    <Button onClick={onBack}>Back</Button>
                    <Button className="custom-primary-btn" htmlType="submit" loading={isPendingAdmin} disabled={!cansubmit}>
                        {data?.id ? "Update User" : "Create Root Account"}
                    </Button>
                </div>
            </Form>

            <p className="help-text">
                Need help? <a href="#">Contact Platform Support</a>
            </p>
        </div>
    );
}

export default ThirdStep;
