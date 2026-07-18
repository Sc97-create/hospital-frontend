import React, { useState, useEffect, useRef } from "react";
import {
    Table,
    Input,
    Select,
    Tag,
    Typography,
    Pagination,
    Layout,
    Breadcrumb,
    Button,
    message,
    Dropdown,
} from "antd";
import {
    SearchOutlined,
    HomeOutlined,
    DownOutlined,
    LoadingOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import "./appointment-list.css";
import Sidebar from "../../sidebar";
import { Content } from "antd/es/layout/layout";
import { Link, useNavigate } from "react-router-dom";
import { GetDoctors } from "../../shared/api/shared-api";
import { GetAppointmentsByOrganisationID, updateStatus } from "../api/appointments";
import type { AppointmentOrg } from "../types/appointments";

const { Title, Text } = Typography;
const SEARCH_DEBOUNCE_MS = 400;

interface Doctor {
    id: string;
    username: string;
}

const APPOINTMENT_STATUS_OPTIONS = [
    { value: "scheduled", label: "Scheduled", color: "green" },
    { value: "upcoming", label: "Upcoming", color: "cyan" },
    { value: "ongoing", label: "Ongoing", color: "gold" },
    { value: "completed", label: "Completed", color: "success" },
    { value: "cancelled", label: "Cancelled", color: "red" },
    { value: "reschedule_required", label: "Reschedule Required", color: "orange" },
    { value: "missed", label: "Missed", color: "volcano" },
] as const;

const getVisitTag = (type: string) => {
    switch (type) {
        case "new_patient":
            return <Tag color="blue">New Patient</Tag>;

        case "follow_up":
            return <Tag color="purple">Follow Up</Tag>;

        case "opd":
            return <Tag color="orange">OPD</Tag>;

        default:
            return <Tag color="blue">New Patient</Tag>;
    }
};

const getStatusMeta = (status: string) => {
    return (
        APPOINTMENT_STATUS_OPTIONS.find((opt) => opt.value === status) ?? {
            value: status,
            label: status,
            color: "default",
        }
    );
};

const getStatusTag = (status: string) => {
    const match = getStatusMeta(status);
    return <Tag color={match.color}>{match.label}</Tag>;
};
//add appointment code
//send appointmentid
const AppointmentsPage: React.FC = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState<number | undefined>();
    const [selectedDate, setSelectedDate] = useState<string | undefined>();
    const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
    const [selectedVisitType, setSelectedVisitType] = useState<string | undefined>();
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize] = useState<number>(10);
    const [loading, setLoading] = useState(false);
    const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
    const navigate = useNavigate();
    const [appointmentsData, setAppointmentsData] = useState<AppointmentOrg[]>([]);
    const [appointmentcount, setAppntmentCount] = useState<number>(0);
    const organisationId = localStorage.getItem("organisation_id") || "";
    const requestIdRef = useRef(0);

    const handleStatusChange = async (appointmentId: string, nextStatus: string) => {
        const previous = appointmentsData.find((a) => a.appointment_id === appointmentId);
        if (!previous || previous.status === nextStatus) return;

        setUpdatingStatusId(appointmentId);
        setAppointmentsData((rows) =>
            rows.map((row) =>
                row.appointment_id === appointmentId ? { ...row, status: nextStatus } : row,
            ),
        );

        try {
            const resp = await updateStatus({
                appointment_id: appointmentId,
                status: nextStatus,
            });
            if (resp.code !== "200") {
                throw new Error(resp.message || "Status update failed");
            }
            messageApi.success("Appointment status updated");
        } catch (error) {
            console.error("Failed to update appointment status:", error);
            setAppointmentsData((rows) =>
                rows.map((row) =>
                    row.appointment_id === appointmentId
                        ? { ...row, status: previous.status }
                        : row,
                ),
            );
            messageApi.error("Failed to update status. Try again.");
        } finally {
            setUpdatingStatusId(null);
        }
    };

    const columns = [
        {
            title: "CODE",
            dataIndex: "code",
            key: "code",
            color: "#6B7280",
            width: 180,
            render: (_: string, record: AppointmentOrg) => (
                <Tag color="yellow">{record.appointment_code}</Tag>
            ),
        },
        {
            title: "TIME",
            dataIndex: "time",
            key: "time",
            color: "#6B7280",
            width: 220,
            render: (_: string, record: AppointmentOrg) => (
                <div>
                    <div className="time-text">{record.start_time} - {record.end_time}</div>

                    {record.next && (
                        <Tag className="next-tag" color="blue">
                            NEXT
                        </Tag>
                    )}
                </div>
            ),
        },
        {
            title: "PATIENT",
            dataIndex: "patient",
            key: "patient",
            color: "#6B7280",
            width: 280,
            render: (_: string, record: AppointmentOrg) => (
                <div>
                    <div className="patient-name">
                        <a onClick={() =>
                            navigate(`/appointment/preview/${record.appointment_id}`)
                        }>
                            {record.patient_name}
                        </a>
                    </div>
                    <Text type="secondary" className="sub-text">
                        {record.mobile_no}
                    </Text>
                </div>
            ),

        },
        {
            title: "DOCTOR",
            dataIndex: "doctor",
            color: "#6B7280",
            key: "doctor",
            width: 280,
            render: (_: string, record: AppointmentOrg) => (
                <div className="doctor-name">{record.doctor_name}</div>
            ),
        },
        {
            title: "VISIT TYPE",
            dataIndex: "visitType",
            color: "#6B7280",
            width: 180,
            key: "visitType",
            render: (_: string, record: AppointmentOrg) => getVisitTag(record.visit_type),
        },
        {
            title: "STATUS",
            dataIndex: "status",
            color: "#6B7280",
            key: "status",
            width: 200,
            render: (_: string, record: AppointmentOrg) => {
                const meta = getStatusMeta(record.status);
                const isUpdating = updatingStatusId === record.appointment_id;

                return (
                    <Dropdown
                        trigger={["click"]}
                        disabled={isUpdating}
                        menu={{
                            selectable: true,
                            selectedKeys: [record.status],
                            items: APPOINTMENT_STATUS_OPTIONS.map((opt) => ({
                                key: opt.value,
                                label: getStatusTag(opt.value),
                            })),
                            onClick: ({ key }) => handleStatusChange(record.appointment_id, key),
                        }}
                    >
                        <Tag
                            color={meta.color}
                            className={`appointment-status-tag ${isUpdating ? "is-loading" : ""}`}
                            role="button"
                            tabIndex={0}
                            aria-label={`Change status for ${record.appointment_code}`}
                        >
                            {meta.label}
                            {isUpdating ? (
                                <LoadingOutlined className="appointment-status-caret" />
                            ) : (
                                <DownOutlined className="appointment-status-caret" />
                            )}
                        </Tag>
                    </Dropdown>
                );
            },
        },
        {
            title: "APPOINTMENT DATE",
            dataIndex: "appointment_date",
            color: "#6B7280",
            key: "appointment_date",
            width: 180,
            render: (_: string, record: AppointmentOrg) => <div className="doctor-name">{dayjs(record.appointment_date).format("DD MMM YYYY")}</div>,
        },
    ];

    useEffect(() => {
        const nextSearch = searchInput.trim();
        if (nextSearch === debouncedSearch) return;
        const timer = window.setTimeout(() => {
            setDebouncedSearch(nextSearch);
            setCurrentPage(1);
        }, SEARCH_DEBOUNCE_MS);
        return () => window.clearTimeout(timer);
    }, [searchInput, debouncedSearch]);

    useEffect(() => {
        getAppointmentByOrgID(
            currentPage,
            pageSize,
            selectedDoctor,
            selectedDate,
            selectedStatus,
            selectedVisitType,
            debouncedSearch,
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch on page / search / filters
    }, [currentPage, pageSize, debouncedSearch, selectedDoctor, selectedDate, selectedStatus, selectedVisitType]);

    const getDoctors = async () => {
        try {
            const response = await GetDoctors("", organisationId);
            setDoctors(response.data);
        } catch (error) {
            console.error("Error fetching doctors:", error);
        }
    };

    const getAppointmentByOrgID = async (
        page: number = 1,
        limit: number = 10,
        doctor_id?: number,
        date?: string,
        status?: string,
        visit_type?: string,
        search?: string,
    ) => {
        const requestId = ++requestIdRef.current;
        try {
            setLoading(true);
            const trimmedSearch = search?.trim() || "";
            const appointmentGetPayload = {
                organisation_id: organisationId,
                doctor_id: doctor_id ? doctor_id.toString() : "",
                date: date || "",
                status: status || "",
                visit_type: visit_type || "",
                page_no: page,
                limit: limit,
                ...(trimmedSearch ? { search: trimmedSearch } : {}),
            };
            const response = await GetAppointmentsByOrganisationID(appointmentGetPayload);
            if (requestId !== requestIdRef.current) return;

            const rows = Array.isArray(response?.data) ? response.data : [];
            const total = Number(response?.total);
            setAppointmentsData(rows);
            setAppntmentCount(Number.isFinite(total) ? total : 0);

            // If filters shrink the result set past the current page, snap back
            const maxPage = Math.max(1, Math.ceil((Number.isFinite(total) ? total : 0) / limit) || 1);
            if (page > maxPage) {
                setCurrentPage(maxPage);
            }
        } catch (error) {
            if (requestId !== requestIdRef.current) return;
            console.error("Error fetching appointments:", error);
            messageApi.error("Failed to load appointments");
            setAppointmentsData([]);
            setAppntmentCount(0);
        } finally {
            if (requestId === requestIdRef.current) {
                setLoading(false);
            }
        }
    };

    const clearFilters = () => {
        setSearchInput("");
        setDebouncedSearch("");
        setSelectedDate(undefined);
        setSelectedDoctor(undefined);
        setSelectedStatus(undefined);
        setSelectedVisitType(undefined);
        setCurrentPage(1);
    };

    return (
        <Layout>
            {contextHolder}
            <Sidebar />
            <Content>
                <Breadcrumb className="appointment-breadcrumb-layout">
                    <Breadcrumb.Item>
                        <HomeOutlined />
                        <Link to="/dashboard">Home</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        Appointments

                    </Breadcrumb.Item>
                </Breadcrumb>
                <div className="appointments-page">
                    <div className="page-header">
                        <Title level={4}>Appointments ({appointmentcount})</Title>

                        <Text type="secondary">
                            Manage and track patient appointments
                        </Text>
                    </div>

                    <div className="toolbar">
                        <Input
                            allowClear
                            placeholder="Search patient name, mobile number, or appointment ID"
                            prefix={<SearchOutlined />}
                            className="search-input"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />

                        <Button type="link" size="small" onClick={clearFilters}>
                            Clear Filters
                        </Button>
                    </div>

                    <div className="filter-row">
                        <Select
                            placeholder="Date"
                            size="middle"
                            className="filter-select"
                            allowClear
                            value={selectedDate}
                            options={[
                                { value: "today", label: "Today" },
                                { value: "tomorrow", label: "Tomorrow" },
                                { value: "this_week", label: "This Week" },
                                { value: "this_month", label: "This Month" },
                            ]}
                            onChange={(value) => {
                                setSelectedDate(value);
                                setCurrentPage(1);
                            }}
                        />

                        <Select
                            placeholder="Doctor"
                            size="middle"
                            className="filter-select"
                            allowClear
                            value={selectedDoctor}
                            options={doctors.map((doc) => ({
                                value: doc.id,
                                label: doc.username,
                            }))}
                            onFocus={getDoctors}
                            onChange={(value) => {
                                setSelectedDoctor(value);
                                setCurrentPage(1);
                            }}
                        />

                        <Select
                            placeholder="Status"
                            size="middle"
                            className="filter-select"
                            allowClear
                            value={selectedStatus}
                            options={APPOINTMENT_STATUS_OPTIONS.map((opt) => ({
                                value: opt.value,
                                label: opt.label,
                            }))}
                            onChange={(value) => {
                                setSelectedStatus(value);
                                setCurrentPage(1);
                            }}
                        />

                        <Select
                            placeholder="Visit Type"
                            size="middle"
                            className="filter-select"
                            allowClear
                            value={selectedVisitType}
                            options={[
                                { value: "new_patient", label: "New Patient" },
                                { value: "follow_up", label: "Follow Up" },
                                { value: "procedure", label: "Procedure" },
                            ]}
                            onChange={(value) => {
                                setSelectedVisitType(value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>

                    <div className="table-wrapper">
                        <Table
                            size="small"
                            columns={columns}
                            dataSource={appointmentsData || []}
                            rowKey="appointment_id"
                            pagination={false}
                            loading={loading}
                            rowClassName={(record) =>
                                record.next ? "next-row" : ""
                            }
                        />

                        <div className="table-footer">
                            <Text type="secondary">
                                {appointmentcount === 0
                                    ? "No appointments"
                                    : `Showing ${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, appointmentcount)} of ${appointmentcount} appointments`}
                            </Text>

                            <Pagination
                                current={currentPage}
                                total={appointmentcount}
                                pageSize={pageSize}
                                showSizeChanger={false}
                                hideOnSinglePage={false}
                                onChange={(page) => setCurrentPage(page)}
                            />
                        </div>
                    </div>
                </div>
            </Content>
        </Layout>

    );
};

export default AppointmentsPage;