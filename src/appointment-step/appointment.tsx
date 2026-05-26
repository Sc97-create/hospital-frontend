import React from 'react';
import Sidebar from '../sidebar';
import { Breadcrumb, Layout } from 'antd';
import './appointment.css'
import {
    HomeOutlined,
    UserOutlined,
} from '@ant-design/icons'
import { Link, Outlet } from 'react-router-dom';
import { Content } from 'antd/es/layout/layout';

function Appointment() {
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
                            New Patient
                        </Breadcrumb.Item>
                    </Breadcrumb>
                    <Content className='appointment-layout'>
                        <Outlet />
                    </Content>
                </Layout>
            </Layout >
        </>
    )
}
export default Appointment