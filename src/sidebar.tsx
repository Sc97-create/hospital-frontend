import { Layout } from 'antd';
import { Button, Menu } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    AppstoreOutlined,
    CalendarOutlined,
    MedicineBoxOutlined,
    MenuFoldOutlined,
    ShopOutlined,
    TeamOutlined,
    UserOutlined,

} from '@ant-design/icons';
import { useMemo, useState, type ReactNode } from 'react';
import './sidebar.css';
import { usePermissions } from './auth/permissions-context';
import type { ModuleName } from './authentication/types/auth';

const { Sider } = Layout;

type SidebarItem = {
    key: string;
    icon: ReactNode;
    label: string;
    module?: ModuleName;
};

const ALL_MENU_ITEMS: SidebarItem[] = [
    {
        key: '/dashboard',
        icon: <AppstoreOutlined />,
        label: 'Overview',
    },
    {
        key: '/patients',
        icon: <TeamOutlined />,
        label: 'Patients',
        module: 'patient',
    },
    {
        key: '/appointments',
        icon: <CalendarOutlined />,
        label: 'Appointmets',
        module: 'appointment',
    },
    {
        key: '/suppliers',
        icon: <ShopOutlined />,
        label: 'Suppliers',
        module: 'medicine',
    },
    {
        key: '/employees',
        icon: <UserOutlined />,
        label: 'Employees',
        module: 'employee',
    },
    {
        key: '/prescription',
        icon: <MedicineBoxOutlined />,
        label: 'Prescription',
        module: 'prescription',
    },
];

function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { canView } = usePermissions();
    const [collapse, setCollapse] = useState(false);
    const [hover, setHover] = useState(false);

    const menuItems = useMemo(
        () =>
            ALL_MENU_ITEMS.filter(
                // Overview / dashboard stays visible regardless of permissions payload
                (item) =>
                    item.key === "/dashboard" ||
                    !item.module ||
                    canView(item.module),
            ).map(({ key, icon, label }) => ({ key, icon, label })),
        [canView],
    );

    const routeMap: Record<'/patients' | '/appointment' | '/suppliers' | '/employees' | '/prescription', string> = {
        '/patients': '/patients',
        '/suppliers': '/suppliers',
        "/employees": '/employees',
        "/prescription": '/prescription',
        "/appointment":'/appointments',
    };

    const matchedKey = (Object.keys(routeMap) as Array<keyof typeof routeMap>).find(
        prefix => location.pathname.startsWith(prefix)
    );
    const selectedKey = [matchedKey ? routeMap[matchedKey] : location.pathname];
    return (
        <>
            <div className="container-fluid">
                <Sider
                    trigger={null}
                    collapsible
                    collapsed={collapse}
                    collapsedWidth={60}
                    width={240}
                    breakpoint="lg"
                    onBreakpoint={(broken) => setCollapse(broken)}
                    className='sidebar-layout'
                >
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
                            type="text"
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
                        items={menuItems}
                    />

                </Sider>
            </div>
        </>
    )
}
export default Sidebar