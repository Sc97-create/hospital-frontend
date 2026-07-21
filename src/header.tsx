
import { Layout, Dropdown, Space } from 'antd'
import './header.css'
const { Header } = Layout
import {
    DownOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { logoutAndRedirect } from './authentication/logout'

function HeaderLayout() {
    const navigate = useNavigate()

    const items = [
        {
            key: 'logout',
            label: 'Logout',
            onClick: () => {
                void logoutAndRedirect(navigate)
            },
        },
        {
            key: 'settings',
            label: 'Settings',
        },
    ]

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
