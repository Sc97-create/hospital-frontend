import { useEffect, useState } from "react";
import { Button, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { ListLabOrders } from "../../labs/api/lab-order";
import type { LabOrderListItem } from "../../labs/types/lab-order";
import type { patientlist } from "../types/patients";
import { StatusTag } from "../../components/status-tag";
import { getLabStatusType, STATUS_INFO } from "../../constants/status-colors";
import "./patient-appointment-history.css";

interface Props {
    patient: patientlist | null;
}

function formatStatusLabel(status: string) {
    if (!status?.trim()) return "—";
    return status
        .trim()
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function shortId(id: string) {
    if (!id) return "—";
    return id.length > 8 ? id.slice(0, 8).toUpperCase() : id.toUpperCase();
}

function PatientLabOrders({ patient }: Props) {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<LabOrderListItem[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const pageSize = 10;
    const organisationId = localStorage.getItem("organisation_id") || "";

    const fetchOrders = async (page: number) => {
        const patientId = patient?.patient_id?.trim();
        if (!patientId || !organisationId) {
            setOrders([]);
            setTotal(0);
            return;
        }

        setLoading(true);
        try {
            const response = await ListLabOrders({
                organisation_id: organisationId,
                patient_id: patientId,
                limit: pageSize,
                page_no: page,
            });
            setOrders(Array.isArray(response.data) ? response.data : []);
            setTotal(Number(response.count) || 0);
        } catch (error) {
            console.error("Failed to load patient lab orders:", error);
            setOrders([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
        void fetchOrders(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when patient changes
    }, [patient?.patient_id, organisationId]);

    const columns: ColumnsType<LabOrderListItem> = [
        {
            title: "Order ID",
            key: "order_id",
            render: (_: unknown, record: LabOrderListItem) => (
                <StatusTag type={STATUS_INFO} className="code-badge">
                    {shortId(record.id)}
                </StatusTag>
            ),
        },
        {
            title: "Doctor",
            dataIndex: "doctor_name",
            key: "doctor_name",
            render: (name: string | undefined) => name?.trim() || "—",
        },
        {
            title: "Tests",
            dataIndex: "tests_count",
            key: "tests_count",
            render: (count: number) =>
                `${count ?? 0} ${(count ?? 0) === 1 ? "Test" : "Tests"}`,
        },
        {
            title: "Received On",
            dataIndex: "received_at",
            key: "received_at",
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
                <StatusTag type={getLabStatusType(status)} bordered>
                    {formatStatusLabel(status)}
                </StatusTag>
            ),
        },
        {
            title: "Action",
            key: "action",
            align: "center",
            render: (_: unknown, record: LabOrderListItem) => (
                <Button
                    type="primary"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => navigate(`/lab/tests/${record.id}`)}
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
                dataSource={orders}
                loading={loading}
                locale={{ emptyText: "No lab orders for this patient" }}
                pagination={{
                    current: currentPage,
                    pageSize,
                    total,
                    showSizeChanger: false,
                    showTotal: (count) => `Total ${count}`,
                    onChange: (page) => {
                        setCurrentPage(page);
                        void fetchOrders(page);
                    },
                }}
            />
        </div>
    );
}

export default PatientLabOrders;
