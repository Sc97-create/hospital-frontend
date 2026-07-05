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
    HomeOutlined,
    MedicineBoxOutlined,
    PlusCircleOutlined,
    SearchOutlined,
} from "@ant-design/icons";

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FindAllPrescription } from "./api/prescription";
import type { PrescriptionListItem } from "./types/prescriptionmodel";

import Sidebar from "../sidebar";

import "./prescription-details.css";

const { Content } = Layout;

const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
        case "sent":
            return "green";
        case "pending":
            return "orange";
        case "draft":
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
    const pageSize = 10;

    const fetchPrescriptions = async (currentPage: number) => {
        setLoading(true);
        try {
            const organisation_id = localStorage.getItem("organisation_id") || "4c02d9f5-7388-4382-b2c7-aa3fe3852625";
            const response = await FindAllPrescription(pageSize, currentPage, organisation_id);
            if (response.code === "200") {
                setPrescriptions(response.data);
                setTotal(response.total_count);
            }
        } catch (error) {
            console.error("Failed to fetch prescriptions:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrescriptions(page);
    }, [page]);

    const columns = [
        {
            title: "Code",
            dataIndex: "code",
            key: "code",
            className: "column-layout",
            render: (text: string, record: PrescriptionListItem) => (
                <span
                    className="code-badge"
                    onClick={() => navigate(`/prescription/${record.id}`)}
                >
                    {text}
                </span>
            ),
        },
        {
            title: "Doctor",
            dataIndex: "prescribed_by",
            key: "doctor",
            className: "other-layout",
        },
        {
            title: "Issued On",
            dataIndex: "created_at",
            key: "created_at",
            className: "other-layout",
            render: (date: string) => new Date(date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            }),
        },
        {
            title: "Medicines",
            key: "medicines",
            className: "other-layout",
            render: (_: unknown, record: PrescriptionListItem) => {
                const meds = record.medicines || [];
                const firstMed = meds.length > 0 ? meds[0].medicine_name || "Unknown Medicine" : "No medicines";
                const moreCount = meds.length > 1 ? meds.length - 1 : 0;

                return (
                    <div className="medicine-cell">
                        <span
                            className="medicine-name"
                            onClick={() => navigate(`/prescription/${record.id}`)}
                        >
                            {firstMed}
                        </span>
                        {moreCount > 0 && (
                            <Tag className="more-tag">+{moreCount} more</Tag>
                        )}
                    </div>
                );
            },
        },
        {
            title: "Pharma Status",
            dataIndex: "status",
            key: "status",
            align: "center" as const,
            render: (status: string) => (
                <Tag color={getStatusColor(status)} bordered className="app-tag">
                    {status}
                </Tag>
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
                            suffix={
                                <SearchOutlined
                                    style={{ cursor: "pointer", width: "14px", height: "14px" }}
                                />
                            }
                        />

                        <Space.Compact>
                            <Button type="primary">All</Button>
                            <Button>Sent</Button>
                            <Button>Pending</Button>
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
                        <h3>Total Prescriptions ({total})</h3>
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
