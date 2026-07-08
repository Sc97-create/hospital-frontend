import { Card, Tag, Button, Layout, Breadcrumb } from "antd"
import './patient-profile.css'
import { useEffect, useState } from "react";
import { findOne } from "../api/patients";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { patientlist } from "../types/patients";
import { HomeOutlined, UserOutlined } from '@ant-design/icons';
import Sidebar from "../../sidebar";
import { Content } from "antd/es/layout/layout";
import PatientOverview from "./patient-overview";
import PatientAppointmentHistory from "./patient-appointment-history";



function GeneralInfo() {
    const params = useParams<{ patientID: string }>();
    const patientID = params.patientID;
    const [patient, setPatient] = useState<patientlist | null>(null);
    const [activeTab, setActiveTab] = useState('overview');
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
        { key: 'overview', label: 'Overview' },
        { key: 'appointments', label: 'Appointments' },
        { key: 'prescriptions', label: 'Prescriptions' },
        { key: 'vitals', label: 'Vitals' },
        { key: 'labReports', label: 'Lab Reports' },
        { key: 'documents', label: 'Documents' },
        { key: 'billing', label: 'Billing' },
        { key: 'timeline', label: 'Timeline' },
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
                                        <img
                                            src="https://i.pravatar.cc/100"
                                            alt="patient"
                                            className="patient-avatar"
                                        />

                                        <div className="patient-main-info">
                                            <div className="patient-name-row">
                                                <h2>{patient?.patient_name ?? 'Rajesh'}</h2>
                                                <Tag color="green">{ patient?.patient_status ?? 'Active'}</Tag>
                                                <Tag color="gold">{patient?.waiting_time ?? 0}</Tag>
                                            </div>

                                            <div className="patient-meta-grid">
                                                <span><b>UHID:</b> {patient?.patient_code}</span>
                                                <span><b>Gender:</b> {patient?.patient_gender ?? 'Male'}</span>
                                                <span><b>Age:</b> {patient?.patient_age ?? '34'}</span>
                                            </div>

                                            <div className="patient-meta-grid">
                                                <span><b>Blood Group:</b> {patient?.patient_bg}</span>
                                                <span><b>Weight:</b> {patient?.patient_weight ?? '72'} kg</span>
                                            </div>

                                            <div className="patient-meta-grid">
                                                <span><b>Phone:</b> {patient?.patient_phone ?? '+91 98765 43210'}</span>
                                            </div>

                                            <div className="patient-meta-grid">
                                                <span><b>Last Visit:</b> {patient?.patient_lvd ? new Date(patient.patient_lvd).toLocaleDateString() : 'N/A'}</span>
                                            </div>

                                            <div className="patient-tag-wrapper">
                                                <Tag color="red">⚠ Allergy (Penicillin)</Tag>
                                                <Tag color="orange">Chronic (Hypertension)</Tag>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="patient-action-buttons">
                                        <Button type="primary" onClick={()=>navigate(`/patients/addappointment/${patientID}`)}>Add Appointment</Button>
                                        <Button type="primary" onClick={()=>navigate(`/prescription`)}>Prescription</Button>
                                        <Button>Vitals</Button>
                                        <Button>Lab Report</Button>
                                        <Button>Billing</Button>
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
                                {activeTab === 'overview' && (
                                    <PatientOverview patient={patient} />
                                )}

                                { activeTab === 'appointments' && (
                                    <PatientAppointmentHistory patient={patient} />
                                )}

                                {/* {activeTab === 'prescriptions' && (
                                    <PatientPrescriptions patient={patient} />
                                )}

                                {activeTab === 'vitals' && (
                                    <PatientVitals patient={patient} />
                                )} */} 

                            </div>

                            {/* Main Cards */}
                            
                        </div>
                    </Content>
                </Layout>

            </Layout>

        </>
    )
}
export default GeneralInfo