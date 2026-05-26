import {
    Breadcrumb,
    Button,
    Card,
    Col,
    Input,
    Layout,
    Pagination,
    Row,
    Space,
    Table,
    Tag,
    Typography,
} from "antd";

import {
    HomeOutlined,
    SearchOutlined,
    LeftOutlined,
    RightOutlined,
} from "@ant-design/icons";

import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FindAllPrescription } from "./api/prescription";
import type { PrescriptionListItem } from "./types/prescriptionmodel";

import Sidebar from "../sidebar";
import HeaderLayout from "../header";

import "./prescription-details.css";

const { Content } = Layout;
const { Text, Title } = Typography;



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
    const pageSize = 5;

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
            title: "CODE",
            dataIndex: "code",
            key: "code",
            align: 'center' as const,
            render: (text: string) => (
                <Tag className="code-tag">{text}</Tag>
            ),
            onCell: (record: PrescriptionListItem) => ({
                onClick: () => navigate(`/prescription/${record.id}`),
            }),
        },
        {
            title: "DOCTOR",
            dataIndex: "prescribed_by",
            key: "doctor",
            align: 'center' as const,
        },
        {
            title: "ISSUED ON",
            dataIndex: "created_at",
            key: "created_at",
            align: 'center' as const,
            render: (date: string) => new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }),
        },
        {
            title: "MEDICINES",
            key: "medicines",
            align: 'center' as const,
            render: (_: any, record: PrescriptionListItem) => {
                const meds = record.medicines || [];
                const firstMed = meds.length > 0 ? meds[0].medicine_name || "Unknown Medicine" : "No medicines";
                const moreCount = meds.length > 1 ? meds.length - 1 : 0;

                return (
                    <div className="medicine-cell">
                        <Text className="medicine-name">
                            {firstMed}
                        </Text>
                        {moreCount > 0 && (
                            <Tag className="more-tag">
                                +{moreCount} more
                            </Tag>
                        )}
                    </div>
                );
            },
        },
        {
            title: "PHARMA STATUS",
            dataIndex: "status",
            key: "status",
            align: 'center' as const,
            render: (status: string) => (
                <Tag color={getStatusColor(status)} className="app-tag">
                    {status}
                </Tag>
            ),
        },
    ];
    return (
        <Layout className="prescription-layout-wrapper">
            <Sidebar />

            <Layout>
                <HeaderLayout />

                {/* Breadcrumb */}
                <div className="breadcrumb-layout">
                    <Breadcrumb>
                        <Breadcrumb.Item>
                            <HomeOutlined />

                            <Link to="/prescription">
                                Prescription
                            </Link>
                        </Breadcrumb.Item>
                    </Breadcrumb>
                </div>

                {/* Page Content */}
                <Content className="prescription-page">
                    {/* <Card className="prescription-card"> */}
                    {/* Header */}
                    <Row
                        justify="space-between"
                        align="middle"
                        className="table-header-row"
                    >
                        <Col>
                            <Title level={4} className="page-title">
                                Prescriptions
                            </Title>
                        </Col>

                        <Col>
                            <Space size={12}>
                                {/* Search */}
                                <Input
                                    placeholder="Search by Code..."
                                    prefix={<SearchOutlined />}
                                    className="search-input"
                                />

                                {/* Filters */}
                                <Space.Compact>
                                    <Button type="primary">
                                        All
                                    </Button>

                                    <Button>
                                        Sent
                                    </Button>

                                    <Button>
                                        Pending
                                    </Button>
                                </Space.Compact>
                            </Space>
                        </Col>
                    </Row>

                    {/* Table */}
                    <Table
                        columns={columns}
                        dataSource={prescriptions}
                        loading={loading}
                        rowKey="id"
                        pagination={false}
                        className="prescription-table"
                        scroll={{ x: 'max-content' }}
                    />

                    {/* Footer */}
                    <div className="table-footer">
                        <Text type="secondary">
                            Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} of {total} results
                        </Text>

                        <Pagination
                            current={page}
                            total={total}
                            pageSize={pageSize}
                            onChange={(p) => setPage(p)}
                            showSizeChanger={false}
                            prevIcon={<LeftOutlined />}
                            nextIcon={<RightOutlined />}
                            hideOnSinglePage
                        />
                    </div>
                    {/* </Card> */}

                    {/* Bottom Info Card */}

                </Content>
            </Layout>
        </Layout>
    );
};

export default PrescriptionList;