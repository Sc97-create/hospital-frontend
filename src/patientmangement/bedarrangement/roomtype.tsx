import React, { useEffect, useState } from 'react';
import { Form, message, Typography, Steps, Card, Input, Row, Col, Switch, Button, Layout, InputNumber } from 'antd';
import { EditOutlined, InfoCircleOutlined } from '@ant-design/icons';
import './roomtype.css';
import Sidebar from '../../sidebar';
import BedArrangementSteps from './bed-arrangement-steps';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreateRoomType, GetRoomType } from '../api/roomtype';
import { type RoomTypeResponse, type RoomType } from '../types/roomtype';

const { Title, Text } = Typography;

export default function CreateBed() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [roomtypedata, setRoomTypeData] = useState<RoomTypeResponse>();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state?.roomtype?.data) {
            const data = location.state.roomtype.data;
            form.setFieldsValue({
                roomType: data.room_type_name,
                basePrice: data.base_price
            });
        }
    }, [location.state, form]);

    const onFinish = async (values: any) => {
        setLoading(true);

        const payload: RoomType = {
            name: values.roomType,
            is_default: values.isDefault || false,
            organisation_id: "de6b9b6e-9fda-49cb-8828-80310924e707",
            base_price: values.basePrice
        };

        try {
            const res = await CreateRoomType(payload);
            message.success(res.message);
            if (res.data["room_type_id"]) {
                console.log("data", res.data["room_type_id"])
                const getData = await GetRoomType(res.data["room_type_id"]);
                setRoomTypeData(getData);
                console.log("get data", getData)
                navigate(`/bed-arrangement/step-2`, { state: { roomtypedata: getData } });
            }

        } catch (error) {
            console.error(error);
            message.error("Failed to create room type");
            // If error, it shouldn't navigate to the next step.
        } finally {
            setLoading(false);
        }
    };



    return (
        <Layout>
            <Sidebar />
            <div className="container">
                {/* Steps */}
                <BedArrangementSteps current={0} />

                {/* Header */}
                <Title level={3} className="header-title" style={{ marginTop: 16 }}>
                    Create Room Type
                </Title>
                <Text type="secondary">
                    Define the fundamental categories for your facility's spatial
                    management.
                </Text>

                {/* Main Card */}
                <Card className="main-card">
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                        initialValues={{ isDefault: false }}
                    >
                        {/* Room Type Input */}
                        <Form.Item
                            label="ROOM TYPE NAME"
                            name="roomType"
                            rules={[{ required: true, message: "Please enter room type" }]}
                        >
                            <Input
                                placeholder="e.g., General, Private, ICU"
                                suffix={<EditOutlined />}
                                size="large"
                            />
                        </Form.Item>

                        <Text type="secondary" className="help-text">
                            This name will be used across all administrative and scheduling
                            interfaces.
                        </Text>

                        <div style={{ marginTop: 24, marginBottom: 8 }}>
                            {/* Base Price Input */}
                            <Form.Item
                                label="BASE PRICE"
                                name="basePrice"
                                rules={[{ required: true, message: "Please enter a base price" }]}
                                style={{ marginBottom: 4 }}

                            >
                                <InputNumber
                                    placeholder="e.g., 500"
                                    size="large"
                                    style={{ width: '100%' }}
                                    prefix="$"
                                    min={0}
                                />
                            </Form.Item>

                            <Text type="secondary" className="help-text">
                                Set the standard day rate or base price allocated to this specific room type.
                            </Text>
                        </div>

                        {/* Default Toggle */}
                        <Card className="default-toggle-card">
                            <Row justify="space-between" align="middle">
                                <Col>
                                    <Text strong>Set as Default</Text>
                                    <br />
                                    <Text type="secondary" className="help-text">
                                        Automatically select this type when creating new wings or
                                        departments.
                                    </Text>
                                </Col>
                                <Col>
                                    <Form.Item name="isDefault" valuePropName="checked" noStyle>
                                        <Switch />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>

                        <Row justify="end" className="actions-row">
                            <Button className="cancel-button">Cancel</Button>
                            <Button type="primary" htmlType="submit" loading={loading} className="save-button">
                                Save & Continue →
                            </Button>
                        </Row>
                    </Form>
                </Card>

                {/* Bottom Info Section */}
                <Row gutter={16} className="bottom-info-row">
                    <Col span={16}>
                        <Card className="pro-tip-card">
                            <Row align="middle" gutter={12}>
                                <Col>
                                    <InfoCircleOutlined className="info-icon" />
                                </Col>
                                <Col>
                                    <Text strong>Pro-Tip: Standardization</Text>
                                    <br />
                                    <Text type="secondary" className="help-text">
                                        Standardizing room types allows for better analytics on
                                        facility utilization. Private rooms may require specific
                                        staffing ratios configured later.
                                    </Text>
                                </Col>
                            </Row>
                        </Card>
                    </Col>

                    <Col span={8}>
                        <Card className="suggestions-card">
                            <Text type="secondary">
                                Intelligent configuration suggestions available for ICU setups.
                            </Text>
                        </Card>
                    </Col>
                </Row>
            </div>
        </Layout>

    );
}