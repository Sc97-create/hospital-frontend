import { Button, Col, Form, Input, message, Modal, Radio, Row, Select } from "antd";
import type { CheckboxGroupProps } from "antd/es/checkbox";
import form from "antd/es/form";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CloseCircleOutlined, SearchOutlined } from '@ant-design/icons'
import './add-prescription.css'

interface AddPrescriptionProps {
    open: boolean;
    onClose: () => void;
}

export default function AddPrescription({ open, onClose }: AddPrescriptionProps) {
    const { patientID } = useParams<{ patientID: string }>();
    const [value, setValue] = useState("");
    const [searched, setSearched] = useState(false);
    const handleChange = (value: string) => {
        console.log(`selected ${value}`);
    };

    const handleKeyPress = (e: { key: string; }) => {
        if (e.key === "Enter" && value.trim()) {
            // Simulate search action
            console.log("Searching for:", value);
            setSearched(true);
        }
    };


    const handleClear = () => {
        setValue("");
        setSearched(false);
    };
    const navigate = useNavigate()
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm();




    const handleFinish = (values: any) => {
        console.log('form values', values)
        messageApi.open({
            type: 'success',
            content: 'medicine added successfully'
        })
    }
    return (

        <>
            <div>
                <Modal
                    open={open}

                    closable={{ 'aria-label': 'Custom Close Button' }}
                    onCancel={onClose}
                    footer={
                        <div style={{ display: "flex", justifyContent: "space-between", width: "100%",alignItems:'center' }}>
                            {/* Left Side - Buttons */}
                            <div className="totalcount">
                                <h3>Total Patients: {80}</h3> 
                            </div>
                            <div >
                                <Button key='Add' onClick={() => form.submit()} style={{marginRight:12}} className="add-button">
                                    {contextHolder}
                                    Add
                                </Button>
                                <Button key='Preview' onClick={() => navigate(`/patients/prescription-preview/${patientID}`)} className="preview-button">
                                    Preview
                                </Button>
                            </div>

                            {/* Right Side - Total Count */}

                        </div>}
                >
                    <Form
                        layout="vertical"
                        form={form}
                        onFinish={handleFinish}
                        className="prescription-form"
                    >
                        {/* Medicine Name */}
                        <Row>
                            <Col span={24}>
                                <Form.Item label="Medicine Name" name="medicineName" className="main-freq-input">
                                    <Input
                                        value={value}
                                        className="input-color-layout"
                                        onChange={(e) => setValue(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                        autoComplete="off"
                                        suffix={
                                            searched ? (
                                                <CloseCircleOutlined
                                                    style={{ color: "red", cursor: "pointer" }}
                                                    onClick={handleClear}
                                                />
                                            ) : (
                                                <SearchOutlined />
                                            )
                                        }
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={16}>
                                <Form.Item label="Frequency" className="main-freq-input">
                                    <Form.Item name="morning" noStyle>
                                        <Select
                                            placeholder='0'

                                            options={[
                                                { value: "0", label: "0" },
                                                { value: "1", label: "1" },
                                            ]}

                                            style={{ width: '25%', marginRight: 8 }}
                                        />
                                    </Form.Item>

                                    <Form.Item name="afternoon" noStyle>
                                        <Select
                                            placeholder='0'
                                            options={[
                                                { value: "0", label: "0" },
                                                { value: "1", label: "1" },
                                            ]}
                                            style={{ width: '25%', marginRight: 8 }}
                                        />
                                    </Form.Item>

                                    <Form.Item name="night" noStyle>
                                        <Select
                                            placeholder='0'

                                            options={[
                                                { value: "0", label: "0" },
                                                { value: "1", label: "1" },
                                            ]}
                                            style={{ width: '25%' }}
                                        />
                                    </Form.Item>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="Dosage" name="dosage">
                                    <Input
                                        className="input-color-layout"
                                        placeholder="for ex: 50mg, 500mg"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={16}>
                                <Form.Item label="Duration" className="main-freq-input">

                                    <Form.Item name="durationNumber" noStyle>
                                        <Input
                                            placeholder="5"
                                            style={{ width: '25%', marginRight: 8 }}
                                            className="input-color-layout"
                                        />
                                    </Form.Item>

                                    <Form.Item name="durationUnit" noStyle>
                                        <Select
                                            placeholder='days'
                                            style={{ width: '55%' }}
                                            options={[
                                                { value: "days", label: "Days" },
                                                { value: "weeks", label: "Weeks" },
                                            ]}
                                        />
                                    </Form.Item>

                                </Form.Item>
                            </Col>
                            <Col span={8}>

                                {/* Medicine Type */}
                                <Form.Item label="Medicine Type" name="medicineType">
                                    <Input className="input-color-layout" placeholder="syrup/tablet" />
                                </Form.Item>
                            </Col>
                            <Col span={24}>

                                {/* Food Instruction */}
                                <Form.Item label="Food Instruction" name="foodInstruction">
                                    <Radio.Group>
                                        <Radio value="after_food" style={{ fontSize: 12 }}>After Food</Radio>
                                        <Radio value="before_food" style={{ fontSize: 12 }}>Before Food</Radio>
                                        <Radio value="doesn't_matter" style={{ fontSize: 12 }}>Doesn't Matter</Radio>
                                    </Radio.Group>
                                </Form.Item>
                            </Col>

                        </Row>
                    </Form>

                </Modal>
            </div>
        </>
    )
}