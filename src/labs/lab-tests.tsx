import {
    Breadcrumb,
    Button,
    Input,
    Layout,
    Pagination,
    Table,
    Typography,
    message,
} from "antd";
import {
    ExperimentOutlined,
    EyeOutlined,
    HomeOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../sidebar";
import { StatusTag } from "../components/status-tag";
import { getLabStatusType, STATUS_INFO } from "../constants/status-colors";
import { ListLabOrders } from "./api/lab-order";
import type { LabOrderListItem } from "./types/lab-order";
import "./lab-tests.css";

const { Content } = Layout;
const { Title } = Typography;
const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type LabStatusFilter = "all" | "pending" | "completed" | "cancelled";

const STATUS_FILTERS: { key: LabStatusFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
];

function formatReceivedAt(isoDate: string) {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return isoDate || "—";
    const day = date.getDate();
    const month = MONTHS[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const period = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;
    return `${day} ${month} ${year}, ${hour12}:${minutes} ${period}`;
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

function LabTests() {
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<LabStatusFilter>("all");
    const [page, setPage] = useState(1);
    const [orders, setOrders] = useState<LabOrderListItem[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const requestIdRef = useRef(0);

    const organisationId = localStorage.getItem("organisation_id") || "";

    useEffect(() => {
        const next = searchInput.trim();
        if (next === debouncedSearch) return;
        const timer = window.setTimeout(() => {
            setDebouncedSearch(next);
            setPage(1);
        }, SEARCH_DEBOUNCE_MS);
        return () => window.clearTimeout(timer);
    }, [searchInput, debouncedSearch]);

    useEffect(() => {
        if (!organisationId) {
            setOrders([]);
            setTotal(0);
            return;
        }

        const requestId = ++requestIdRef.current;
        setLoading(true);

        void ListLabOrders({
            organisation_id: organisationId,
            limit: PAGE_SIZE,
            page_no: page,
            ...(statusFilter !== "all" ? { status: statusFilter } : {}),
        })
            .then((response) => {
                if (requestId !== requestIdRef.current) return;
                setOrders(response.data ?? []);
                setTotal(response.count ?? 0);
            })
            .catch((error) => {
                if (requestId !== requestIdRef.current) return;
                console.error("Failed to load lab orders:", error);
                messageApi.error("Failed to load lab orders");
                setOrders([]);
                setTotal(0);
            })
            .finally(() => {
                if (requestId === requestIdRef.current) {
                    setLoading(false);
                }
            });
    }, [organisationId, page, statusFilter, messageApi]);

    const filteredOrders = useMemo(() => {
        const query = debouncedSearch.trim().toLowerCase();
        if (!query) return orders;
        return orders.filter((row) => {
            const haystack = [
                row.id,
                row.patient_id,
                row.patient_name,
                row.doctor_id,
                row.doctor_name,
                row.status,
                String(row.tests_count),
            ]
                .join(" ")
                .toLowerCase();
            return haystack.includes(query);
        });
    }, [orders, debouncedSearch]);

    const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
    const rangeEnd = Math.min(page * PAGE_SIZE, total);

    const handleStatusFilterChange = (status: LabStatusFilter) => {
        setStatusFilter(status);
        setPage(1);
    };

    const columns = [
        {
            title: "Order ID",
            key: "order_id",
            width: 140,
            render: (_: unknown, record: LabOrderListItem) => (
                <StatusTag type={STATUS_INFO} className="code-badge">
                    {shortId(record.id)}
                </StatusTag>
            ),
        },
        {
            title: "Patient",
            key: "patient",
            width: 180,
            render: (_: unknown, record: LabOrderListItem) => (
                <span className="lab-cell-primary">{record.patient_name || "—"}</span>
            ),
        },
        {
            title: "Doctor",
            key: "doctor",
            width: 180,
            render: (_: unknown, record: LabOrderListItem) => (
                <span className="lab-cell-primary">{record.doctor_name || "—"}</span>
            ),
        },
        {
            title: "Tests",
            key: "tests",
            width: 90,
            render: (_: unknown, record: LabOrderListItem) => (
                <span className="lab-cell-primary">
                    {record.tests_count} {record.tests_count === 1 ? "Test" : "Tests"}
                </span>
            ),
        },
        {
            title: "Received Date",
            dataIndex: "received_at",
            key: "received_at",
            width: 160,
            render: (date: string) => (
                <span className="lab-cell-meta lab-received-date">{formatReceivedAt(date)}</span>
            ),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            width: 140,
            render: (status: string) => (
                <StatusTag type={getLabStatusType(status)} bordered>
                    {formatStatusLabel(status)}
                </StatusTag>
            ),
        },
        {
            title: "Action",
            key: "action",
            width: 100,
            align: "center" as const,
            render: (_: unknown, record: LabOrderListItem) => (
                <Button
                    type="primary"
                    size="small"
                    className="lab-view-details-btn"
                    icon={<EyeOutlined />}
                    onClick={() => navigate(`/lab/tests/${record.id}`)}
                >
                    View
                </Button>
            ),
        },
    ];

    return (
        <Layout>
            {contextHolder}
            <Sidebar />
            <Layout>
                <Breadcrumb
                    className="lab-breadcrumb"
                    items={[
                        {
                            href: "/dashboard",
                            title: <HomeOutlined />,
                        },
                        {
                            title: (
                                <>
                                    <ExperimentOutlined />
                                    <span>Lab Tests</span>
                                </>
                            ),
                        },
                    ]}
                />

                <Content className="lab-tests-page">
                    <div className="lab-page-header">
                        <Title level={3} className="lab-page-title">
                            Lab Tests
                        </Title>
                        <p className="lab-page-subtitle">
                            View and track lab tests prescribed for patients.
                        </p>
                    </div>

                    <div className="lab-panel">
                        <div className="lab-tests-filters">
                            <Input
                                placeholder="Search by patient, doctor, or order id..."
                                className="lab-search-input"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value ?? "")}
                                allowClear
                                prefix={<SearchOutlined />}
                            />

                            <div className="lab-status-filters">
                                {STATUS_FILTERS.map(({ key, label }) => (
                                    <Button
                                        key={key}
                                        type={statusFilter === key ? "primary" : "default"}
                                        className="lab-status-filter-btn"
                                        onClick={() => handleStatusFilterChange(key)}
                                    >
                                        {label}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="lab-table-wrapper">
                            <Table
                                columns={columns}
                                dataSource={filteredOrders}
                                rowKey="id"
                                loading={loading}
                                pagination={false}
                                size="middle"
                                tableLayout="fixed"
                                locale={{ emptyText: "No lab orders" }}
                            />

                            <div className="lab-table-footer">
                                <span className="lab-count-label">
                                    {total === 0
                                        ? "No lab orders"
                                        : `Showing ${rangeStart}-${rangeEnd} of ${total} orders`}
                                </span>
                                <Pagination
                                    current={page}
                                    total={total}
                                    pageSize={PAGE_SIZE}
                                    onChange={(p) => setPage(p)}
                                    showSizeChanger={false}
                                />
                            </div>
                        </div>
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}

export default LabTests;
