import React, { useState, useEffect } from "react";
import {
    Table,
    Input,
    Select,
    Tag,
    Space,
    Typography,
    Pagination,
    Dropdown,
    Tabs,
    Layout,
    Breadcrumb,
    DatePicker,
    Button,
} from "antd";
import {
    SearchOutlined,
    LeftOutlined,
    RightOutlined,
    HomeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import "./appointment-list.css";
import Sidebar from "../../sidebar";
import { Content } from "antd/es/layout/layout";
import { Link, useNavigate, useParams } from "react-router-dom";
import { GetDoctors } from "../../shared/api/shared-api";
import { GetAppointmentsByOrganisationID } from "../api/appointments";
import type { AppointmentOrg, appointmentPayload } from "../types/appointments";

const { Title, Text } = Typography;
interface Doctor {
    id: string;
    username: string;
}



const getVisitTag = (type: string) => {
    switch (type) {
        case "new_patient":
            return <Tag color="blue">New Patient</Tag>;

        case "follow_up":
            return <Tag color="purple">Follow Up</Tag>;

        case "opd":
            return <Tag color="orange">OPD</Tag>;

        default:
            return <Tag color="blue">New Patient</Tag>;;
    }
};

const getStatusTag = (status: string) => {
    switch (status) {
        case "scheduled":
            return <Tag color="green">Scheduled</Tag>;

        case "completed":
            return <Tag color="success">Completed</Tag>;

        case "cancelled":
            return <Tag color="red">Cancelled</Tag>;
        case "ongoing":
            return <Tag color="yellow">Ongoing</Tag>
        case "reschedule_required":
            return <Tag color="gold">Reschedule Required</Tag>;
        case "missed":
            return <Tag color="orange">Missed</Tag>;
        case "upcoming":
            return <Tag color="cyan">Upcoming</Tag>;
        default:
            return <Tag>{status}</Tag>;
    }
};
//add appointment code
//send appointmentid
const AppointmentsPage: React.FC = () => {
    const { RangePicker } = DatePicker;
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState<number | undefined>();
    const [selectedDate, setSelectedDate] = useState<string | undefined>();
    const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
    const [selectedVisitType, setSelectedVisitType] = useState<string | undefined>();
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    //const [totalAppointments, setTotalAppointments] = useState<number>(42);
    const [appointmentsData, setAppointmentsData] = useState<AppointmentOrg[]>([]);
    const [appointmentcount, setAppntmentCount] = useState<number>(0);
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
            width: 180,
            render: (_: string, record: AppointmentOrg) => getStatusTag(record.status),
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
    const organisationId = localStorage.getItem("organisation_id") || "";

    useEffect(() => {
        // Fetch appointments with default pagination: limit 10, page_no 0
        getAppointmentByOrgID(0, 10);
    }, []);
    const getDoctors = async () => {
        try {
            const response = await GetDoctors("", organisationId);
            setDoctors(response.data);
        } catch (error) {
            console.error("Error fetching doctors:", error);
        }
    }
    const getAppointmentByOrgID = async (
        page: number = 0,
        limit: number = 10,
        doctor_id?: number,
        date?: string,
        status?: string,
        visit_type?: string
    ) => {
        try {
            setLoading(true)
            const appointmentGetPayload = {
                organisation_id: organisationId,
                doctor_id: doctor_id ? doctor_id.toString() : "",
                date: date || "",
                status: status || "",
                visit_type: visit_type || "",
                page_no: page,
                limit: limit,
            }
            const response = await GetAppointmentsByOrganisationID(appointmentGetPayload);
            setAppointmentsData(response.data);
            setAppntmentCount(response.total);
            console.log("Appointments fetched successfully:", response);
        } catch (error) {
            console.error("Error fetching appointments:", error);
        } finally {
            setLoading(false)
        }
    }

    const handleFilterChange = (
        dateValue?: string,
        doctorValue?: number,
        statusValue?: string,
        visitTypeValue?: string
    ) => {
        console.log("value", dateValue, doctorValue, statusValue, visitTypeValue);
        setCurrentPage(1);
        getAppointmentByOrgID(
            0,
            pageSize,
            doctorValue ?? selectedDoctor,
            dateValue ?? selectedDate,
            statusValue ?? selectedStatus,
            visitTypeValue ?? selectedVisitType
        );
    }
    
    return (
        <Layout>
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
                        />

                        <Button type="link" size="small">
                            Clear Filters
                        </Button>
                    </div>

                    {/* <Tabs
                        size="small"
                        defaultActiveKey="today"
                        items={[
                            { key: "today", label: "Today" },
                            { key: "upcoming", label: "Upcoming" },
                            { key: "new", label: "New Patients" },
                            { key: "follow", label: "Follow Ups" },
                        ]}
                    /> */}

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

                                handleFilterChange(value ? value : "", selectedDoctor, selectedStatus, selectedVisitType);
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
                                handleFilterChange(selectedDate, value, selectedStatus, selectedVisitType);
                            }}
                        />

                        <Select
                            placeholder="Status"
                            size="middle"
                            className="filter-select"
                            allowClear
                            value={selectedStatus}
                            options={[
                                { value: "scheduled", label: "Scheduled" },
                                { value: "completed", label: "Completed" },
                                { value: "cancelled", label: "Cancelled" },
                                { value: "ongoing", label: "Ongoing" },
                                { value: "reschedule_required", label: "Reschedule Required" },
                                { value: "missed", label: "Missed" },
                                { value: "upcoming", label: "Upcoming" },
                            ]}
                            onChange={(value) => {
                                setSelectedStatus(value);
                                handleFilterChange(selectedDate, selectedDoctor, value ? value : "", selectedVisitType);
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
                                handleFilterChange(selectedDate, selectedDoctor, selectedStatus, value ? value : "");
                            }}
                        />
                    </div>

                    <div className="table-wrapper">
                        <Table
                            size="small"
                            columns={columns}
                            dataSource={appointmentsData || []}
                            pagination={false}
                            loading={loading}
                            rowClassName={(record) =>
                                record.next ? "next-row" : ""
                            }
                        />

                        <div className="table-footer">
                            <Text type="secondary">
                                Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, appointmentcount)} of {appointmentcount} appointments
                            </Text>

                            <Pagination
                                simple
                                current={currentPage}
                                total={appointmentcount}
                                pageSize={pageSize}
                                prevIcon={<LeftOutlined />}
                                nextIcon={<RightOutlined />}
                                onChange={(page) => {
                                    setCurrentPage(page);
                                    getAppointmentByOrgID(
                                        page - 1,
                                        pageSize,
                                        selectedDoctor,
                                        selectedDate,
                                        selectedStatus,
                                        selectedVisitType
                                    );
                                }}
                            />
                        </div>
                    </div>
                </div>
            </Content>
        </Layout>

    );
};

export default AppointmentsPage;