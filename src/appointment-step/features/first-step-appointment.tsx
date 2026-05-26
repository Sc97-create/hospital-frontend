import { Col, Dropdown, Form, Input, Row, Select, Space, Tag, Tooltip, Card, AutoComplete } from "antd";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import {
    DownOutlined,
    SearchOutlined,
} from '@ant-design/icons'
import './first-step-appointment.css'
import type { PersonalInfo } from "../types/first-step-appointment";
import { GetDepartments } from "../../shared/api/shared-api";
import type { Department } from "../../shared/types/share-type";
const { Option } = Select;
const handleChange = (value: string) => {
    console.log(`selected ${value}`);
};

//need to add next button

import { Button } from 'antd';
import { CreateAppointment } from "../api/first-step-appointment";
import { useNavigate } from "react-router-dom";
import { GetDoctors } from "../../shared/api/shared-api";
import { getDepartments } from "../../shared/shared";

export interface FirstStepRef {
    validate: () => Promise<PersonalInfo>;
}



function FirstStep() {

    const [form] = Form.useForm<PersonalInfo>();
    const navigate = useNavigate();
    const [SymInput, setSympInput] = useState('');
    const [showSympAll, setSympShowAll] = useState(false);
    const [symptomtags, setSymptomTags] = useState<string[]>([])
    const [doctors, setDoctors] = useState<string>("");
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);

    
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const data = {
                ...values,
                organisation_id: localStorage.getItem("organisation_id") || "4c02d9f5-7388-4382-b2c7-aa3fe3852625",
                user_id: localStorage.getItem("user_id") || ""
            };
            const response = await CreateAppointment(data);
            let id = "";
            if (response?.data) {
                if (typeof response.data === 'string') {
                    id = response.data;
                } else {
                    id = response.data.patient_id || response.data.id;
                }
            } else if ((response as any)?.patient_id) {
                id = (response as any).patient_id;
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
        <>
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
                >
                    <Row gutter={[16, 0]} >
                        <Col xs={24} sm={12}>
                            <Form.Item label="Name" name="name" >
                                <Input placeholder="what we call you" className='input-form-layout' />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item label="Blood Group" name="blood_group">
                                <Select
                                    className='dropdown-input-class'
                                    placeholder='select your blood group'
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
                            <Form.Item label="Age" name="age">
                                <Input type="number" placeholder="are you 21?" className='input-form-layout' />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item label='Phone number' name="mobile_number">
                                <Input type='tel' placeholder='we are trying to reach you' maxLength={10} className='input-form-layout' />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item label='Gender' name="gender" >
                                <Select
                                    className='dropdown-input-class'
                                    onChange={handleChange}
                                    placeholder='its upto you'
                                    options={[
                                        { value: 'female', label: 'Female' },
                                        { value: 'male', label: 'Male' },
                                        { value: 'not prefer to say', label: 'Not Prefer To Say' },

                                    ]}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item label='Email ID' name="email_id">
                                <Input placeholder='we want to notify you' type='email' className='input-form-layout' />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item label="Weight" name="weight">
                                <Input type="number" placeholder="don't be overweight" className='input-form-layout' />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item label="Address" name="address">
                                <Input placeholder="where do you live?" className='input-form-layout' />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Card>

            <div className="step-button-wrapper">
                <Button
                    type="primary"
                    onClick={handleSubmit}
                    style={{
                        borderRadius: 8,
                        backgroundColor: "#25D366",
                        width: 80,
                        fontWeight: "600",
                    }}
                >
                    Submit
                </Button>
            </div>
        </>
    )

}

export default FirstStep