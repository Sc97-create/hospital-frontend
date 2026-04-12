import { Button, Col, Form, Input, Progress, Row, Select } from 'antd'
import './first-step.css'
import { useEffect, useState } from 'react';
import type { OrgSignup } from '../../types/first-step-signup';
import { createOrg } from './createOrganisation';
import { updateOrg } from './updateOrganisation';

type Props = {
    data: any;
    onSuccess: (orgID: string) => void;
    OnNext: () => void;
}

function FirstStep({ data, onSuccess, OnNext }: Props) {
    const [current, setCurrent] = useState(0);
    const { mutate: createOrgFn, isPending: createOrgPending } = createOrg();
    const { mutate: updateOrgFn, isPending: updateOrgPending } = updateOrg();
    const [form] = Form.useForm<OrgSignup>();
    //console.log('get data', data)
    const OnFinish = (values: OrgSignup) => {
        console.log("values", values);
        if (!data?.id) {
            createOrgFn(values, {
                onSuccess: (data) => {
                    console.log("API success", data);
                    onSuccess(data.organisation_id)
                    OnNext();
                },
                onError: (error) => {
                    console.error("API failed", error);
                },
            });
        } else {
            updateOrgFn(
                {
                    organisation_id: data.id,
                    ...values
                },
                {
                    onSuccess: (data) => {
                        console.log("API success", data);
                        onSuccess(data.organisation_id)
                        OnNext();
                    },
                    onError: (error) => {
                        console.error("API failed", error);
                    },
                })
        }

    };
    useEffect(() => {
        console.log("isPending", createOrgPending)
        if (data) {
            form.setFieldsValue({
                organisation_name: data?.organisation_name,
                legal_entity_name: data?.legal_entity_name,
                hospital_type: data?.hospital_type,
            })
        }
    }, [data, createOrgPending, updateOrgPending])

    return (
        <>
            <div className="main-layout">
                <Row gutter={[32, 0]}>
                    <Col span={12}>
                        <h2>Organisation Details</h2>
                        <p style={{ color: "#667085", marginBottom: 24 }}>
                            Step 1 of 4: Provide the basic identity details for your healthcare facility.
                        </p>

                        <Form layout="vertical" form={form} onFinish={OnFinish}>
                            <Form.Item name="hospital_code" label="Hospital Code (Auto-generated)">
                                <Input value="HOSP-9921-2024" disabled />
                                <small style={{ color: "#98A2B3" }}>
                                    This unique identifier is automatically assigned to your organisation.
                                </small>
                            </Form.Item>

                            <Form.Item
                                label="Organisation Name"
                                name="organisation_name"
                                required
                                rules={[{ required: true, message: "Please enter organisation name" }]}
                            >
                                <Input placeholder="e.g. St. Mary's General Hospital" />
                            </Form.Item>

                            <Form.Item
                                label="Legal Entity Name"
                                name="legal_entity_name"
                                required
                                rules={[{ required: true, message: "Please enter legal entity name" }]}
                            >
                                <Input placeholder="e.g. Mary Healthcare Trust Ltd." />
                            </Form.Item>

                            <Form.Item
                                label="Hospital Type"
                                name="hospital_type"
                                required
                            >
                                <Select placeholder="Select Hospital Type">
                                    <Select.Option value="private">Private Hospital</Select.Option>
                                    <Select.Option value="government">Government Hospital</Select.Option>
                                    <Select.Option value="clinic">Clinic</Select.Option>
                                    <Select.Option value="diagnostic">Diagnostic Center</Select.Option>
                                </Select>
                            </Form.Item>

                            <div className='button-row'>
                                <Button className='custom-primary-btn' htmlType='submit' loading={createOrgPending} disabled={createOrgPending}>
                                    {data?.id ? "Update" : "Continue to Location →"}
                                </Button>
                            </div>
                        </Form>
                    </Col>

                    <Col span={12}>
                        {/* Compliance Card */}
                        <div className="info-card">
                            <h4 className='card-title'>✔ Compliance & Trust</h4>
                            <p className='card-text'>
                                This information is used to verify your facility against regional
                                healthcare regulations and will appear on official documentation and
                                billing headers.
                            </p>

                            <strong className='card-subtitle'>Why is this required?</strong>
                            <ul className='card-list'>
                                <li>Regulatory KYC check</li>
                                <li>Billing & invoice authenticity</li>
                                <li>System-wide data segregation</li>
                            </ul>

                            <a className='card-link' href="#">Learn more about compliance ↗</a>
                        </div>

                        {/* Progress Card */}
                        <div className="info-card" style={{ marginTop: 24 }}>
                            <h4>Onboarding Progress</h4>
                            <Progress percent={25} showInfo />
                        </div>

                        {/* Help Card */}
                        <div className="info-card help-card" style={{ marginTop: 24 }}>
                            <h4>Need help?</h4>
                            <p>Talk to our setup expert</p>
                        </div>
                    </Col>


                </Row>
            </div>
        </>
    )
}
export default FirstStep