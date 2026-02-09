import { Card, Col, DatePicker, Form, Input, Layout, Row, Select, Switch, type DatePickerProps } from "antd"
import './second-step-appointment.css'
const { Option } = Select;
function SecondStep() {
    const [form] = Form.useForm();
    const roomtype = [
        { label: 'Deluxe', value: 'deluxe' },
        { label: 'General', value: 'general' },
    ];
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
        <Layout className="scroll-enabled-page">
            <Card className="secondstepcard">
                <div className="bed-allotment">
                    <div className="text-tag">
                        <h2>
                            Bed Allotment
                        </h2>
                        <p>this step is optional, you can proceed with bed admission</p>
                    </div>
                    <div className="emergency-signal">
                        <h3>Emergency Entry</h3>
                    </div>
                </div>
                <hr className="divider" />
                <Form layout="vertical" form={form}>
                    <Row gutter={[0, 0]}>
                        <Col span={12}>
                            <Form.Item label="Room Type" name="room_type" rules={[{ required: true }]} className="first-name-label">
                                <Select
                                    placeholder="Select Room Type"
                                    className="dropdown-second-step"
                                    showSearch
                                    optionFilterProp="children"
                                >
                                    {roomtype.map((rtype) => (
                                        <Option key={rtype.value} value={rtype.value}>
                                            {rtype.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Room Number" name="room_number" rules={[{ required: true }]} className="first-name-label">
                                <Select
                                    placeholder="Select Room Number"
                                    className="dropdown-second-step"
                                    showSearch
                                    optionFilterProp="children"
                                >
                                    {roomtype.map((rtype) => (
                                        <Option key={rtype.value} value={rtype.value}>
                                            {rtype.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Bed Number" name="bed_number" rules={[{ required: true }]} className="first-name-label">
                                <Select
                                    placeholder="Select Bed Number"
                                    className="dropdown-second-step"
                                    showSearch
                                    optionFilterProp="children"
                                >
                                    {roomtype.map((rtype) => (
                                        <Option key={rtype.value} value={rtype.value}>
                                            {rtype.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Admission Date & Time"
                                name="admitted_at"
                                className="first-name-label"
                            >
                                <DatePicker
                                    format="YYYY-MM-DD"
                                    className="admitted-date"
                                    onChange={onChange}
                                    style={{ width: '90%' }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Assigned Nurse" name="assigned_nurse" rules={[{ required: true }]} className="first-name-label">
                                <Select
                                    placeholder="Select a Staff Member"
                                    className="dropdown-second-step"
                                    showSearch
                                    optionFilterProp="children"
                                >
                                    {roomtype.map((rtype) => (
                                        <Option key={rtype.value} value={rtype.value}>
                                            {rtype.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Bed Charges per Day" name="bed_charges" className="first-name-label">
                                <Input prefix="₹" type="number" style={{ width: '90%' }} className="input-form-layout" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Expected Discharge Date"
                                name="discharged_at"
                                className="first-name-label"
                            >
                                <DatePicker
                                    format="YYYY-MM-DD"
                                    className="admitted-date"
                                    onChange={onChange}
                                    style={{ width: '90%' }}
                                />
                            </Form.Item>
                        </Col>


                    </Row>

                </Form>

            </Card>
        </Layout>
    </>
}
export default SecondStep