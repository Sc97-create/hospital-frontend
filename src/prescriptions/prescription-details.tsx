import {
    Breadcrumb,
    Button,
    Input,
    Layout,
    Pagination,
    Space,
    Table,
    Tag,
} from "antd";

import {
    EyeOutlined,
    HomeOutlined,
    MedicineBoxOutlined,
    PlusCircleOutlined,
    SearchOutlined,
} from "@ant-design/icons";

import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { FindAllPrescription, GetByStatus } from "./api/prescription";
import type { PrescriptionListItem, PrescriptionStatusFilter } from "./types/prescriptionmodel";

import Sidebar from "../sidebar";

import "./prescription-details.css";

const { Content } = Layout;
const SEARCH_DEBOUNCE_MS = 400;

const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
        case "sent":
            return "green";
        case "draft":
        case "pending":
            return "gray";
        case "dispensed":
            return "green";
        case "expired":
            return "red";
        default:
            return "default";
    }
};

function PrescriptionList() {
    const navigate = useNavigate();
    const [prescriptions, setPrescriptions] = useState<PrescriptionListItem[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<PrescriptionStatusFilter>("all");
    const pageSize = 10;
    const requestIdRef = useRef(0);

    const fetchPrescriptions = async (
        currentPage: number,
        search: string,
        status: PrescriptionStatusFilter,
    ) => {
        const requestId = ++requestIdRef.current;
        setLoading(true);
        try {
            const organisation_id = localStorage.getItem("organisation_id") || "";
            const response = status === "all"
                ? await FindAllPrescription(
                    pageSize,
                    currentPage,
                    organisation_id,
                    search || undefined,
                )
                : await GetByStatus(
                    pageSize,
                    currentPage,
                    organisation_id,
                    status,
                    search || undefined,
                );
            // Ignore stale responses from earlier keystrokes / remounts
            if (requestId !== requestIdRef.current) return;
            if (response.code === "200") {
                setPrescriptions(response.data ?? []);
                setTotal(response.total_count ?? 0);
            }
        } catch (error) {
            if (requestId !== requestIdRef.current) return;
            console.error("Failed to fetch prescriptions:", error);
        } finally {
            if (requestId === requestIdRef.current) {
                setLoading(false);
            }
        }
    };

    const handleStatusFilterChange = (status: PrescriptionStatusFilter) => {
        setStatusFilter(status);
        setPage(1);
    };

    // Debounce: only update the search used for API after the user stops typing
    useEffect(() => {
        const nextSearch = searchInput.trim();
        if (nextSearch === debouncedSearch) return;

        const timer = setTimeout(() => {
            setPage(1);
            setDebouncedSearch(nextSearch);
        }, SEARCH_DEBOUNCE_MS);

        return () => clearTimeout(timer);
    }, [searchInput, debouncedSearch]);

    useEffect(() => {
        fetchPrescriptions(page, debouncedSearch, statusFilter);
    }, [page, debouncedSearch, statusFilter]);

    const columns = [
        {
            title: "Code",
            dataIndex: "code",
            key: "code",
            render: (text: string) => (
                <Tag color="yellow">{text}</Tag>
            ),
        },
        {
            title: "Doctor",
            dataIndex: "prescribed_by",
            key: "doctor",
            color: "#6B7280",
        },
        {
            title: "Issued On",
            dataIndex: "created_at",
            key: "created_at",
            color: "#6B7280",
            render: (date: string) => new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }),
        },
        {
            title: "Pharma Status",
            dataIndex: "status",
            key: "status",
            color: "#6B7280",
            render: (status: string) => (
                <Tag color={getStatusColor(status)} bordered className="app-tag">
                    {status}
                </Tag>
            ),
        },
        {
            title: "Action",
            key: "action",
            align: "center" as const,
            render: (_: unknown, record: PrescriptionListItem) => (
                <Button
                    type="primary"
                    size="small"
                    className="view-prescription-btn"
                    icon={<EyeOutlined />}
                    onClick={() => navigate(`/prescription/${record.id}`)}
                >
                    View
                </Button>
            ),
        },
    ];

    return (
        <Layout>
            <Sidebar />
            <Layout>
                <Breadcrumb
                    className="breadcrumb-layout"
                    items={[
                        {
                            href: "/dashboard",
                            title: <HomeOutlined />,
                        },
                        {
                            title: (
                                <>
                                    <MedicineBoxOutlined />
                                    <span>Prescriptions</span>
                                </>
                            ),
                        },
                    ]}
                />

                <Content className="main-layout">
                    <div className="button-layout">
                        <Button
                            className="appointment-button"
                            icon={<PlusCircleOutlined />}
                            onClick={() => navigate("/prescription/add-prescription/new")}
                        >
                            Add Prescription
                        </Button>
                    </div>

                    <div className="search-layout">
                        <Input
                            placeholder="Search prescriptions"
                            className="search-input1"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value ?? "")}
                            allowClear
                            suffix={
                                <SearchOutlined
                                    style={{ cursor: "pointer", width: "14px", height: "14px" }}
                                />
                            }
                        />

                        <Space.Compact>
                            <Button
                                type={statusFilter === "all" ? "primary" : "default"}
                                onClick={() => handleStatusFilterChange("all")}
                            >
                                All
                            </Button>
                            <Button
                                type={statusFilter === "draft" ? "primary" : "default"}
                                onClick={() => handleStatusFilterChange("draft")}
                            >
                                Draft
                            </Button>
                            <Button
                                type={statusFilter === "sent" ? "primary" : "default"}
                                onClick={() => handleStatusFilterChange("sent")}
                            >
                                Sent
                            </Button>
                        </Space.Compact>
                    </div>

                    <div className="table-data">
                        <Table
                            columns={columns}
                            dataSource={prescriptions}
                            loading={loading}
                            rowKey="id"
                            pagination={false}
                            scroll={{ x: "max-content", y: 400 }}
                            showSorterTooltip={{ target: "sorter-icon" }}
                        />
                    </div>

                    <div className="pagination-tab">
                        <span className="count-label">Total Prescriptions ({total})</span>
                        <Pagination
                            current={page}
                            total={total}
                            pageSize={pageSize}
                            onChange={(p) => setPage(p)}
                            showSizeChanger={false}
                        />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}

export default PrescriptionList;
