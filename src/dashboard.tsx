import { Flex, Layout, Avatar } from 'antd'
import { Button, Row, Col, Card, List, Skeleton, Badge } from 'antd';
import { useNavigate } from "react-router-dom";
import './dashboard.css'
import { useState } from 'react';
import Sidebar from './sidebar';
import HeaderLayout from './header';
const { Content } = Layout
const patientData = [
    {
        'avatar': '/user.png',
        'title': 'sachin chate',
        'age': 27,
        'sex': 'male',
        'doctor':'Rajesh Sangolli'
    },
    {
        'avatar': '/user.png',
        'title': 'manjunath patil',
        'age': 27,
        'sex': 'female',
        'doctor':'Rajesh sangolli'
    },
    {
        'avatar': '/user.png',
        'title': 'rajesh sangolli',
        'age': 27,
        'sex': 'male',
        'doctor':'rajesh sangolli'
    },
    {
        'avatar': '/user.png',
        'title': 'satish rudragoudar',
        'age': 27,
        'sex': 'male',
        'doctor':'rajesh sangolli'
    },
    {
        'avatar': '/user.png',
        'title': 'manjunath patil',
        'age': 27,
        'sex': 'male',
        'doctor':'rajesh sangolli'
    },
    {
        'avatar': '/user.png',
        'title': 'basavaraj sankeshwari',
        'age': 27,
        'sex': 'male',
        'doctor':'rajesh sangolli'
    }
]

function Dashboard() {
    const navigate=useNavigate();
    const [collapse] = useState(false)
    const [visibleCount, setVisibleCount] = useState(2);
    const handleLoadMore = () => {
        setVisibleCount(prev => Math.min(prev + 2, patientData.length));
    };
    const visiblePatients = patientData.slice(0, visibleCount);
    return (
        <>
            <div className="container-fluid">
                <Flex gap={"middle"} wrap>
                    <Layout>
                        <Sidebar/>
                        <Layout>
                            <HeaderLayout/>
                            <Content className='content-layout'>
                                <Row gutter={[8, 8]} className={`first-row ${collapse ? 'collapsed-row' : ''}`} wrap={false}>
                                    <Col span={6}>
                                        <p className="card-section-label">Current Patients</p>

                                        <Card className='first-card'>
                                            <List
                                                itemLayout='horizontal'
                                                dataSource={visiblePatients}
                                                className='list-layout'
                                                renderItem={(item) => (
                                                    <List.Item
                                                    >
                                                        <Skeleton avatar title={false} loading={false} className='skeleton-layout' active>
                                                            <List.Item.Meta
                                                                avatar={<Avatar src={item.avatar} />}
                                                                title={<div className='title-class'>
                                                                    <span className="list-item-title">{item.title}</span>
                                                                </div>}
                                                                description={
                                                                    <div className='description-class'>
                                                                        <Badge color="green" text={`Dr. ${item.doctor}`} />
                                                                    </div>}
                                                            />

                                                        </Skeleton>
                                                    </List.Item>
                                                )}
                                            />
                                            {visibleCount < patientData.length && (
                                                <div className='load-more-button'>
                                                    <Button onClick={handleLoadMore}>Load More</Button>
                                                </div>
                                            )}
                                        </Card>
                                    </Col>
                                    <Col span={6}>
                                        <p className="card-section-label">Upcoming Patient</p>
                                        <Card className='first-card'>

                                        </Card>

                                    </Col>
                                    <Col span={6}>
                                        <p className="card-section-label">Total Patient</p>
                                        <Card className='first-card'>

                                        </Card>
                                    </Col>
                                    <Col span={6}>
                                        <p className="card-section-label">Quick Add</p>
                                        <Card className='special-card'>
                                            <h2>Add New Patient</h2>
                                            <div className="add-img" onClick={() => navigate('/patients/add-patient')} style={{ cursor: 'pointer' }}>
                                                <img src="/add.png" alt="add" />
                                            </div>
                                        </Card>
                                    </Col>
                                </Row>
                            </Content>
                        </Layout>
                    </Layout>
                </Flex>


            </div>
        </>
    )
}
export default Dashboard
