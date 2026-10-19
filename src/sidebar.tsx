import { Layout, Button, Menu } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { MenuFoldOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import './sidebar.css';
import { usePermissions } from './auth/permissions-context';
import { logoutAndRedirect } from './authentication/logout';
import {
    ALL_MENU_ITEMS,
    LAB_MENU_KEY,
    SETTINGS_MENU,
} from './sidebar/sidebar-data';

const { Sider } = Layout;

function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { can, canView, clearAccess } = usePermissions();
    const [collapse, setCollapse] = useState(false);
    const [hover, setHover] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(
        location.pathname === '/profile' || location.pathname === '/update-password',
    );
    const onLabRoute = location.pathname.startsWith('/lab');
    const [labOpen, setLabOpen] = useState(onLabRoute);

    useEffect(() => {
        if (!collapse && onLabRoute) setLabOpen(true);
    }, [collapse, onLabRoute]);

    const menuItems = useMemo(
        () =>
            ALL_MENU_ITEMS.filter(
                (item) => !item.module || canView(item.module),
            )
                .map(({ key, icon, label, module, children }) => {
                    const visibleChildren = children
                        ?.filter((child) => {
                            const childModule = child.module ?? module;
                            if (!childModule) return true;
                            return can(childModule, child.action ?? 'view');
                        })
                        .map(({ key: childKey, icon: childIcon, label: childLabel }) => ({
                            key: childKey,
                            icon: childIcon,
                            label: childLabel,
                        }));

                    // Hide parent submenu when every child is filtered out
                    if (children && (!visibleChildren || visibleChildren.length === 0)) {
                        return null;
                    }

                    return {
                        key,
                        icon,
                        label,
                        ...(visibleChildren?.length ? { children: visibleChildren } : {}),
                    };
                })
                .filter((item): item is NonNullable<typeof item> => item != null),
        [can, canView],
    );

    const settingsItems = useMemo(() => SETTINGS_MENU, []);

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
    const selectedKey = [
        onLabRoute
            ? location.pathname
            : matchedKey
              ? routeMap[matchedKey]
              : location.pathname,
    ];

    const settingsSelectedKeys =
        location.pathname === '/profile' || location.pathname === '/update-password'
            ? [location.pathname]
            : [];

    const handleMainMenuClick = ({ key }: { key: string }) => {
        if (!key.startsWith('/')) return;
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
                            {...(collapse ? {} : { openKeys: labOpen ? [LAB_MENU_KEY] : [] })}
                            onOpenChange={(keys) => {
                                if (collapse) return;
                                setLabOpen(keys.includes(LAB_MENU_KEY));
                            }}
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
