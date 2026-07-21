import { useEffect, useState } from "react";
import { Button, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { GetPrescriptionByPatientID } from "../../prescriptions/api/prescription";
import type { PrescriptionListItem } from "../../prescriptions/types/prescriptionmodel";
import {
    formatPrescriptionStatusLabel,
    getPrescriptionStatusTagColor,
    rememberPrescriptionPatientId,
} from "../../prescriptions/prescription-patient";
import type { patientlist } from "../types/patients";
import "./patient-appointment-history.css";
import { StatusTag } from "../../components/status-tag";
import { STATUS_INFO } from "../../constants/status-colors";

interface Props {
    patient: patientlist | null;
}

function PatientPrescriptions({ patient }: Props) {
    const navigate = useNavigate();
    const [prescriptions, setPrescriptions] = useState<PrescriptionListItem[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const pageSize = 10;

    const fetchPrescriptions = async (page: number) => {
        const patientId = patient?.patient_id?.trim();
        if (!patientId) {
            setPrescriptions([]);
            setTotal(0);
            return;
        }

        setLoading(true);
        try {
            const response = await GetPrescriptionByPatientID(patientId, pageSize, page);
            setPrescriptions(Array.isArray(response.data) ? response.data : []);
            setTotal(Number(response.total) || 0);
        } catch (error) {
            console.error("Failed to load patient prescriptions:", error);
            setPrescriptions([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
        fetchPrescriptions(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when patient changes
    }, [patient?.patient_id]);

    const columns: ColumnsType<PrescriptionListItem> = [
        {
            title: "Code",
            dataIndex: "code",
            key: "code",
            render: (text: string) => <StatusTag type={STATUS_INFO}>{text}</StatusTag>,
        },
        {
            title: "Patient",
            dataIndex: "patient_name",
            key: "patient_name",
            render: (name: string | undefined) => name?.trim() || patient?.patient_name || "—",
        },
        {
            title: "Doctor",
            dataIndex: "prescribed_by",
            key: "doctor",
        },
        {
            title: "Issued On",
            dataIndex: "created_at",
            key: "created_at",
            render: (date: string) =>
                date
                    ? new Date(date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                      })
                    : "—",
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status: string) => (
                <StatusTag type={getPrescriptionStatusTagColor(status)} bordered>
                    {formatPrescriptionStatusLabel(status)}
                </StatusTag>
            ),
        },
        {
            title: "Action",
            key: "action",
            align: "center",
            render: (_: unknown, record: PrescriptionListItem) => (
                <Button
                    type="primary"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => {
                        const patientId = record.patient_id || patient?.patient_id;
                        rememberPrescriptionPatientId(record.id, patientId);
                        navigate(
                            {
                                pathname: `/prescription/${record.id}`,
                                search: patientId
                                    ? `?patientId=${encodeURIComponent(patientId)}`
                                    : undefined,
                            },
                            {
                                state: {
                                    patientId,
                                    status: record.status,
                                    createdAt: record.created_at,
                                },
                            },
                        );
                    }}
                >
                    View
                </Button>
            ),
        },
    ];

    return (
        <div className="appointment-history-container">
            <Table
                rowKey="id"
                columns={columns}
                dataSource={prescriptions}
                loading={loading}
                locale={{ emptyText: "No prescriptions for this patient" }}
                pagination={{
                    current: currentPage,
                    pageSize,
                    total,
                    showSizeChanger: false,
                    showTotal: (count) => `Total ${count}`,
                    onChange: (page) => {
                        setCurrentPage(page);
                        fetchPrescriptions(page);
                    },
                }}
            />
        </div>
    );
}

export default PatientPrescriptions;
