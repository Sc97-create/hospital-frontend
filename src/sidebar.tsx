import { Layout, Button, Menu } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    AppstoreOutlined,
    CalendarOutlined,
    LockOutlined,
    LogoutOutlined,
    MedicineBoxOutlined,
    MenuFoldOutlined,
    SettingOutlined,
    ShopOutlined,
    TeamOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { useMemo, useState, type ReactNode } from 'react';
import './sidebar.css';
import { usePermissions } from './auth/permissions-context';
import { logoutAndRedirect } from './authentication/logout';
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
        module: 'dashboard',
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

const SETTINGS_CHILDREN = [
    {
        key: '/profile',
        icon: <UserOutlined />,
        label: 'My Profile',
    },
    {
        key: '/update-password',
        icon: <LockOutlined />,
        label: 'Update Password',
    },
    {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: 'Logout',
        danger: true,
    },
];

function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { canView, clearAccess } = usePermissions();
    const [collapse, setCollapse] = useState(false);
    const [hover, setHover] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(
        location.pathname === '/profile' || location.pathname === '/update-password',
    );

    const menuItems = useMemo(
        () =>
            ALL_MENU_ITEMS.filter(
                (item) => !item.module || canView(item.module),
            ).map(({ key, icon, label }) => ({ key, icon, label })),
        [canView],
    );

    const settingsItems = useMemo(
        () => [
            {
                key: 'settings',
                icon: <SettingOutlined />,
                label: 'Settings',
                children: SETTINGS_CHILDREN,
            },
        ],
        [],
    );

    const routeMap: Record<'/patients' | '/appointment' | '/suppliers' | '/employees' | '/prescription', string> = {
        '/patients': '/patients',
        '/suppliers': '/suppliers',
        '/employees': '/employees',
        '/prescription': '/prescription',
        '/appointment': '/appointments',
    };

    const matchedKey = (Object.keys(routeMap) as Array<keyof typeof routeMap>).find(
        (prefix) => location.pathname.startsWith(prefix),
    );
    const selectedKey = [matchedKey ? routeMap[matchedKey] : location.pathname];

    const settingsSelectedKeys =
        location.pathname === '/profile' || location.pathname === '/update-password'
            ? [location.pathname]
            : [];

    const handleMainMenuClick = ({ key }: { key: string }) => {
        navigate(key);
    };

    const handleSettingsClick = ({ key }: { key: string }) => {
        if (key === 'logout') {
            void logoutAndRedirect(navigate, clearAccess);
            return;
        }
        if (key === 'settings') return;
        navigate(key);
    };

    return (
        <div className="container-fluid">
            <Sider
                trigger={null}
                collapsible
                collapsed={collapse}
                collapsedWidth={60}
                width={240}
                breakpoint="lg"
                onBreakpoint={(broken) => setCollapse(broken)}
                className="sidebar-layout"
            >
                <div className="sidebar-inner">
                    <div className="sidebar-top">
                        <div className="logo-layout">
                            <img
                                src={hover ? '/collapse.png' : '/sample-icon.ico'}
                                alt="logo"
                                onMouseEnter={() => collapse && setHover(true)}
                                onMouseLeave={() => collapse && setHover(false)}
                                onClick={() => {
                                    setHover(false);
                                    setCollapse(false);
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
                            className="menu-layout sidebar-main-menu"
                            mode="inline"
                            selectedKeys={selectedKey}
                            onClick={handleMainMenuClick}
                            items={menuItems}
                        />
                    </div>

                    <Menu
                        className="menu-layout sidebar-settings-menu"
                        mode="inline"
                        selectedKeys={settingsSelectedKeys}
                        openKeys={settingsOpen ? ['settings'] : []}
                        onOpenChange={(keys) => setSettingsOpen(keys.includes('settings'))}
                        onClick={handleSettingsClick}
                        items={settingsItems}
                    />
                </div>
            </Sider>
        </div>
    );
}

export default Sidebar;
