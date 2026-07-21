import { Avatar, Card, Button, Layout, Breadcrumb } from "antd"
import './patient-profile.css'
import { useEffect, useState } from "react";
import { findOne } from "../api/patients";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { patientlist } from "../types/patients";
import { HomeOutlined, UserOutlined } from '@ant-design/icons';
import Sidebar from "../../sidebar";
import { Content } from "antd/es/layout/layout";
import PatientAppointmentHistory from "./patient-appointment-history";
import PatientPrescriptions from "./patient-prescriptions";
import { StatusTag } from "../../components/status-tag";
import { getPatientStatusType, STATUS_WARNING } from "../../constants/status-colors";

function displayValue(value: string | number | null | undefined): string {
    if (value === null || value === undefined) return "—";
    const text = String(value).trim();
    return text || "—";
}

function getPatientInitials(name: string | undefined | null): string {
    if (!name?.trim()) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

function formatPatientStatusLabel(status: string | undefined | null): string {
    switch (status?.trim().toLowerCase()) {
        case "new_patient":
            return "New Patient";
        case "opd":
            return "OPD";
        case "follow_up":
            return "Follow Up";
        case "active":
            return "Active";
        default:
            if (!status?.trim()) return "Active";
            return status
                .trim()
                .replace(/[_-]+/g, " ")
                .replace(/\b\w/g, (char) => char.toUpperCase());
    }
}

function GeneralInfo() {
    const params = useParams<{ patientID: string }>();
    const patientID = params.patientID;
    const [patient, setPatient] = useState<patientlist | null>(null);
    const [activeTab, setActiveTab] = useState('appointments');
    const navigate =useNavigate();


    useEffect(() => {
        if (patientID) {
            findOne(patientID).then((res) => {
                setPatient(res.data);
            }).catch((err) => {
                console.error("Failed to fetch patient:", err);
            });
        }
    }, [patientID]);

    const tabs = [
        { key: 'appointments', label: 'Appointments' },
        { key: 'prescriptions', label: 'Prescriptions' },
    ];
    return (
        <>
            <Layout>
                <Sidebar />
                <Layout>
                    <Breadcrumb className='appointment-breadcrumb-layout'>
                        <Breadcrumb.Item>
                            <HomeOutlined />
                            <Link to='/dashboard'>Home</Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            <UserOutlined />
                            <Link to='/patients'>Patient List</Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            Patient Overview
                        </Breadcrumb.Item>
                    </Breadcrumb>
                    <Content>
                        <div className="patient-profile-wrapper">
                            {/* Patient Header */}
                            <Card className="patient-header-card">
                                <div className="patient-header-container">
                                    <div className="patient-left-section">
                                        <Avatar size={72} className="patient-avatar">
                                            {getPatientInitials(patient?.patient_name)}
                                        </Avatar>

                                        <div className="patient-main-info">
                                            <div className="patient-name-row">
                                                <h2>{displayValue(patient?.patient_name)}</h2>
                                                <StatusTag type={getPatientStatusType(patient?.patient_status)}>
                                                    {formatPatientStatusLabel(patient?.patient_status)}
                                                </StatusTag>
                                                {patient?.waiting_time ? (
                                                    <StatusTag type={STATUS_WARNING}>
                                                        Wait: {patient.waiting_time}
                                                    </StatusTag>
                                                ) : null}
                                            </div>

                                            <div className="patient-meta-grid">
                                                <span><b>UHID:</b> {displayValue(patient?.patient_code)}</span>
                                                <span><b>Gender:</b> {displayValue(patient?.patient_gender)}</span>
                                                <span><b>Age:</b> {patient?.patient_age != null ? `${patient.patient_age} yrs` : "—"}</span>
                                            </div>

                                            <div className="patient-meta-grid">
                                                <span><b>Phone:</b> {displayValue(patient?.patient_phone)}</span>
                                                <span><b>Last Visit:</b> {patient?.patient_lvd ? new Date(patient.patient_lvd).toLocaleDateString() : "—"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="patient-action-buttons">
                                        <Button type="primary" onClick={()=>navigate(`/patients/addappointment/${patientID}`)}>Add Appointment</Button>
                                    </div>
                                </div>
                            </Card>

                            {/* Tabs */}
                            <div className="patient-tabs">
                                {tabs.map((tab) => (
                                    <span
                                        key={tab.key}
                                        className={activeTab === tab.key ? 'active-tab' : ''}
                                        onClick={() => setActiveTab(tab.key)}
                                    >
                                        {tab.label}
                                    </span>
                                ))}
                            </div>
                            <div className="tab-content-layout">
                                {activeTab === 'appointments' && (
                                    <PatientAppointmentHistory patient={patient} />
                                )}

                                {activeTab === 'prescriptions' && (
                                    <PatientPrescriptions patient={patient} />
                                )}
                            </div>
                        </div>
                    </Content>
                </Layout>

            </Layout>

        </>
    )
}
export default GeneralInfo