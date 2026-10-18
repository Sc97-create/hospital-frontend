import {
    AppstoreOutlined,
    CalendarOutlined,
    ExperimentOutlined,
    LockOutlined,
    LogoutOutlined,
    MedicineBoxOutlined,
    SettingOutlined,
    ShopOutlined,
    TeamOutlined,
    UserOutlined,
} from '@ant-design/icons';
import type { ReactNode } from 'react';
import type { ModuleName } from '../authentication/types/auth';

export type SidebarChild = {
    key: string;
    icon?: ReactNode;
    label: string;
    /** Optional module gate for submenu items (defaults to parent module). */
    module?: ModuleName;
    /** Optional action required to show this child; defaults to view. */
    action?: 'view' | 'create' | 'update' | 'delete';
};

export type SidebarItem = {
    key: string;
    icon: ReactNode;
    label: string;
    module?: ModuleName;
    children?: SidebarChild[];
};

export const ALL_MENU_ITEMS: SidebarItem[] = [
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
    {
        key: 'lab',
        icon: <ExperimentOutlined />,
        label: 'Lab',
        /** No separate diagnostic_centre module — both Lab children use lab_order. */
        module: 'lab_order',
        children: [
            {
                key: '/lab/tests',
                label: 'Tests',
                module: 'lab_order',
                action: 'view',
            },
            {
                // No diagnostic_centre module from backend — only show to users who can create lab resources.
                key: '/lab/diagnostic-center',
                label: 'Diagnostic Center',
                module: 'lab_order',
                action: 'create',
            },
        ],
    },
];

export const SETTINGS_CHILDREN = [
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

export const SETTINGS_MENU = [
    {
        key: 'settings',
        icon: <SettingOutlined />,
        label: 'Settings',
        children: SETTINGS_CHILDREN,
    },
];

export const LAB_MENU_KEY = 'lab';
