import React, { useState } from 'react';
import { Row, Col, Form, Input, Button, Steps } from 'antd';
import { CheckCircleFilled, LoadingOutlined, LogoutOutlined, SolutionOutlined, UserOutlined } from '@ant-design/icons';
import './signup.css'
import { Content } from 'antd/es/layout/layout';
import FirstStep from './signup-step/features/first-step/first-step';
import SecondStep from './signup-step/second-step';
import ThirdStep from './signup-step/third-step';
import ReviewAndCreate from './signup-step/fourth-step';
import { useNavigate } from 'react-router-dom';


function Signup() {
    const navigate = useNavigate();
    const handleSaveAndExit = () => {
        console.log("Save & Exit clicked");
        navigate('/login')
    };
    const [current, setCurrent] = useState(0);
    const steps = [
        {
            title: 'Organisation',
            content: <FirstStep onNext={() => setCurrent(1)} />,
            icon: <CheckCircleFilled />
        },
        {
            title: 'Location',
            content: <SecondStep onBack={() => setCurrent(0)}
                onNext={() => setCurrent(2)} />,
            icon: <UserOutlined />
        },
        {
            title: 'Root Admin',
            content: <ThirdStep onBack={() => setCurrent(1)}
                onNext={() => setCurrent(3)} />,
            icon: <SolutionOutlined />
        },
        {
            title: 'Review',
            content: <ReviewAndCreate onBack={() => setCurrent(2)} />,
            icon: <LoadingOutlined />
        }
    ];

    /*
      need to add row to form
      need to add plan with inputs 6 month is valid and then it goes on and year,month
    */
    // const [form] = Form.useForm();
    // const [password, setPassword] = React.useState('');
    // const validateStrongPassword = (_: any, value: string) => {
    //     if (!value) return Promise.resolve();

    //     const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    //     setPassword(value)
    //     if (!strongPasswordRegex.test(value)) {
    //         return Promise.reject(
    //             'Password must be at least 8 characters long and include uppercase, lowercase, and a number.'
    //         );
    //     }

    //     return Promise.resolve();
    // };

    return (
        <>
            <div className="container-fluid">
                <div className="signup-header">
                    <div className="logo">
                        <p className='app-title'>Hospital Management System</p>
                        <p className="save-exit">
                            <LogoutOutlined />
                            <span
                                onClick={handleSaveAndExit}>Save & Exit</span>
                        </p>
                    </div>
                </div>
                <Content className='next-steps'>
                    <div className='steps-wrapper'>
                        <Steps
                            current={current}
                            className='steps-gap'
                            items={steps.map((item) => ({ key: item.title, title: item.title, icon: item.icon }))}
                        />
                        <div className='content-layout'>
                            {steps[current].content}
                        </div>
                    </div>

                </Content>
            </div>
        </>
    )
}
export default Signup