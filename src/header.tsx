
import React from 'react';
import {  Layout, Dropdown, Space } from 'antd'
import './header.css'
const { Header } = Layout
import{
    DownOutlined,
} from '@ant-design/icons'
const items = [
    {
        label: (
            <a target="_blank" rel="noopener noreferrer" href="https://www.antgroup.com">
                Logout
            </a>
        ),
        key: '0'
    },
    {
        label: (
            <a target="_blank" rel="noopener noreferrer" href="https://www.antgroup.com">
                Settings
            </a>
        ),
        key: '1'
    }
]
function HeaderLayout() {
    return (
        <>
            <div className="container-fluid">
                <Header className='header-layout'>
                    <img src="/bell.png" alt="notification-icon" />
                    <div className="account-class">
                        <img src="/user.png" alt="account-user" />
                        <Dropdown menu={{ items }} className='drop-down-class' trigger={['click']}>
                            <a onClick={(e) => e.preventDefault()}>
                                <Space>
                                    <h3>Dr Hiremath</h3>
                                    <DownOutlined />
                                </Space>
                            </a>
                        </Dropdown>

                    </div>


                </Header>
            </div>
        </>
    )
}

export default HeaderLayout;