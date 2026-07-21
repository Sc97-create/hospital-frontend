import React, { useEffect, useState } from "react";
import {
    Card,
    Row,
    Col,
    Button,
    Avatar,
    Typography,
    Divider,
    Layout,
    Breadcrumb,
} from "antd";
import {
    CalendarOutlined,
    HistoryOutlined,
    ClockCircleOutlined,
    PlayCircleOutlined,
    FileTextOutlined,
    HomeOutlined,
} from "@ant-design/icons";
import "./appointment-details.css";
import Sidebar from "../../sidebar";
import { Content } from "antd/es/layout/layout";
import { Link, useNavigate, useParams } from "react-router-dom";
import { GetAppointmentPreview, updateStatus } from "../api/appointments";
import type { previewAppointmentData, statusUpdate } from "../types/appointments";
import dayjs from "dayjs";
import { StatusTag } from "../../components/status-tag";
import {
    getAppointmentStatusType,
    STATUS_INFO,
} from "../../constants/status-colors";

const { Text } = Typography;

const AppointmentDetails: React.FC = () => {
    const navigate = useNavigate()
    const { appointmentID } = useParams<{ appointmentID: string }>();
    const organisationID = localStorage.getItem("organisation_id") || ""
    const [previewData, setPreviewData] = useState<previewAppointmentData>()
    const previewAppntment = async () => {
        if (!appointmentID) return;
        const response = await GetAppointmentPreview(organisationID, appointmentID)
        setPreviewData(response.data)
        console.log("data", previewData)
    }
    useEffect(() => {
        previewAppntment()
    }, [])
    

    const selectVisitType = (value: string) => {
        switch (value) {
            case "follow_up":
                return "Follow Up"
            case "new_patient":
                return "New Patient"
            case "opd":
                return "OPD"

        }
    }
    const selectStatus = (value: string) => {
        switch (value) {
            case "scheduled":
                return "Scheduled"
            case "completed":
                return "Completed"
            case "cancelled":
                return "Cancelled"
            case "ongoing":
                return "Ongoing"
            case "reschedule_required":
                return "Reschedule Required"
            case "missed":
                return "Missed"
            case "upcoming":
                return "Upcoming"
        }
    }
    const updatestatus = async () => {
        try {
            const payload: statusUpdate = {
                appointment_id: appointmentID ?? "",
                status: "ongoing"
            }
            const resp = await updateStatus(payload)
            if (resp.code == "200") {
                navigate(`/prescription/add-prescription/${appointmentID}`)
            }
        } catch (err) {
            console.log("err", err)
        }


    }
    return (
        <Layout>
            <Sidebar />
            <Content>
                <Breadcrumb className="appointment-breadcrumb-layout">
                    <Breadcrumb.Item>
                        <HomeOutlined />
                        <Link to="/appointments">Appointments</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        Appointment Details
                    </Breadcrumb.Item>
                </Breadcrumb>
                <div className="appointment-details-page">
                    <div className="appointment-header">
                        <div>
                            <div className="appointment-title-wrapper">
                                <h1 className="appointment-title">
                                    Appointment #{previewData?.appointment_code}
                                </h1>

                                <StatusTag type={getAppointmentStatusType(previewData?.status)}>
                                    {selectStatus(previewData?.status ?? "")}
                                </StatusTag>
                            </div>

                            <div className="appointment-meta">
                                <CalendarOutlined />
                                <span>{dayjs(previewData?.appointment_date).format("DD MMM YYYY")} • {previewData?.start_time ?? ""}</span>
                            </div>
                        </div>

                        <Button
                            icon={<HistoryOutlined />}
                            className="history-button"
                        >
                            View History
                        </Button>
                    </div>

                    <Row gutter={16}>
                        <Col xs={24} lg={16}>
                            <Card className="custom-card">
                                <div className="section-header">
                                    <span>PATIENT INFORMATION</span>

                                    <Button
                                        type="link"
                                        className="link-button"
                                    >
                                        View History
                                    </Button>
                                </div>

                                <div className="patient-info">
                                    <Avatar
                                        size={56}
                                        src="https://i.pravatar.cc/100"
                                    />

                                    <div className="patient-grid">
                                        <div>
                                            <div className="label-text">
                                                Full Name
                                            </div>

                                            <div className="value-text">
                                                {previewData?.patient_name}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="label-text">
                                                Age / Gender
                                            </div>

                                            <div className="value-text">
                                                {previewData?.patient_age} years • {previewData?.patient_gender}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="label-text">
                                                Phone
                                            </div>

                                            <div className="value-text">
                                                {previewData?.mobile_no}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="visit-stats">
                                                <div>
                                                    <div className="label-text">
                                                        Last Visit
                                                    </div>

                                                    <div className="value-text">
                                                        15 May 2026
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="label-text">
                                                        Total Visits
                                                    </div>

                                                    <div className="value-text">
                                                        12
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card className="custom-card">
                                <div className="section-header">
                                    <span>APPOINTMENT DETAILS</span>
                                </div>

                                <Row gutter={16}>
                                    <Col xs={24} md={8}>
                                        <div className="info-box">
                                            <div className="label-text">
                                                Assigned Doctor
                                            </div>

                                            <div className="value-text">
                                                Dr. {previewData?.doctor_name}
                                            </div>

                                            <Text className="sub-text">
                                                {previewData?.department_name}
                                            </Text>
                                        </div>
                                    </Col>

                                    <Col xs={24} md={8}>
                                        <div className="info-box">
                                            <div className="label-text">
                                                Visit Type
                                            </div>

                                            <div className="value-text success-text">
                                                {selectVisitType(previewData?.visit_type ?? "")}
                                            </div>

                                            <Text className="sub-text">
                                                Post-Op Review
                                            </Text>
                                        </div>
                                    </Col>

                                    <Col xs={24} md={8}>
                                        <div className="info-box">
                                            <div className="label-text">
                                                Schedule
                                            </div>

                                            <div className="value-text">
                                                {previewData?.appointment_date
                                                    ? dayjs(previewData.appointment_date).format("MMMM D YYYY")
                                                    : ""}
                                            </div>

                                            <Text className="sub-text">
                                                at {previewData?.start_time ?? ""}
                                            </Text>
                                        </div>
                                    </Col>
                                </Row>
                            </Card>

                            <Card className="custom-card">
                                <div className="duration-container">
                                    <div className="duration-left">
                                        <ClockCircleOutlined />
                                        <span>
                                            Expected Consultation Duration
                                        </span>
                                    </div>

                                    <div className="duration-value">
                                        {previewData?.slot_duration} Minutes
                                    </div>
                                </div>
                            </Card>
                        </Col>

                        <Col xs={24} lg={8}>
                            <Card className="custom-card summary-card">
                                <div className="summary-header">
                                    <span>Quick Summary</span>

                                    <FileTextOutlined />
                                </div>

                                <div className="summary-item">
                                    <div className="label-text">
                                        LATEST CONSULTATION
                                    </div>

                                    <div className="value-text">
                                        15 May 2026
                                    </div>
                                </div>

                                <div className="summary-item">
                                    <div className="label-text">
                                        DIAGNOSIS
                                    </div>

                                    <StatusTag type={STATUS_INFO}>
                                        Type 2 Diabetes
                                    </StatusTag>
                                </div>

                                <div className="summary-item">
                                    <div className="label-text">
                                        PRESCRIPTION
                                    </div>

                                    <div className="value-text">
                                        2 Medicines Prescribed
                                    </div>
                                </div>

                                <Divider />

                                <Button
                                    type="link"
                                    className="link-button"
                                >
                                    View Details
                                </Button>
                            </Card>
                        </Col>
                    </Row>

                    <div className="footer-actions">
                        <Button className="cancel-btn">
                            Cancel
                        </Button>

                        {previewData?.status === "reschedule_required" && (
                            <Button className="reschedule-btn">
                                Reschedule
                            </Button>
                        )}

                        <Button
                            type="primary"
                            icon={<PlayCircleOutlined />}
                            className="start-btn"
                            onClick={updatestatus}
                            disabled={previewData?.status === "missed" || previewData?.status === "reschedule_required"}
                        >
                            Start Consultation
                        </Button>
                    </div>
                </div>
            </Content>
        </Layout>

    );
};

export default AppointmentDetails;