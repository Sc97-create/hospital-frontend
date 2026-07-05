import { Card, Col, DatePicker, Form, Input, Layout, Row, Select, Switch, type DatePickerProps, Modal, message } from "antd"
import './second-step-appointment.css'
import type { RoomType, RoomTypeArr } from "../../patientmangement/types/roomtype";
import { useState } from "react";
import type { RoomData, RoomDataArr } from "../../patientmangement/types/rooms";
import type { Beddata, BedModel, RoomBed } from "../../patientmangement/types/beds";
import { GetAvailableRooms } from "../../patientmangement/api/rooms";
import { GetAvailableBeds } from "../../patientmangement/api/beds";
import { GetRoomTypeByOrganisationID } from "../../patientmangement/api/roomtype";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { createBedallotment } from "../api/second-step";
import type { bedAllotment } from "../types/second-step.appointment";
import dayjs from "dayjs";

import { Button } from "antd"

const { Option } = Select;

function SecondStep() {
    const { patientID } = useParams<{ patientID: string }>();
    const navigate = useNavigate();

    const [form] = Form.useForm();
    const [modal, contextHolder] = Modal.useModal();
    const [roomtype, setRoomType] = useState<RoomType[]>();
    const [rooms, setRooms] = useState<RoomData[]>();
    const [beds, setBeds] = useState<BedModel[]>();
    const [bedalloted, setbedalloted] = useState<bedAllotment>();
    const [selectedRoomId, setSelectedRoomId] = useState<string | "">("");
    const [selectedBedId, setSelectedBedId] = useState<string | "">("");
    const [selectedRoomType, setSelectedRoomType] = useState<string | "">("");
    //const [charges, setcharges] = useState<string>("0");

    const getAllRooms = async () => {
        const response = await GetAvailableRooms("dce26168-eb8d-4723-a21e-2c33ad3ce39c", "10", "0");
        setRooms(response.data);
    }
    const getAllbeds = async () => {
        const response = await GetAvailableBeds("dce26168-eb8d-4723-a21e-2c33ad3ce39c", "10", "0", selectedRoomId);
        setBeds(response.data);
    }
    const getAllRoomTypes = async () => {
        const response = await GetRoomTypeByOrganisationID("dce26168-eb8d-4723-a21e-2c33ad3ce39c");
        setRoomType(response.data);
    }
    const createBedAllotment = async (values: any) => {
        const payload: bedAllotment = {
            patient_id: patientID ? patientID : "",
            room_id: selectedRoomId,
            bed_id: selectedBedId,
            room_type: selectedRoomType,
            organisation_id: "dce26168-eb8d-4723-a21e-2c33ad3ce39c",
            appointment_id: "",
            charges: values.bed_charges,
            dischargeat: new Date()
        }
        const response = await createBedallotment(payload);
        setbedalloted(response.data);
    }

    const handleSubmit = async (values: any) => {
        try {
            if (selectedRoomId || selectedBedId) {
                await createBedallotment(values);
            }
            message.success('Appointment created successfully!');
            navigate(`/patients`);
        } catch (e) {
            console.log(e);
        }
    }

    const handleSkip = () => {
        console.log("Skip clicked");
        modal.confirm({
            title: 'Skip Bed Allotment?',
            content: 'If you skip, no bed will be allotted to the patient. Are you sure you want to proceed?',
            okText: 'Yes, Skip',
            cancelText: 'Cancel',
            onOk: () => {
                console.log("Skip confirmed");
                message.success('Appointment created successfully!');
                navigate(`/patients`);
            }
        });
    }

    const handleBack = () => {

        navigate(-1);
    }


    const disabledDate = (current: any) => {
        // Can not select days before today
        return current && current < dayjs().startOf('day');
    };

    const onChange: DatePickerProps['onChange'] = (date, dateString) => {
        if (!date) return;

        // Get selected date
        const selectedDate = date.toDate();

        // Option 1️⃣ — Add current time (for example, when admission is recorded)
        const finalDate = new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate(),
            new Date().getHours(),
            new Date().getMinutes(),
            new Date().getSeconds()
        );

        console.log("Final datetime to send backend:", finalDate.toISOString());
    };

    return <>
        {contextHolder}
        <Layout className="scroll-enabled-page">
            <Card className="secondstepcard">
                <div className="bed-allotment">
                    <div className="text-tag">
                        <h2>
                            Bed Allotment
                        </h2>
                        <p>this step is optional, you can proceed with bed admission</p>
                    </div>
                </div>
                <hr className="divider" />
                <Form
                    layout="vertical"
                    form={form}
                    onFinish={handleSubmit}

                >
                    <Row gutter={[0, 0]}>
                        <Col xs={24} sm={12}>
                            <Form.Item label="Room Type" name="room_type" rules={[{ required: true }]} className="first-name-label">
                                <Select
                                    placeholder="Select Room Type"
                                    className="dropdown-second-step"
                                    showSearch
                                    optionFilterProp="children"
                                    onClick={getAllRoomTypes}
                                    loading={roomtype?.length === 0}
                                    onChange={(value) => {
                                        const selectedType = roomtype?.find(rt => rt.id === value);
                                        setSelectedRoomType(value);
                                        if (selectedType) {
                                            form.setFieldsValue({ bed_charges: selectedType.base_price });
                                        }
                                    }}
                                >
                                    {roomtype?.map((rtype) => (
                                        <Option key={rtype.id} value={rtype.id}>
                                            {rtype.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item label="Room Number" name="room_number" rules={[{ required: true }]} className="first-name-label">
                                <Select
                                    placeholder="Select Room Number"
                                    className="dropdown-second-step"
                                    showSearch
                                    optionFilterProp="children"
                                    onClick={getAllRooms}
                                    loading={rooms?.length === 0}
                                    onChange={(value) => {
                                        console.log("Selected Room ID:", value);
                                        setSelectedRoomId(value);
                                    }}
                                >
                                    {rooms?.map((rtype) => (
                                        <Option key={rtype.id} value={rtype.id}>
                                            {rtype.room_number} (Floor {rtype.floors})
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item label="Bed Number" name="bed_number" rules={[{ required: true }]} className="first-name-label">
                                <Select
                                    placeholder="Select Bed Number"
                                    className="dropdown-second-step"
                                    showSearch
                                    optionFilterProp="children"
                                    onClick={getAllbeds}
                                    loading={beds?.length === 0}
                                    onChange={(value) => {
                                        console.log("Selected Bed ID:", value);
                                        setSelectedBedId(value);
                                    }}
                                >
                                    {beds?.map((rtype) => (
                                        <Option key={rtype.id} value={rtype.id}>
                                            {rtype.beds}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                label="Admission Date & Time"
                                name="admitted_at"
                                className="first-name-label"
                            >
                                <DatePicker
                                    format="YYYY-MM-DD"
                                    className="admitted-date"
                                    onChange={onChange}
                                    disabledDate={disabledDate}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item label="Assigned Nurse" name="assigned_nurse" initialValue="nurse_sarah" rules={[{ required: true }]} className="first-name-label">
                                <Select
                                    placeholder="Select a Staff Member"
                                    className="dropdown-second-step"
                                    showSearch
                                    optionFilterProp="children"
                                >
                                    <Option value="nurse_sarah">Nurse Sarah</Option>
                                    <Option value="nurse_john">Nurse John</Option>
                                    <Option value="nurse_emily">Nurse Emily</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item label="Bed Charges per Day" name="bed_charges" className="first-name-label">
                                <Input prefix="₹" type="number" className="input-second-step" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                label="Expected Discharge Date"
                                name="discharged_at"
                                className="first-name-label"
                            >
                                <DatePicker
                                    format="YYYY-MM-DD"
                                    className="admitted-date"
                                    onChange={onChange}
                                    disabledDate={disabledDate}
                                />
                            </Form.Item>
                        </Col>


                    </Row>

                </Form>

            </Card>

            <div className="step-button-wrapper">
                <Button
                    onClick={handleSkip}
                    style={{ borderRadius: 8, width: 80, marginRight: 'auto' }}
                >
                    Skip
                </Button>
                <Button
                    onClick={handleBack}
                    style={{ borderRadius: 8, width: 80 }}
                >
                    Back
                </Button>
                <Button
                    type="primary"
                    onClick={form.submit}
                    style={{ borderRadius: 8, minWidth: 100, fontWeight: 600 }}
                >
                    Submit
                </Button>
            </div>
        </Layout>
    </>
}
export default SecondStep