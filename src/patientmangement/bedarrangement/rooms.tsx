import { useState, useEffect } from 'react';
import {
    Card, Input, Row, Col, Button,
    Progress, Layout, InputNumber, Form,
    message
} from 'antd';
import {
    LockOutlined,
    ArrowLeftOutlined, InfoCircleFilled
} from '@ant-design/icons';
import Sidebar from '../../sidebar';
import './rooms.css';
import BedArrangementSteps from './bed-arrangement-steps';
import { useNavigate, useLocation } from 'react-router-dom';
import type { RoomData, Rooms } from '../types/rooms';
import type { RoomTypeResponse } from '../types/roomtype';
import { CreateRoom } from '../api/rooms';

interface CreateRoomsFormValues {
    number_of_floors: number;
    rooms_per_floor: number;
    starting_per_floor: number;
    prefix: string;
}

export default function CreateRooms() {
    const navigate = useNavigate();
    const location = useLocation();
    // const { id } = useParams<{ id: string }>();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [roomArray, setRoomArray] = useState<RoomData[]>([]);

    const roomtype = location.state?.roomtypedata as RoomTypeResponse;


    useEffect(() => {
        if (roomArray && roomArray.length > 0) {
            navigate('/bed-arrangement/step-3', { state: { roomArray, roomtype } });
        }
    }, [roomArray, navigate]);



    const onFinish = async (values: CreateRoomsFormValues) => {
        setLoading(true);

        const payload: Rooms = {
            room_type_id: roomtype.data["room_type_id"] || "",
            no_of_floors: values.number_of_floors,
            room_per_floor: values.rooms_per_floor,
            starting_per_floor: values.starting_per_floor,
            prefix: values.prefix,
            organisation_id: localStorage.getItem("organisation_id") || "",
        };

        try {
            const res = await CreateRoom(payload);

            message.success(res.message);
            // localStorage.setItem("room_type_id", res.message);

            // Assume the API response holds the generated rooms array in `res.data`
            // and trigger the useEffect navigation.
            if (res.data.length > 0) {
                setRoomArray(res.data)
            }
        } catch (error) {
            console.error(error);
            message.error("Failed to create rooms");
            // If error, it shouldn't navigate to the next step.
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sidebar />
            <div className="step-2-container">
                {/* Header Section */}
                <BedArrangementSteps current={1} />

                <h1 className="header-title">Create Rooms</h1>
                <p className="header-subtitle">
                    Define individual room identifiers and assign them to specific floors within the clinical facility.
                </p>

                {/* Main Content Form & Cards */}
                <Row gutter={24}>
                    <Col span={14}>
                        <Card className="form-card">
                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={onFinish}
                                initialValues={{
                                    selected_room_type: "General",
                                    number_of_floors: 3,
                                    rooms_per_floor: 2,
                                    starting_floor_number: 1,
                                    prefix: "G"
                                }}
                            >
                                <Form.Item
                                    className="form-group"
                                    label={<span className="form-label">Selected Room Type</span>}
                                >
                                    <Input
                                        disabled
                                        value={roomtype.data["room_type_name"]}
                                        suffix={<LockOutlined style={{ color: '#94a3b8' }} />}
                                        className="custom-input disabled-input"
                                    />
                                </Form.Item>

                                <Form.Item
                                    className="form-group"
                                    label={<span className="form-label">Number of Floors</span>}
                                    name="number_of_floors"
                                    help={<span className="help-text">Specify how many floors will contain this room type.</span>}
                                >
                                    <InputNumber
                                        min={1}
                                        className="custom-input-number"
                                        style={{ width: '100%' }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    className="form-group"
                                    label={<span className="form-label">Rooms Per Floor</span>}
                                    name="rooms_per_floor"
                                    help={<span className="help-text">Specify the number of rooms to create per floor.</span>}
                                >
                                    <InputNumber
                                        min={1}
                                        className="custom-input-number"
                                        style={{ width: '100%' }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    className="form-group"
                                    label={<span className="form-label">Starting Floor Number</span>}
                                    name="starting_per_floor"
                                    initialValue={1}
                                    help={<span className="help-text">The number to begin counting floors from (e.g., 1).</span>}
                                >
                                    <InputNumber
                                        min={1}
                                        disabled
                                        className="custom-input-number"
                                        style={{ width: '100%' }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    className="form-group"
                                    style={{ marginBottom: 0 }}
                                    label={<span className="form-label">Optional: Prefix</span>}
                                    name="prefix"
                                    help={<span className="help-text">A prefix to add to all generated rooms (e.g., G for G101).</span>}
                                >
                                    <Input
                                        className="custom-input"
                                    />
                                </Form.Item>
                            </Form>
                        </Card>
                    </Col>

                    <Col span={10}>
                        <Card className="pro-tip-card">
                            <span className="pro-tip-title">Pro-Tip</span>
                            <div className="pro-tip-text">
                                You can bulk-add room numbers by pasting a comma-separated list. We recommend using a prefix like 'G' for Ground Floor or 'W' for West Wing to help staff navigate faster.
                            </div>
                            <InfoCircleFilled className="pro-tip-icon-bg" />
                        </Card>

                        <Card className="capacity-card">
                            <span className="capacity-title">Capacity Preview</span>
                            <div className="capacity-row">
                                <span className="capacity-label">Total New Rooms</span>
                                <span className="capacity-value">02</span>
                            </div>
                            <Progress
                                percent={20}
                                showInfo={false}
                                strokeColor="#0f766e"
                                trailColor="#e2e8f0"
                                className="capacity-progress"
                            />
                            <div className="capacity-subtext">8% OF TOTAL FACILITY CAPACITY REACHED</div>
                        </Card>
                    </Col>
                </Row>

                {/* Footer Actions */}
                <div className="footer-actions">
                    <Button type="text" icon={<ArrowLeftOutlined />} className="back-button" onClick={() => navigate('/bed-arrangement', { state: { roomtype } })}>
                        Back to Types
                    </Button>
                    <Button type="primary" className="continue-button" onClick={() => form.submit()} loading={loading}>
                        Save Rooms & Continue <span style={{ marginLeft: 4 }}>→</span>
                    </Button>
                </div>
            </div>
        </Layout >
    );
}
