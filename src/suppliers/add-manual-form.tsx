import { Breadcrumb, Button, Card, Col, DatePicker, Form, Input, Layout, Row, Select, Typography, type DatePickerProps } from "antd"
import '../appointment-step/features/first-step-appointment'
import './add-manual-form.css'
import { CheckOutlined, InfoCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import Sidebar from "../sidebar"
import Header from "../header"
import { Link, Outlet } from "react-router-dom"
const { Option } = Select
function AddManualForm() {

    const [form] = Form.useForm();

    const onFinish = (values: any) => {
        console.log("Form Values:", values);
    };

    return (
        <Layout>
            <Sidebar />
            <Layout>
                <Header />
                <div className="breadcrumb-layout">
                    <Breadcrumb >
                        <Breadcrumb.Item>
                            <Link to='/suppliers'>Suppliers</Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            <Outlet />
                            Add Suppliers
                        </Breadcrumb.Item>
                    </Breadcrumb>
                </div>
                <div className="add-supplier-container">


                    {/* ✅ Proper Card */}
                    <Card className="supplier-card" bordered={false}>
                        <Form form={form} layout="vertical" onFinish={onFinish}>

                            <Form.Item
                                label="Company Name"
                                name="companyName"
                                rules={[{ required: true, message: "Please enter company name" }]}
                            >
                                <Input placeholder="e.g. PharmaCorp Global" />
                            </Form.Item>

                            <Form.Item
                                label="Contact Person"
                                name="contactPerson"
                                rules={[{ required: true, message: "Please enter contact person" }]}
                            >
                                <Input placeholder="Full Name" />
                            </Form.Item>

                            <Row gutter={[16, 16]}>
                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        label="Email"
                                        name="email"
                                        rules={[
                                            { required: true, message: "Please enter email" },
                                            { type: "email", message: "Enter valid email" },
                                        ]}
                                    >
                                        <Input placeholder="contact@supplier.com" />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        label="Phone"
                                        name="phone"
                                        rules={[{ required: true, message: "Please enter phone number" }]}
                                    >
                                        <Input placeholder="+1 (555) 000-0000" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <div className="form-actions">
                                <Button className="cancel-btn">Cancel</Button>

                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    className="submit-btn"
                                >
                                    Save
                                </Button>
                            </div>
                        </Form>
                    </Card>
                </div>
            </Layout>
        </Layout>
    );
}
export default AddManualForm