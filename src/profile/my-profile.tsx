import { Avatar, Breadcrumb, Button, Card, Layout, Spin, Typography, message } from "antd";
import { CopyOutlined, HomeOutlined, UserOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Content } from "antd/es/layout/layout";

import Sidebar from "../sidebar";
import { StatusTag } from "../components/status-tag";
import { getEmployeeStatusType } from "../constants/status-colors";
import { GetUserbyID } from "../signup-step/api/common-api";
import type { UserData } from "../signup-step/types/common-api";
import "./my-profile.css";

const { Text } = Typography;

function displayValue(value: string | number | null | undefined): string {
    if (value === null || value === undefined) return "—";
    const text = String(value).trim();
    return text || "—";
}

function getInitials(firstName?: string, lastName?: string, fullName?: string): string {
    const first = firstName?.trim();
    const last = lastName?.trim();
    if (first && last) {
        return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
    }
    if (first) return first.charAt(0).toUpperCase();
    if (last) return last.charAt(0).toUpperCase();
    if (fullName?.trim()) {
        const parts = fullName.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    }
    return "?";
}

function formatStatusLabel(status: string | undefined | null): string {
    if (!status?.trim()) return "Active";
    return status
        .trim()
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function isDoctorRole(roleName?: string): boolean {
    if (!roleName?.trim()) return false;
    return /\b(doctor|dr\.?|physician|surgeon)\b/i.test(roleName);
}

function getDisplayName(user: UserData): string {
    const first = user.employee_first_name?.trim() ?? "";
    const last = user.employee_last_name?.trim() ?? "";
    const full =
        [first, last].filter(Boolean).join(" ") ||
        user.employee_name?.trim() ||
        "";
    if (!full) return "—";
    if (isDoctorRole(user.role_name) && !/^dr\.?\s/i.test(full)) {
        return `Dr. ${full}`;
    }
    return full;
}

function ProfileField({
    label,
    value,
    copyable,
    onCopy,
}: {
    label: string;
    value: string;
    copyable?: boolean;
    onCopy?: (text: string) => void;
}) {
    const canCopy = copyable && value !== "—";

    return (
        <div className="my-profile-field">
            <span className="my-profile-label">{label}</span>
            <div className="my-profile-value-row">
                <span className="my-profile-value">{value}</span>
                {canCopy ? (
                    <Button
                        type="text"
                        size="small"
                        className="my-profile-copy-btn"
                        icon={<CopyOutlined />}
                        aria-label={`Copy ${label}`}
                        onClick={() => onCopy?.(value)}
                    />
                ) : null}
            </div>
        </div>
    );
}

function MyProfilePage() {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        const userId = localStorage.getItem("user_id");
        if (!userId) {
            setError("Missing user — please log in again");
            setLoading(false);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);

        GetUserbyID(userId)
            .then((response) => {
                if (cancelled) return;
                if (!response?.data) {
                    throw new Error(response?.message || "Failed to load profile");
                }
                if (response.code != null && String(response.code) !== "200") {
                    throw new Error(response.message || "Failed to load profile");
                }
                setUser(response.data);
            })
            .catch((err) => {
                if (cancelled) return;
                console.error("Failed to load profile:", err);
                const msg = "Failed to load profile";
                setError(msg);
                messageApi.error(msg);
                setUser(null);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [messageApi]);

    const status = user?.employee_status || "active";

    const handleCopyEmail = async (email: string) => {
        try {
            await navigator.clipboard.writeText(email);
            messageApi.success("Email copied");
        } catch (error) {
            console.error("Failed to copy email:", error);
            messageApi.error("Could not copy email");
        }
    };

    return (
        <Layout>
            {contextHolder}
            <Sidebar />
            <Layout>
                <Breadcrumb
                    className="my-profile-breadcrumb"
                    items={[
                        { href: "/dashboard", title: <HomeOutlined /> },
                        { title: <Link to="/dashboard">Home</Link> },
                        {
                            title: (
                                <>
                                    <UserOutlined />
                                    <span> My Profile</span>
                                </>
                            ),
                        },
                    ]}
                />
                <Content className="my-profile-content">
                    {loading ? (
                        <div className="my-profile-loading">
                            <Spin size="large" />
                        </div>
                    ) : error && !user ? (
                        <div className="my-profile-error">
                            <Text type="danger">{error}</Text>
                        </div>
                    ) : (
                        <div className="my-profile-wrapper">
                            <Card className="my-profile-card">
                                <div className="my-profile-header">
                                    <Avatar size={80} className="my-profile-avatar">
                                        {getInitials(
                                            user?.employee_first_name,
                                            user?.employee_last_name,
                                            user?.employee_name,
                                        )}
                                    </Avatar>
                                    <div className="my-profile-header-main">
                                        <div className="my-profile-name-row">
                                            <h2>{user ? getDisplayName(user) : "—"}</h2>
                                            <StatusTag type={getEmployeeStatusType(status)} bordered>
                                                {formatStatusLabel(status)}
                                            </StatusTag>
                                        </div>
                                        <div className="my-profile-meta">
                                            <span>
                                                <b>Employee ID:</b>{" "}
                                                {displayValue(user?.employee_code)}
                                            </span>
                                            <span>
                                                <b>Department:</b>{" "}
                                                {displayValue(user?.department_name)}
                                            </span>
                                            <span>
                                                <b>Designation:</b>{" "}
                                                {displayValue(user?.role_name)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card className="my-profile-card" title="Personal Information">
                                <div className="my-profile-grid">
                                    <ProfileField
                                        label="First Name"
                                        value={displayValue(user?.employee_first_name)}
                                    />
                                    <ProfileField
                                        label="Last Name"
                                        value={displayValue(user?.employee_last_name)}
                                    />
                                    <ProfileField
                                        label="Email Address"
                                        value={displayValue(user?.employee_email)}
                                        copyable
                                        onCopy={handleCopyEmail}
                                    />
                                    <ProfileField
                                        label="Mobile Number"
                                        value={displayValue(user?.employee_phone)}
                                    />
                                </div>
                            </Card>

                            <Card className="my-profile-card" title="Professional Details">
                                <div className="my-profile-grid">
                                    <ProfileField
                                        label="Department"
                                        value={displayValue(user?.department_name)}
                                    />
                                    <ProfileField
                                        label="Designation"
                                        value={displayValue(user?.role_name)}
                                    />
                                    <ProfileField
                                        label="Employee Code"
                                        value={displayValue(user?.employee_code)}
                                    />
                                    <ProfileField
                                        label="Status"
                                        value={formatStatusLabel(user?.employee_status)}
                                    />
                                </div>
                            </Card>
                        </div>
                    )}
                </Content>
            </Layout>
        </Layout>
    );
}

export default MyProfilePage;
