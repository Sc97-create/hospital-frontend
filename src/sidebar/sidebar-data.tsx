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
        children: [
            {
                key: '/lab/tests',
                label: 'Tests',
            },
            {
                key: '/lab/diagnostic-center',
                label: 'Diagnostic Center',
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
