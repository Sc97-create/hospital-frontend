import React, { useState } from 'react';
import Sidebar from './sidebar';
import { Breadcrumb,  Layout,  Steps } from 'antd';
import { Button } from 'antd';
import './appointment.css'
import {
    HomeOutlined,
    UserOutlined,
} from '@ant-design/icons'
import { Link } from 'react-router-dom';
import { Content } from 'antd/es/layout/layout';
import FirstStep from './appointment-step/first-step-appointment';
import SecondStep from './appointment-step/second-step-appointment';
import PreviewAppointment from './appointment-step/third-step-appointment';

function Appointment() {
    const steps = [
        {
            title: 'Patient Details',
            content: <FirstStep />,
        },
        {
            title: 'Bed Allotment',
            content: <SecondStep/>,
        },
        {
            title: 'Preview And Submit',
            content: <PreviewAppointment/>,
        },
    ];
    const [current, setCurrent] = useState(0);
    const next = () => {
        setCurrent(current + 1);
    };
    //const items = steps.map((item) => ({ key: item.title, title: item.title }));
    const handleSubmit = () => {
        console.log("Appointment submitted successfully!");
        // Example: send API call or WhatsApp notification here
        // toast.success("Appointment confirmed! ID sent to WhatsApp.");
    };
    const prev = () => {
        if (current > 0) {
            setCurrent(current - 1);
        }
    };
    return (

        <>
            <Layout>
                <Sidebar />
                <Layout>
                    <Breadcrumb className='appointment-breadcrumb-layout'>
                        <Breadcrumb.Item>
                            <HomeOutlined />
                            <Link to='/dashboard'>Home</Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            <UserOutlined />
                            <Link to='/patients'>Patient List</Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            Appointment Request
                        </Breadcrumb.Item>
                    </Breadcrumb>
                    <Content className='appointment-layout'>
                        {/* <FirstStep />
                        <div className="button-wrapper">
                            <Button className='submit-appointment-form' onClick={() => {
                                console.log("clicked")
                            }}>Submit</Button>
                        </div> */}
                        <div style={{ maxWidth: 900, margin: "16px" }}>
                            <Steps
                                current={current}

                                items={steps.map((item) => ({ key: item.title, title: item.title }))}
                            />
                        </div>
                        <div style={{ minHeight: "400px" }}>{steps[current].content}</div>

                        {/* Navigation Buttons */}
                        <div
                            className="button-wrapper"
                            style={{
                                marginBottom: 32,
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 12,
                                marginRight: 315,
                            }}
                        >
                            {current < steps.length - 1 && (
                                <>
                                    {current > 0 && (
                                        <Button
                                            onClick={prev}
                                            style={{
                                                borderRadius: 8,
                                                width: 80,
                                            }}
                                        >
                                            Back
                                        </Button>
                                    )}

                                    <Button
                                        type="primary"
                                        onClick={next}
                                        style={{
                                            borderRadius: 8,
                                            backgroundColor: "#25D366",
                                            width: 80,
                                            fontWeight: "600",
                                        }}
                                    >
                                        Next
                                    </Button>
                                </>
                            )}
                            {current === steps.length - 1 && (
                                <>
                                    <Button
                                        onClick={() => setCurrent(0)}
                                        style={{
                                            borderRadius: 8,
                                            width: 80,
                                        }}
                                    >
                                        Edit
                                    </Button>

                                    <Button
                                        type="primary"
                                        onClick={handleSubmit}
                                        style={{
                                            borderRadius: 8,
                                            backgroundColor: "#25D366",
                                            fontWeight: "600",
                                        }}
                                    >
                                        Confirm & Submit
                                    </Button>
                                </>
                            )}
                        </div>



                    </Content>
                </Layout>
            </Layout >
        </>
    )
}
export default Appointment