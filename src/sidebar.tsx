import React from 'react';
import { Layout } from 'antd';
import { Button, Menu } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    AppstoreOutlined,
    MedicineBoxOutlined,
    MenuFoldOutlined,
    ShopOutlined,
    TeamOutlined,
    UserOutlined,

} from '@ant-design/icons';
import { useState } from 'react';
import './sidebar.css';
const { Sider } = Layout
function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [collapse, setCollapse] = useState(false)
    const [hover, setHover] = useState(false);
    const routeMap: Record<'/patients' | '/appointment' | '/suppliers' | '/employees' | '/bed-arrangement' | '/prescription', string> = {
        '/patients': '/patients',
        '/appointment': '/appointment',
        '/suppliers': '/suppliers',
        "/employees": '/employees',
        "/bed-arrangement": '/bed-arrangement',
        "/prescription": '/prescription'
    };

    const matchedKey = (Object.keys(routeMap) as Array<keyof typeof routeMap>).find(
        prefix => location.pathname.startsWith(prefix)
    );
    const selectedKey = [matchedKey ? routeMap[matchedKey] : location.pathname];
    return (
        <>
            <div className="container-fluid">
                <Sider trigger={null} collapsible collapsed={collapse} collapsedWidth={60} className='sidebar-layout'>
                    <div className="logo-layout">
                        <img src={hover ? "/collapse.png" : "/sample-icon.ico"}
                            alt="logo"
                            onMouseEnter={() => collapse && setHover(true)}
                            onMouseLeave={() => collapse && setHover(false)}
                            onClick={() => {
                                setHover(false)
                                setCollapse(false)
                            }}
                            style={{ cursor: 'pointer' }}
                        />
                        {!collapse && (
                            <Button
                                icon={<MenuFoldOutlined />}
                                onClick={() => setCollapse(true)}

                            />
                        )}


                    </div>
                    <Menu
                        defaultSelectedKeys={['1']}
                        className='menu-layout'
                        mode='inline'
                        selectedKeys={selectedKey}
                        onClick={({ key }) => navigate(key)}

                        items={[
                            {
                                key: '/dashboard',
                                icon: <AppstoreOutlined />,
                                label: 'Overview',
                            },
                            {
                                key: '/patients',
                                icon: <TeamOutlined />,
                                label: 'Patients',
                            },
                            {
                                key: '/suppliers',
                                icon: <ShopOutlined />,
                                label: 'Suppliers',
                            },
                            {
                                key: '/employees',
                                icon: <UserOutlined />,
                                label: 'Employees'
                            },
                            {
                                key: '/bed-arrangement',
                                icon: <UserOutlined />,
                                label: 'Bed Arrangement'
                            },
                            {
                                key: '/prescription',
                                icon: <MedicineBoxOutlined />,
                                label: 'Prescription'
                            }
                        ]}
                    />

                </Sider>
            </div>
        </>
    )
}
export default Sidebar