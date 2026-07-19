import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Avatar, Segmented, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import "./patient-appointment-history.css";
import { GetAppointmentByPatientID } from "../api/appointments";
import type { patientlist } from "../types/patients";
import type { appointmentByPatientID, previewAppointmentData } from "../types/appointments";

const { Text } = Typography;

type AppointmentStatus =
    | "upcoming"
    | "completed"
    | "cancelled"
    | "missed"
    | "reschedule_required";

type Appointment = previewAppointmentData;

const getStatusTag = (status: AppointmentStatus) => {
    switch (status) {
        case "upcoming":
            return <Tag color="green">Upcoming</Tag>;

        case "completed":
            return <Tag color="success">Completed</Tag>;

        case "cancelled":
            return <Tag color="error">Cancelled</Tag>;
        case "missed":
            return <Tag color="volcano">Missed</Tag>;
        case "reschedule_required":
            return <Tag color="gold">Reschedule Required</Tag>;

        default:
            return null;
    }
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
    patient: patientlist | null
}
function PatientAppointmentHistory({ patient }: Props) {
    const [selectedFilter, setSelectedFilter] =
        useState<AppointmentStatus | null>(null);

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
            fetchAppointments(1, pageSize, selectedFilter);
        }
    }, [patient, selectedFilter]);

    const columns: ColumnsType<Appointment> = [
        {
            title: "DATE & TIME",
            key: "dateTime",
            render: (_, record) => {
                const formattedDate = dayjs(record.appointment_date).format("DD MMM YYYY");
               
                //const formattedEndTime = record.end_time ? formatSlotTime(record.end_time) : "";

                return (
                    <Space direction="vertical" size={0}>
                        <Text strong>{formattedDate}</Text>
                        <Text type="secondary">
                            {record.start_time}
                            {/* {formattedEndTime ? ` - ${formattedEndTime}` : ""} */}
                        </Text>
                    </Space>
                );
            },
        },
        {
            title: "DOCTOR",
            dataIndex: "doctor_name",
            render: (doctor: string) => (
                <Space>
                    <Avatar>{doctor?.charAt(0) || "D"}</Avatar>
                    <span>{doctor}</span>
                </Space>
            ),
        },
        {
            title: "DEPARTMENT",
            dataIndex: "department_name",
        },
        {
            title: "TYPE",
            dataIndex: "visit_type",
            render: (visitType: string) => formatVisitTypeLabel(visitType),
        },
        {
            title: "STATUS",
            dataIndex: "status",
            render: (status: string) => getStatusTag(status as AppointmentStatus),
        },
    ];

    return (
        <div className="appointment-history-container">
            <div className="appointment-history-header">
                <Segmented
                    size="large"
                    className="appointment-filter"
                    value={selectedFilter || "all"}
                    onChange={(value) =>
                        setSelectedFilter(value === "all" ? null : (value as AppointmentStatus))
                    }
                    options={[
                        {
                            label: "All",
                            value: "all",
                        },
                        {
                            label: "Upcoming",
                            value: "upcoming",
                        },
                        {
                            label: "Completed",
                            value: "completed",
                        },
                        {
                            label: "Cancelled",
                            value: "cancelled",
                        },
                    ]}
                />
            </div>

            <Table
                rowKey={(record) => record.appointment_id}
                columns={columns}
                dataSource={appointmentsData}
                loading={loading}
                pagination={{
                    current: currentPage,
                    pageSize,
                    total: totalAppointments,
                    showSizeChanger: false,
                    onChange: (page) => {
                        setCurrentPage(page);
                        fetchAppointments(page, pageSize, selectedFilter);
                    },
                }}
            />
        </div>
    );
};

export default PatientAppointmentHistory;