import { Col, Form, Input, Row, Select, Card } from "antd";
import './first-step-appointment.css'
import type { PersonalInfo } from "../types/first-step-appointment";
const handleChange = (value: string) => {
    console.log(`selected ${value}`);
};

//need to add next button

import { Button } from 'antd';
import { CreateAppointment } from "../api/first-step-appointment";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export interface FirstStepRef {
    validate: () => Promise<PersonalInfo>;
}



function FirstStep() {

    const [form] = Form.useForm<PersonalInfo>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const data = {
                ...values,
                organisation_id: localStorage.getItem("organisation_id") || "",
                user_id: localStorage.getItem("user_id") || ""
            };
            const response = await CreateAppointment(data);
            let id = "";
            if (response?.data) {
                if (typeof response.data === 'string') {
                    id = response.data;
                } else {
                    id = response.data.patient_id || response.data.id || "";
                }
            } else if (response?.patient_id) {
                id = response.patient_id;
            }
            if (id) {
                navigate(`/patients`);
            } else {
                console.error("Missing patient ID in response", response);
            }
            console.log(response);
        } catch (error) {
            console.error("Validation or API error:", error);
        }
    }

    //const displayCondTags = showCond ? conditionTags : conditionTags.slice(0, 2);
    return (
        <div className="appointment-form-container">
            <Card className="firststepcard">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1F2937', margin: 0 }}>
                            Patient Details
                        </h2>
                        <p style={{ fontSize: 12, marginTop: 4 }}>Provide the patient's personal information</p>
                    </div>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid #ccc', margin: '16px 0' }} />
                <Form
                    layout='vertical'
                    form={form}
                    className="patient-details-form"
                >
                    <Row gutter={[16, 0]} >
                        <Col xs={24} sm={12}>
                            <Form.Item
                                label="Name"
                                name="name"
                                rules={[{ required: true, message: 'Patient name is required' }]}
                            >
                                <Input placeholder="Full name" className='input-form-layout' />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                label="Blood Group"
                                name="blood_group"
                                rules={[{ required: true, message: 'Please select a blood group' }]}
                            >
                                <Select
                                    className='dropdown-input-class'
                                    placeholder='Select blood group'
                                    options={[
                                        { value: 'A+', label: 'A+' },
                                        { value: 'A-', label: 'A-' },
                                        { value: 'B+', label: 'B+' },
                                        { value: 'B-', label: 'B-' },
                                        { value: 'AB+', label: 'AB+' },
                                        { value: 'AB-', label: 'AB-' },
                                        { value: 'O+', label: 'O+' },
                                        { value: 'O-', label: 'O-' }
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                label="Age"
                                name="age"
                                rules={[
                                    { required: true, message: 'Age is required' },
                                    { type: 'number', min: 0, max: 150, message: 'Enter a valid age (0–150)', transform: (v) => Number(v) },
                                ]}
                            >
                                <Input type="number" placeholder="Age in years" className='input-form-layout' />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                label='Phone Number'
                                name="mobile_number"
                                rules={[
                                    { required: true, message: 'Phone number is required' },
                                    { pattern: /^\d{10}$/, message: 'Enter a valid 10-digit phone number' },
                                ]}
                            >
                                <Input type='tel' placeholder='10-digit mobile number' maxLength={10} className='input-form-layout' />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                label='Gender'
                                name="gender"
                                rules={[{ required: true, message: 'Please select a gender' }]}
                            >
                                <Select
                                    className='dropdown-input-class'
                                    onChange={handleChange}
                                    placeholder='Select gender'
                                    options={[
                                        { value: 'female', label: 'Female' },
                                        { value: 'male', label: 'Male' },
                                        { value: 'not prefer to say', label: 'Prefer not to say' },
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                label='Email ID'
                                name="email_id"
                                rules={[{ type: 'email', message: 'Enter a valid email address' }]}
                            >
                                <Input placeholder='Email address (optional)' type='email' className='input-form-layout' />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                label="Weight (kg)"
                                name="weight"
                                rules={[
                                    { type: 'number', min: 0, max: 500, message: 'Enter a valid weight', transform: (v) => Number(v) },
                                ]}
                            >
                                <Input type="number" placeholder="Weight in kg (optional)" className='input-form-layout' />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                label="Address"
                                name="address"
                                rules={[{ required: true, message: 'Address is required' }]}
                            >
                                <Input placeholder="Street / locality" className='input-form-layout' />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Card>

            <div className="step-button-wrapper">
                <Button
                    type="primary"
                    onClick={handleSubmit}
                    style={{ borderRadius: 8, minWidth: 100, fontWeight: 600 }}
                >
                    Submit
                </Button>
            </div>
        </div>
    )

}

export default FirstStep
