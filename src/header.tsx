
import { Layout, Dropdown, Space } from 'antd'
import './header.css'
const { Header } = Layout
import {
    DownOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { logoutAndRedirect } from './authentication/logout'
import { usePermissions } from './auth/permissions-context'

function HeaderLayout() {
    const navigate = useNavigate()
    const { clearAccess } = usePermissions()

    const items = [
        {
            key: 'my-profile',
            label: 'My Profile',
            onClick: () => navigate('/profile'),
        },
        {
            key: 'update-password',
            label: 'Update Password',
            onClick: () => navigate('/update-password'),
        },
        {
            key: 'logout',
            label: 'Logout',
            onClick: () => {
                void logoutAndRedirect(navigate, clearAccess)
            },
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
