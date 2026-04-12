import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Input, Button, Steps } from 'antd';
import { CheckCircleFilled, LoadingOutlined, LogoutOutlined, SolutionOutlined, UserOutlined } from '@ant-design/icons';
import './signup.css'
import { Content } from 'antd/es/layout/layout';
import FirstStep from './signup-step/features/first-step/first-step';
import SecondStep from './signup-step/features/second-step/second-step';
import ThirdStep from './signup-step/features/third-step/third-step';
import ReviewAndCreate from './signup-step/features/fourth-step/fourth-step';
import { useNavigate } from 'react-router-dom';
import { GetByOrganisationID, GetUserbyID } from './signup-step/api/common-api';


function Signup() {
    const [organisationID, setOrganisationID] = useState<string | ''>('');
    const [userID, setUserID] = useState<string | ''>('');
    const [organisationData, setOrganisationData] = useState(null);
    const [userData, setUserData] = useState(null);
    const [refreshOrg, setRefreshOrg] = useState(0);
    const navigate = useNavigate();
    const handleSaveAndExit = () => {
        console.log("Save & Exit clicked");
        navigate('/login')
    };
    const fetchorganisationData = async () => {
        try {
            if (organisationID) {
                console.log("org", organisationID);
                const data = await GetByOrganisationID(organisationID)
                setOrganisationData(data.data)
                console.log("organisation25=>", data.data)
            }
        } catch (error) {
            console.log("api error", error)
        };

    }
    useEffect(() => {
        console.log("organisationID", organisationID)
        if (organisationID) {
            fetchorganisationData();
        }
        if (userID) {
            FetchUserData();
        }
    }, [organisationID, userID, refreshOrg]);

    const FetchUserData = async () => {
        try {
            if (userID) {
                console.log("userID", userID)
                const data = await GetUserbyID(userID)
                setUserData(data.data)
            }
        } catch (error) {
            console.log('error', error)
        };
    }


    const [current, setCurrent] = useState(0);
    const steps = [
        {
            title: 'Organisation',
            content: <FirstStep
                data={organisationData}
                onSuccess={(orgId: string) => {
                    setOrganisationID(orgId);
                }}
                OnNext={() => setCurrent(1)}
            />,
            icon: <CheckCircleFilled />
        },
        {
            title: 'Location',
            content: <SecondStep data={organisationData}
                OnUpdate={() => {
                    setRefreshOrg(refreshOrg + 1);
                }}
                organisationID={organisationID} onBack={() => setCurrent(0)}
                onNext={() => setCurrent(2)} />,
            icon: <UserOutlined />
        },
        {
            title: 'Root Admin',
            content: <ThirdStep onSuccess={(userId: string) => {
                setUserID(userId);
            }} organisationID={organisationID} onBack={() => setCurrent(1)}
                onNext={() => setCurrent(3)} data={userData} />,
            icon: <SolutionOutlined />
        },
        {
            title: 'Review',
            content: <ReviewAndCreate Userdata={userData} OrgData={organisationData} onBack={() => setCurrent(2)} />,
            icon: <LoadingOutlined />
        }
    ];
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