import { Avatar, Card, Button, Layout, Breadcrumb, Form, Input, Modal, Select, Row, Col, message } from "antd"
import './patient-profile.css'
import { useEffect, useState } from "react";
import { findOne, updatePatient } from "../api/patients";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { patientlist, UpdatePatientPayload } from "../types/patients";
import { HomeOutlined, UserOutlined } from '@ant-design/icons';
import Sidebar from "../../sidebar";
import { Content } from "antd/es/layout/layout";
import PatientAppointmentHistory from "./patient-appointment-history";
import PatientPrescriptions from "./patient-prescriptions";
import PatientLabOrders from "./patient-lab-orders";
import { StatusTag } from "../../components/status-tag";
import { getPatientStatusType, STATUS_WARNING } from "../../constants/status-colors";
import { usePermissions } from "../../auth/permissions-context";

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

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const GENDERS = [
    { value: "female", label: "Female" },
    { value: "male", label: "Male" },
    { value: "not prefer to say", label: "Prefer not to say" },
];

interface PatientEditForm {
    name: string;
    age: string;
    weight: string;
    gender: string;
    email_id: string;
    mobile_number: string;
    blood_group: string;
    address: string;
}

function normalizeGender(value: string | undefined | null): string {
    const text = value?.trim().toLowerCase() ?? "";
    if (text === "female" || text === "f") return "female";
    if (text === "male" || text === "m") return "male";
    if (text.includes("prefer")) return "not prefer to say";
    return text;
}

function toEditForm(patient: patientlist): PatientEditForm {
    return {
        name: patient.patient_name ?? "",
        age: patient.patient_age != null ? String(patient.patient_age) : "",
        weight: patient.patient_weight != null ? String(patient.patient_weight) : "",
        gender: normalizeGender(patient.patient_gender),
        email_id: patient.patient_email ?? "",
        mobile_number: patient.patient_phone ?? "",
        blood_group: patient.patient_bg ?? "",
        address: patient.patient_address ?? "",
    };
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
    const [editOpen, setEditOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form] = Form.useForm<PatientEditForm>();
    const [messageApi, contextHolder] = message.useMessage();
    const navigate =useNavigate();
    const { canCreate, canView, canUpdate } = usePermissions();

    useEffect(() => {
        if (patientID) {
            findOne(patientID).then((res) => {
                setPatient(res.data);
            }).catch((err) => {
                console.error("Failed to fetch patient:", err);
            });
        }
    }, [patientID]);

    const openEdit = () => {
        if (!patient) return;
        setEditOpen(true);
    };

    const handleUpdate = async () => {
        if (!patient) return;
        const organisationId = localStorage.getItem("organisation_id") || "";
        if (!organisationId) {
            messageApi.error("Missing organisation — please log in again");
            throw new Error("Missing organisation");
        }

        try {
            const values = await form.validateFields();
            const payload: UpdatePatientPayload = {
                patient_id: patient.patient_id,
                organisation_id: organisationId,
                name: values.name.trim(),
                age: String(values.age).trim(),
                weight: String(values.weight ?? "").trim(),
                gender: values.gender,
                email_id: values.email_id?.trim() ?? "",
                mobile_number: values.mobile_number.trim(),
                blood_group: values.blood_group,
                address: values.address.trim(),
            };
            setSaving(true);
            const response = await updatePatient(payload);
            if (response?.code != null && response.code !== 200) {
                throw new Error(response.message || "Failed to update patient");
            }
            const refreshed = await findOne(patient.patient_id);
            setPatient(refreshed.data);
            setEditOpen(false);
            messageApi.success(response?.message || "patient updated");
        } catch (error) {
            if (!(error && typeof error === "object" && "errorFields" in error)) {
                console.error("Failed to update patient:", error);
                messageApi.error("Failed to update patient");
            }
            throw error;
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { key: 'appointments', label: 'Appointments' },
        { key: 'prescriptions', label: 'Prescriptions' },
        ...(canView("lab_order")
            ? [{ key: 'lab-orders', label: 'Lab Tests' }]
            : []),
    ];
    return (
        <>
            {contextHolder}
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
                                        {canUpdate("patient") ? (
                                            <Button onClick={openEdit} disabled={!patient}>
                                                Edit Patient
                                            </Button>
                                        ) : null}
                                        {canCreate("appointment") ? (
                                            <Button type="primary" onClick={()=>navigate(`/patients/addappointment/${patientID}`)}>Add Appointment</Button>
                                        ) : null}
                                        {canCreate("lab_order") ? (
                                            <Button
                                                type="default"
                                                onClick={() => navigate(`/patients/${patientID}/add-lab-test`)}
                                            >
                                                Add Lab Test
                                            </Button>
                                        ) : null}
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

                                {activeTab === 'lab-orders' && canView("lab_order") ? (
                                    <PatientLabOrders patient={patient} />
                                ) : null}
                            </div>
                        </div>
                    </Content>
                </Layout>

            </Layout>
            <Modal
                title="Edit Patient"
                open={editOpen}
                onCancel={() => setEditOpen(false)}
                onOk={handleUpdate}
                okText="Save"
                confirmLoading={saving}
                destroyOnClose
                afterOpenChange={(open) => {
                    if (open && patient) {
                        form.setFieldsValue(toEditForm(patient));
                    }
                }}
            >
                <Form layout="vertical" form={form}>
                    <Row gutter={[16, 0]}>
                        <Col span={12}>
                            <Form.Item
                                label="Name"
                                name="name"
                                rules={[{ required: true, message: "Patient name is required" }]}
                            >
                                <Input placeholder="Full name" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Blood Group"
                                name="blood_group"
                                rules={[{ required: true, message: "Please select a blood group" }]}
                            >
                                <Select
                                    placeholder="Select blood group"
                                    options={BLOOD_GROUPS.map((value) => ({ value, label: value }))}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Age"
                                name="age"
                                rules={[
                                    { required: true, message: "Age is required" },
                                    {
                                        validator: (_, value) => {
                                            const age = Number(value);
                                            if (!Number.isFinite(age) || age < 0 || age > 150) {
                                                return Promise.reject(new Error("Enter a valid age (0–150)"));
                                            }
                                            return Promise.resolve();
                                        },
                                    },
                                ]}
                            >
                                <Input placeholder="Age in years" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Phone Number"
                                name="mobile_number"
                                rules={[
                                    { required: true, message: "Phone number is required" },
                                    { pattern: /^\d{10}$/, message: "Enter a valid 10-digit phone number" },
                                ]}
                            >
                                <Input placeholder="10-digit mobile number" maxLength={10} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Gender"
                                name="gender"
                                rules={[{ required: true, message: "Please select a gender" }]}
                            >
                                <Select placeholder="Select gender" options={GENDERS} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Email ID"
                                name="email_id"
                                rules={[{ type: "email", message: "Enter a valid email address" }]}
                            >
                                <Input placeholder="Email address (optional)" type="email" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Weight (kg)"
                                name="weight"
                                rules={[
                                    {
                                        validator: (_, value) => {
                                            if (value == null || String(value).trim() === "") {
                                                return Promise.resolve();
                                            }
                                            const weight = Number(value);
                                            if (!Number.isFinite(weight) || weight < 0 || weight > 500) {
                                                return Promise.reject(new Error("Enter a valid weight"));
                                            }
                                            return Promise.resolve();
                                        },
                                    },
                                ]}
                            >
                                <Input placeholder="Weight in kg (optional)" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Address"
                                name="address"
                                rules={[{ required: true, message: "Address is required" }]}
                            >
                                <Input placeholder="Street / locality" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>

        </>
    )
}
export default GeneralInfo