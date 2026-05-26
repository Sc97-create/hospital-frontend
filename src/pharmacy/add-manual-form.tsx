import { Button, Col, DatePicker, Form, Input, Row, Select, type DatePickerProps } from "antd"
import '../appointment-step/features/first-step/first-step-appointment'
import './add-manual-form.css'
import { CheckOutlined, InfoCircleOutlined } from '@ant-design/icons'
const { Option } = Select
function AddManualForm() {
    const [form] = Form.useForm();
    const medicineForm = [
        { label: 'Capsule', value: 'capsule' },
        { label: 'Syrup', value: 'syrup' }
    ]
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
    return (
        <>
            <Form
                layout="vertical"
                form={form}
            >
                <Row gutter={[16, 0]}>
                    <Col span={24}>
                        <Form.Item label="Medicine Name" className="first-name-label">
                            <Input placeholder="add medicine" className="manual-input-form-layout" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Form" rules={[{ required: true }]} className="first-name-label">
                            <Select
                                placeholder="capsule"
                                className="manual-input-dropdown"
                                optionFilterProp="children"
                                placement="bottomLeft"
                            >
                                {medicineForm.map((medi) => (
                                    <Option key={medi.value} value={medi.value}>
                                        {medi.label}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Strength" className="first-name-label">
                            <Input placeholder="500mg" className="manual-input-sub-class" />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item label="Batch Number" className="first-name-label">
                            <Input placeholder="BATCH-001" className="manual-input-form-layout" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Expiry Date" className="first-name-label">
                            <DatePicker
                                format="YYYY-MM-DD"
                                className="admitted-date"
                                onChange={onChange}
                                style={{ width: '90%' }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Quantity" className="first-name-label">
                            <Input placeholder="250" className="manual-input-sub-class" />
                        </Form.Item>
                    </Col>
                </Row>
                <div className="note-tag">
                  <p>  <InfoCircleOutlined style={{ marginRight: 8 }} /> Adding this entry will immediately update the inventory table, please make sure the batch no is correct</p>
                </div>
            </Form>
            <div className="add-manual-form-buttons">
                <Button size="small" className="cancel-button">
                    Cancel
                </Button>
                <Button size="small" icon={<CheckOutlined />} className="inventory-button">
                    Save to Inventory
                </Button>
            </div>
        </>
    )
}
export default AddManualForm