import { Breadcrumb, Button, Input, Layout, Pagination, Table, message } from "antd";
import type { TableColumnsType } from "antd";
import {
    EnvironmentOutlined,
    HomeOutlined,
    PlusCircleOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../sidebar";
import { StatusTag } from "../components/status-tag";
import { getSupplierStatusType, STATUS_INFO } from "../constants/status-colors";
import { usePermissions } from "../auth/permissions-context";
import { ListDiagnosticCentres } from "./api/diagnostic-center";
import type { DiagnosticCentreListItem } from "./types/diagnostic-center";
import "../employees.css";

const { Content } = Layout;
const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;

function formatStatusLabel(status: string): string {
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

function DiagnosticCenter() {
    const navigate = useNavigate();
    const { canCreate } = usePermissions();
    const [messageApi, contextHolder] = message.useMessage();
    const [page, setPage] = useState(1);
    const [centres, setCentres] = useState<DiagnosticCentreListItem[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const organisationId = localStorage.getItem("organisation_id") || "";
    const requestIdRef = useRef(0);

    useEffect(() => {
        const nextSearch = searchInput.trim();
        if (nextSearch === debouncedSearch) return;
        const timer = window.setTimeout(() => {
            setDebouncedSearch(nextSearch);
            setPage(1);
        }, SEARCH_DEBOUNCE_MS);
        return () => window.clearTimeout(timer);
    }, [searchInput, debouncedSearch]);

    const fetchCentres = async (pageNo: number, search: string) => {
        if (!organisationId) {
            messageApi.error("Missing organisation — please log in again");
            setCentres([]);
            setTotal(0);
            return;
        }

        const requestId = ++requestIdRef.current;
        setLoading(true);
        try {
            const trimmedSearch = search.trim();
            const response = await ListDiagnosticCentres({
                organisation_id: organisationId,
                limit: PAGE_SIZE,
                page_no: pageNo,
                ...(trimmedSearch ? { search: trimmedSearch } : {}),
            });
            if (requestId !== requestIdRef.current) return;

            const rows = Array.isArray(response?.data) ? response.data : [];
            const nextTotal = Number(response?.total) || 0;
            setCentres(rows);
            setTotal(nextTotal);

            const maxPage = Math.max(1, Math.ceil(nextTotal / PAGE_SIZE) || 1);
            if (pageNo > maxPage) setPage(maxPage);
        } catch (error) {
            if (requestId !== requestIdRef.current) return;
            console.error("Failed to load diagnostic centres:", error);
            messageApi.error("Failed to load diagnostic centres");
            setCentres([]);
            setTotal(0);
        } finally {
            if (requestId === requestIdRef.current) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        void fetchCentres(page, debouncedSearch);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch when page / search changes
    }, [page, debouncedSearch, organisationId]);

    const columns: TableColumnsType<DiagnosticCentreListItem> = [
        {
            title: "Code",
            key: "id",
            className: "column-layout",
            width: 120,
            render: (_: unknown, record: DiagnosticCentreListItem) => (
                <StatusTag type={STATUS_INFO} className="code-badge">
                    {shortId(record.id)}
                </StatusTag>
            ),
        },
        {
            title: "Name",
            dataIndex: "name",
            className: "other-layout",
            render: (name: string) => name?.trim() || "—",
        },
        {
            title: "Address",
            dataIndex: "address",
            className: "other-layout",
            render: (address: string) => address?.trim() || "—",
        },
        {
            title: "Email",
            dataIndex: "email",
            className: "other-layout",
            render: (email: string) => email?.trim() || "—",
        },
        {
            title: "Contact Number",
            dataIndex: "contact_number",
            className: "other-layout",
            render: (phone: string) => phone?.trim() || "—",
        },
        {
            title: "Status",
            dataIndex: "status",
            align: "center",
            width: 120,
            render: (status: string) => (
                <StatusTag type={getSupplierStatusType(status)} bordered>
                    {formatStatusLabel(status)}
                </StatusTag>
            ),
        },
    ];

    return (
        <Layout>
            {contextHolder}
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
                                    <EnvironmentOutlined />
                                    <span>Diagnostic Center</span>
                                </>
                            ),
                        },
                    ]}
                />

                <Content className="main-layout">
                    <div className="button-layout">
                        {canCreate("lab_order") ? (
                            <Button
                                icon={<PlusCircleOutlined />}
                                className="appointment-button"
                                onClick={() => navigate("/lab/diagnostic-center/add")}
                            >
                                Add Diagnostic Centre
                            </Button>
                        ) : null}
                    </div>

                    <div className="search-layout">
                        <Input
                            allowClear
                            className="search-input1"
                            placeholder="Search by name, email, or contact number"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            suffix={
                                <SearchOutlined
                                    style={{ cursor: "pointer", width: "14px", height: "14px" }}
                                />
                            }
                        />
                    </div>

                    <div className="table-data">
                        <Table<DiagnosticCentreListItem>
                            columns={columns}
                            dataSource={centres}
                            rowKey="id"
                            loading={loading}
                            pagination={false}
                            size="small"
                            locale={{ emptyText: "No diagnostic centres yet" }}
                        />
                    </div>

                    <div className="pagination-tab">
                        <span className="count-label">
                            Total Diagnostic Centres ({total})
                        </span>
                        <Pagination
                            current={page}
                            pageSize={PAGE_SIZE}
                            total={total}
                            onChange={(nextPage) => setPage(nextPage)}
                            showSizeChanger={false}
                        />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}

export default DiagnosticCenter;
