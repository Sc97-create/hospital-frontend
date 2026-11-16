import { Layout, Button, Menu, Drawer, Grid } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { MenuFoldOutlined, MenuOutlined } from '@ant-design/icons';
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
    const screens = Grid.useBreakpoint();
    /** Only switch to drawer once Ant confirms viewport is below `md` (768px). */
    const isMobile = screens.md === false;
    const { can, canView, clearAccess } = usePermissions();
    const [collapse, setCollapse] = useState(false);
    const [hover, setHover] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(
        location.pathname === '/profile' || location.pathname === '/update-password',
    );
    const onLabRoute = location.pathname.startsWith('/lab');
    const [labOpen, setLabOpen] = useState(onLabRoute);

    useEffect(() => {
        if (!collapse && onLabRoute) setLabOpen(true);
    }, [collapse, onLabRoute]);

    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        if (!isMobile) setMobileOpen(false);
    }, [isMobile]);

    useEffect(() => {
        document.body.classList.toggle('mobile-shell', isMobile);
        return () => {
            document.body.classList.remove('mobile-shell');
        };
    }, [isMobile]);

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
        setMobileOpen(false);
    };

    const handleSettingsClick = ({ key }: { key: string }) => {
        if (key === 'logout') {
            void logoutAndRedirect(navigate, clearAccess);
            return;
        }
        if (key === 'settings') return;
        navigate(key);
        setMobileOpen(false);
    };

    const sidebarBody = (
        <div className="sidebar-inner">
            <div className="sidebar-top">
                <div className="logo-layout">
                    <img
                        src={hover ? '/collapse.png' : '/sample-icon.ico'}
                        alt="logo"
                        onMouseEnter={() => !isMobile && collapse && setHover(true)}
                        onMouseLeave={() => !isMobile && collapse && setHover(false)}
                        onClick={() => {
                            if (isMobile) return;
                            setHover(false);
                            setCollapse(false);
                        }}
                        style={{ cursor: isMobile ? 'default' : 'pointer' }}
                    />
                    {!isMobile && !collapse ? (
                        <Button
                            type="text"
                            icon={<MenuFoldOutlined />}
                            onClick={() => setCollapse(true)}
                            aria-label="Collapse sidebar"
                        />
                    ) : null}
                </div>
                <Menu
                    className="menu-layout sidebar-main-menu"
                    mode="inline"
                    selectedKeys={selectedKey}
                    {...(collapse && !isMobile ? {} : { openKeys: labOpen ? [LAB_MENU_KEY] : [] })}
                    onOpenChange={(keys) => {
                        if (collapse && !isMobile) return;
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
    );

    if (isMobile) {
        return (
            <>
                <div className="mobile-topbar">
                    <Button
                        type="text"
                        className="mobile-topbar__menu"
                        icon={<MenuOutlined />}
                        onClick={() => setMobileOpen(true)}
                        aria-label="Open navigation"
                    />
                    <span className="mobile-topbar__brand">Floato</span>
                </div>
                <Drawer
                    placement="left"
                    open={mobileOpen}
                    onClose={() => setMobileOpen(false)}
                    width={280}
                    className="mobile-sidebar-drawer"
                    styles={{ body: { padding: 0 } }}
                    title={null}
                    closable={false}
                >
                    <div className="sidebar-layout sidebar-layout--drawer">
                        {sidebarBody}
                    </div>
                </Drawer>
            </>
        );
    }

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
                {sidebarBody}
            </Sider>
        </div>
    );
}

export default Sidebar;
