import { Layout, Breadcrumb, Form, Input, Select, Button, } from "antd"
import { Link } from "react-router-dom"
import Header from "../../header"
import Sidebar from "../../sidebar"
import { Content } from "antd/es/layout/layout"
import FormItem from "antd/es/form/FormItem"
import './add-employee.css'
import { useState } from "react"
import AddPermission from "../add-permissions/add-permission"

function AddEmployee() {
    const [form] = Form.useForm()
    const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false)
    return (
        <>
            <Layout>
                <Sidebar />
                <Layout>

                    <div className="breadcrumb-layout">
                        <Breadcrumb>
                            <Breadcrumb.Item>
                                <Link to={'/employees'}>Employees</Link>
                            </Breadcrumb.Item>
                            <Breadcrumb.Item>
                                Add Employee
                            </Breadcrumb.Item>
                        </Breadcrumb>
                    </div>
                    <Content className="addpharma">
                        <h2>Add Employee</h2>
                        <div className="pharma-form">
                            <Form layout="vertical" form={form}>
                                <Form.Item label="Full Name" >
                                    <Input placeholder="enter full name" className="pharma-input" />
                                </Form.Item>
                                <Form.Item label="Role">
                                    <Select
                                        style={{ width: 400, height: 40, borderRadius: 8 }}
                                        defaultValue='Select Role'
                                        options={
                                            [
                                                { value: 'attendant', label: 'Attendant' },
                                                { value: 'pharmacist', label: 'Pharmacist' },
                                                { value: 'doctor', label: 'Doctor' },
                                                { value: 'nurse', label: 'Nurse' },
                                                { value: 'administrator', label: 'Administrator' },
                                                { value: 'technician', label: 'Technician' }
                                            ]
                                        }
                                    />
                                </Form.Item>
                                <Form.Item label="Department">
                                    <Select
                                        defaultValue='Select Department'
                                        style={{ width: 400, height: 40, borderRadius: 8 }}
                                        options={
                                            [
                                                { value: 'oncology', label: 'Oncology' },
                                                { value: 'cardiology', label: 'Cardiology' },
                                                { value: 'human_resource', label: 'Human Resource' },
                                                { value: 'emergency_medicine', label: 'Emergency Medicine' },
                                                { value: 'pediatrics', label: 'Pediatrics' },
                                                { value: 'pharmaceutical_service', label: 'Pharmaceutical Services' }
                                            ]
                                        }
                                    />
                                </Form.Item>
                                <Form.Item label="Email ID">
                                    <Input type="email" placeholder="enter email address" className="pharma-input" />
                                </Form.Item>
                                <Form.Item label="Phone number">
                                    <Input type="number" placeholder="please add contact number" className="pharma-input" />
                                </Form.Item>
                                <Form.Item label="Address">
                                    <Input type="text" placeholder="we need your address" className="pharma-input" />
                                </Form.Item>
                            </Form>
                        </div>
                        <div className="add-emp-button-class">
                            <Button className="preview-button">
                                Cancel
                            </Button>
                            <Button className="invite-emp-button" onClick={() => setIsPermissionModalOpen(true)}>
                                Invite Employee
                            </Button>
                        </div>
                        <AddPermission

                            open={isPermissionModalOpen}
                            onClose={() => setIsPermissionModalOpen(false)}
                        />
                    </Content>

                </Layout>
            </Layout>
        </>
    )
}

export default AddEmployee