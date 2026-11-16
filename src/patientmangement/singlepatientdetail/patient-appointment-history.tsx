import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Avatar, Grid, Segmented, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import "./patient-appointment-history.css";
import { GetAppointmentByPatientID } from "../api/appointments";
import type { patientlist } from "../types/patients";
import type { appointmentByPatientID, previewAppointmentData } from "../types/appointments";
import { StatusTag } from "../../components/status-tag";
import { getAppointmentStatusType } from "../../constants/status-colors";

const { Text } = Typography;

type AppointmentStatus =
    | "upcoming"
    | "completed"
    | "cancelled"
    | "missed"
    | "reschedule_required";

type Appointment = previewAppointmentData;

const getStatusTag = (status: AppointmentStatus) => {
    const label =
        status === "reschedule_required"
            ? "Reschedule Required"
            : status.charAt(0).toUpperCase() + status.slice(1);

    return <StatusTag type={getAppointmentStatusType(status)}>{label}</StatusTag>;
};

const formatVisitTypeLabel = (visitType: string | undefined | null): string => {
    switch (visitType?.trim().toLowerCase()) {
        case "new_patient":
            return "New Patient";
        case "opd":
            return "OPD";
        case "follow_up":
            return "Follow Up";
        default:
            if (!visitType?.trim()) return "—";
            return visitType
                .trim()
                .replace(/[_-]+/g, " ")
                .replace(/\b\w/g, (char) => char.toUpperCase());
    }
};

interface Props {
    patient: patientlist | null;
}

function PatientAppointmentHistory({ patient }: Props) {
    const screens = Grid.useBreakpoint();
    const isMobile = screens.md === false;
    const [selectedFilter, setSelectedFilter] = useState<AppointmentStatus | null>(null);
    const [appointmentsData, setAppointmentsData] = useState<Appointment[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const [totalAppointments, setTotalAppointments] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchAppointments = async (page: number, limit: number, status?: string | null) => {
        if (!patient) {
            setAppointmentsData([]);
            setTotalAppointments(0);
            return;
        }

        const organisation_id = localStorage.getItem("organisation_id") || "";
        if (!organisation_id) {
            setAppointmentsData([]);
            setTotalAppointments(0);
            return;
        }

        setLoading(true);
        try {
            const payload: appointmentByPatientID = {
                patient_id: patient.patient_id,
                organisation_id,
                limit,
                page_no: page - 1,
                ...(status ? { status } : {}),
            };

            const response = await GetAppointmentByPatientID(payload);
            setAppointmentsData(response.data || []);
            setTotalAppointments(Number(response.total) || 0);
        } catch (error) {
            console.error("Failed to load patient appointments:", error);
            setAppointmentsData([]);
            setTotalAppointments(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (patient) {
            setCurrentPage(1);
            void fetchAppointments(1, pageSize, selectedFilter);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch when patient/filter changes
    }, [patient, selectedFilter]);

    const columns: ColumnsType<Appointment> = useMemo(() => {
        if (isMobile) {
            return [
                {
                    title: "Appointment",
                    key: "appointment",
                    render: (_, record) => {
                        const formattedDate = dayjs(record.appointment_date).format("DD MMM YYYY");
                        const doctor = record.doctor_name?.trim() || "Doctor";
                        return (
                            <div className="appt-history-card">
                                <div className="appt-history-card__when">
                                    <span className="appt-history-card__date">{formattedDate}</span>
                                    <span className="appt-history-card__time">{record.start_time}</span>
                                </div>
                                <div className="appt-history-card__doctor">
                                    <Avatar size={28}>
                                        {(doctor.charAt(0) || "D").toUpperCase()}
                                    </Avatar>
                                    <Text className="appt-history-card__doctor-name">{doctor}</Text>
                                </div>
                            </div>
                        );
                    },
                },
                {
                    title: "Status",
                    dataIndex: "status",
                    width: 110,
                    align: "right",
                    render: (status: string) => getStatusTag(status as AppointmentStatus),
                },
            ];
        }

        return [
            {
                title: "DATE & TIME",
                key: "dateTime",
                width: 160,
                render: (_, record) => {
                    const formattedDate = dayjs(record.appointment_date).format("DD MMM YYYY");
                    return (
                        <div className="appt-history-when">
                            <Text strong>{formattedDate}</Text>
                            <Text type="secondary">{record.start_time}</Text>
                        </div>
                    );
                },
            },
            {
                title: "DOCTOR",
                dataIndex: "doctor_name",
                render: (doctor: string) => (
                    <div className="appt-history-doctor">
                        <Avatar>{(doctor?.trim().charAt(0) || "D").toUpperCase()}</Avatar>
                        <span>{doctor}</span>
                    </div>
                ),
            },
            {
                title: "DEPARTMENT",
                dataIndex: "department_name",
                responsive: ["md"],
            },
            {
                title: "TYPE",
                dataIndex: "visit_type",
                responsive: ["lg"],
                render: (visitType: string) => formatVisitTypeLabel(visitType),
            },
            {
                title: "STATUS",
                dataIndex: "status",
                render: (status: string) => getStatusTag(status as AppointmentStatus),
            },
        ];
    }, [isMobile]);

    return (
        <div className={`appointment-history-container${isMobile ? " is-mobile" : ""}`}>
            <div className="appointment-history-header">
                <div className="appointment-filter-scroll">
                    <Segmented
                        size={isMobile ? "middle" : "large"}
                        className="appointment-filter"
                        value={selectedFilter || "all"}
                        onChange={(value) =>
                            setSelectedFilter(value === "all" ? null : (value as AppointmentStatus))
                        }
                        options={[
                            { label: "All", value: "all" },
                            { label: "Upcoming", value: "upcoming" },
                            { label: "Completed", value: "completed" },
                            { label: "Cancelled", value: "cancelled" },
                        ]}
                    />
                </div>
            </div>

            <Table
                className="appointment-history-table"
                rowKey={(record) => record.appointment_id}
                columns={columns}
                dataSource={appointmentsData}
                loading={loading}
                size={isMobile ? "small" : "middle"}
                pagination={{
                    current: currentPage,
                    pageSize,
                    total: totalAppointments,
                    showSizeChanger: false,
                    onChange: (page) => {
                        setCurrentPage(page);
                        void fetchAppointments(page, pageSize, selectedFilter);
                    },
                }}
            />
        </div>
    );
}

export default PatientAppointmentHistory;
