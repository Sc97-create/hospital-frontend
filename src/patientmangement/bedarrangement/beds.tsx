import { useState } from 'react';
import {
    Layout, Card, Select, InputNumber, Form,
    Button, Table, Row, Col, Progress, Popconfirm,
    Modal
} from 'antd';
import {
    AppstoreAddOutlined, ThunderboltOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../../sidebar';
import BedArrangementSteps from './bed-arrangement-steps';
import './beds.css';
import type { RoomData } from '../types/rooms';
import type { GenerateBedModel, BedPreview, Beds, RoomSummary } from '../types/beds';
import { CreateBed, GenerateBeds } from '../api/beds';

export default function BedStep3() {
    const navigate = useNavigate();
    const location = useLocation();
    const [roomsummary, setRoomSummary] = useState<RoomSummary>();
    const [bedPreview, setBedPreview] = useState<BedPreview[]>([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleOk = () => {
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };
    // Retrieve the roomArray array safely
    const rawData = location.state?.roomArray;
    const roomType = location.state?.roomtype
    let roomArray: RoomData[] = [];
    if (Array.isArray(rawData)) {
        console.log("roomArray", rawData)
        roomArray = rawData;
    } else if (rawData && Array.isArray(rawData.data)) {
        roomArray = rawData.data;
    }

    const tableColumns = [
        {
            title: 'ROOM NUMBER',
            dataIndex: 'room_number',
            key: 'room_number',
            render: (text: string) => <span className="blue-text-bold">{text}</span>
        },
        {
            title: 'BED NUMBERS',
            dataIndex: 'beds',
            key: 'beds',
            render: (beds: string[]) => (
                <div className="bed-tags">
                    {beds.map(b => <span key={b} className="bed-tag">{b}</span>)}
                </div>
            )
        },
        {
            title: 'TOTAL',
            dataIndex: 'total',
            key: 'total',
            align: 'right' as const,
        }
    ];

    const [form] = Form.useForm();

    const [loading, setLoading] = useState(false);

    const handleViewMore = () => {
        navigate("/all-rooms", {
            state: { bedPreview }
        });
    };

    const handleGenerateBeds = async () => {
        try {
            const values = await form.validateFields();
            const payload: GenerateBedModel = {
                beds_per_room: values.bedName, // Corresponds to beds per room
                organisation_id: "de6b9b6e-9fda-49cb-8828-80310924e707",
                room_number: values.roomId, // Corresponds to selected array of room numbers
                room_type_id: roomType?.data.room_type_id,
            };
            console.log("beds", payload)
            const response = await GenerateBeds(payload);
            console.log("Bed created successfully:", response.data);

            if (roomArray.length) {
                const freshPreview: BedPreview[] = [];
                roomArray.forEach((room: RoomData) => {
                    console.log("room", room)
                    console.log("room_number", room.room_number)
                    if (response.data[room.id]) {
                        console.log("data", response.data[room.id][0].bed_number)
                        freshPreview.push({
                            key: room.room_number,
                            room_number: room.room_number,
                            room_id: room.id,
                            beds: response.data[room.id][0].bed_number,
                            total: response.data[room.id][0].bed_number.length
                        });
                    }
                });
                setBedPreview(freshPreview);
            }
            setRoomSummary(response.room_summary)


            // Optionally, update the table data here
        } catch (error) {
            console.error("Failed to generate beds:", error);
        }
    };

    const SaveBeds = async () => {
        try {
            setLoading(true);
            const payload: Beds = {
                organisation_id: "de6b9b6e-9fda-49cb-8828-80310924e707",
                beds: bedPreview,
                room_type_id: roomType?.data.room_type_id

            }
            const response = await CreateBed(payload);
            // Log the full response so you can see it in the F12 console
            console.log("create bed response full:", response);
            if (response && (String(response.code) === "200" || response.message || !response.code)) {
                console.log("coming inside")
                showModal();

            }

        } catch (error) {
            console.log("failed to create bed", error)
        } finally {
            setLoading(false);
        }
    }

    // console.log("Def", defaultRooms);
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sidebar />
            <Modal
                title="Configuration Saved"
                open={isModalOpen}
                onOk={() => {
                    handleOk();
                    navigate('/bed-arrangement');
                }}
                onCancel={handleCancel}
                okText="Done"
                cancelButtonProps={{ style: { display: 'none' } }}
            >
                <p>Bed configuration has been completed successfully.</p>
            </Modal>
            <div className="step-3-container">

                <BedArrangementSteps current={2} />


                <Row gutter={24} className="main-row">
                    {/* Left Column */}
                    <Col span={8}>
                        <Card className="action-card">
                            <div className="card-title-row">
                                <AppstoreAddOutlined className="title-icon" />
                                <span className="card-title">Assign Beds to Rooms</span>
                            </div>

                            <Form form={form} onFinish={handleGenerateBeds} layout="vertical">
                                <Form.Item
                                    className="form-group"
                                    label={<span className="form-label">Multi-select Room Numbers</span>}
                                    name="roomId"
                                    initialValue={roomArray.map((r: RoomData) => r.id)}
                                >
                                    <Select
                                        mode="multiple"
                                        style={{ width: '100%' }}
                                        placeholder="Selected rooms"
                                        className="custom-select-blue"
                                        optionFilterProp="children"
                                        disabled
                                        maxTagCount={3}
                                        maxTagPlaceholder={(omittedValues) => `+${omittedValues.length} Show More`}
                                    >
                                        {roomArray.map((r: RoomData) => (
                                            <Select.Option key={r.id} value={r.id}>{r.room_number}</Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>

                                <Form.Item
                                    className="form-group"
                                    label={<span className="form-label">Beds per Room</span>}
                                    name="bedName"
                                    initialValue={2}
                                >
                                    <InputNumber
                                        min={1}
                                        max={10}
                                        style={{ width: '100%' }}
                                        className="custom-input-number"
                                    />
                                </Form.Item>

                                {/* <div className="form-group-checkbox">
                                    <Checkbox defaultChecked className="custom-checkbox">Apply same bed count to all</Checkbox>
                                </div> */}

                                <Button className="generate-beds-btn" htmlType="submit" icon={<ThunderboltOutlined />} block>
                                    Generate Beds
                                </Button>
                            </Form>
                        </Card>
                    </Col>

                    {/* Middle Column */}
                    <Col span={9}>
                        <Card className="table-card" styles={{ body: { padding: 0 } }}>
                            <div className="table-header">
                                <span className="table-title">Preview Table</span>
                            </div>

                            <Table
                                columns={tableColumns}
                                dataSource={bedPreview.slice(0, 3)}
                                rowKey="key"
                                pagination={false}
                                scroll={{ x: 'max-content' }}
                                className="custom-table-step3"
                            />
                            {bedPreview.length > 3 && (
                                <div style={{ textAlign: "center", padding: "12px" }}>
                                    <Button type="link" onClick={handleViewMore}>
                                        View More ({bedPreview.length - 3} more)
                                    </Button>
                                </div>
                            )}
                        </Card>
                    </Col>

                    {/* Right Column */}
                    <Col span={7}>
                        <Card className="summary-card">
                            <span className="summary-title">Summary Panel</span>

                            <div className="summary-row">
                                <span className="summary-label">Room Type</span>
                                <span className="summary-value-teal">General</span>
                            </div>

                            <Row gutter={12} className="stats-row">
                                <Col span={12}>
                                    <div className="stat-box">
                                        <div className="stat-label">TOTAL<br />ROOMS</div>
                                        <div className="stat-value">{roomsummary?.total_rooms ? roomsummary.total_rooms : 0}</div>
                                    </div>
                                </Col>
                                <Col span={12}>
                                    <div className="stat-box">
                                        <div className="stat-label">TOTAL<br />BEDS</div>
                                        <div className="stat-value">{roomsummary?.total_beds ? roomsummary.total_beds : 0}</div>
                                    </div>
                                </Col>
                            </Row>

                            <div className="floor-dist-section">
                                <div className="dist-label">FLOOR DISTRIBUTION</div>
                                <div className="floor-tags">
                                    {(roomsummary?.total_floors ?? 0) > 0 ? (
                                        Array.from({ length: roomsummary!.total_floors }, (_, i) => (
                                            <span key={i + 1} className="floor-tag">{i + 1}</span>
                                        ))
                                    ) : (
                                        <span className="floor-tag">0</span>
                                    )}
                                </div>
                            </div>

                            <div className="progress-section">
                                <Progress percent={75} showInfo={false} strokeColor="#0d9488" trailColor="#d1d5db" size="small" />
                                <div className="progress-text">Setup completion: 75%</div>
                            </div>
                        </Card>

                        <div className="final-actions">
                            <Button type="primary" className="save-complete-btn" loading={loading} onClick={SaveBeds}>
                                Save Complete Setup
                            </Button>
                            <Popconfirm
                                title="Are you sure?"
                                description="All data will be removed. Please confirm."
                                okText="Yes"
                                cancelText="No"
                                onConfirm={() => navigate('/bed-arrangement')}
                            >
                                <Button className="cancel-btn" block>
                                    Cancel
                                </Button>
                            </Popconfirm>
                        </div>
                    </Col>
                </Row>
            </div>
        </Layout>
    );
}
