import { Breadcrumb, Button, Dropdown, Input, Layout, Pagination, Table, Tag, message } from "antd"
import type { TableColumnsType } from "antd"
import Sidebar from "../sidebar"
import './pharmacy.css'
import {
    DownOutlined,
    HomeOutlined,
    PlusCircleOutlined,
    SearchOutlined,
    ShopOutlined,
} from '@ant-design/icons'
import { Content } from "antd/es/layout/layout"
import { useNavigate } from "react-router-dom"
import { useEffect, useRef, useState } from "react"
import { GetSuppliersByOrgID } from "./api/supplier"
import type { SupplierListItem } from "./types/supplier"
import { StatusTag } from "../components/status-tag"
import {
    getSupplierStatusType,
    statusTagClassName,
    STATUS_INFO,
} from "../constants/status-colors"
import { usePermissions } from "../auth/permissions-context"

const SEARCH_DEBOUNCE_MS = 400;

const SUPPLIER_STATUS_OPTIONS = [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
] as const;

function normalizeStatus(status: string): string {
    const lower = status?.toLowerCase();
    if (lower === "active") return "Active";
    if (lower === "inactive") return "Inactive";
    return status || "—";
}

function getStatusMeta(status: string) {
    const normalized = normalizeStatus(status);
    return (
        SUPPLIER_STATUS_OPTIONS.find((opt) => opt.value === normalized) ?? {
            value: normalized,
            label: normalized,
        }
    );
}

function Pharmacy() {
    const navigate = useNavigate()
    const { canCreate, can } = usePermissions()
    const [messageApi, contextHolder] = message.useMessage()
    const [page, setPage] = useState(1)
    const pageSize = 10
    const [suppliers, setSuppliers] = useState<SupplierListItem[]>([])
    const [totalSuppliers, setTotalSuppliers] = useState(0)
    const [loading, setLoading] = useState(false)
    const [searchInput, setSearchInput] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const organisationId = localStorage.getItem("organisation_id") || ""
    const requestIdRef = useRef(0)

    useEffect(() => {
        const nextSearch = searchInput.trim()
        if (nextSearch === debouncedSearch) return
        const timer = window.setTimeout(() => {
            setDebouncedSearch(nextSearch)
            setPage(1)
        }, SEARCH_DEBOUNCE_MS)
        return () => window.clearTimeout(timer)
    }, [searchInput, debouncedSearch])

    const fetchSuppliers = async (pageNo: number, search: string) => {
        if (!organisationId) {
            messageApi.error("Missing organisation — please log in again")
            return
        }
        const requestId = ++requestIdRef.current
        setLoading(true)
        try {
            const trimmedSearch = search.trim()
            const response = await GetSuppliersByOrgID({
                organisation_id: organisationId,
                limit: pageSize,
                page_no: pageNo,
                ...(trimmedSearch ? { search: trimmedSearch } : {}),
            })
            if (requestId !== requestIdRef.current) return

            const rows = Array.isArray(response?.data) ? response.data : []
            const total = Number(response?.total)
            setSuppliers(rows)
            setTotalSuppliers(Number.isFinite(total) ? total : 0)

            const maxPage = Math.max(1, Math.ceil((Number.isFinite(total) ? total : 0) / pageSize) || 1)
            if (pageNo > maxPage) {
                setPage(maxPage)
            }
        } catch (error) {
            if (requestId !== requestIdRef.current) return
            console.error("Failed to load suppliers:", error)
            messageApi.error("Failed to load suppliers")
            setSuppliers([])
            setTotalSuppliers(0)
        } finally {
            if (requestId === requestIdRef.current) {
                setLoading(false)
            }
        }
    }

    useEffect(() => {
        fetchSuppliers(page, debouncedSearch)
        // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch when page / search changes
    }, [page, debouncedSearch, organisationId])

    const handleStatusChange = (supplierId: string, nextStatus: string) => {
        setSuppliers((rows) =>
            rows.map((row) =>
                row.id === supplierId ? { ...row, supplier_status: nextStatus } : row,
            ),
        );
    };

    const columns: TableColumnsType<SupplierListItem> = [
        {
            title: "Code",
            dataIndex: "supplier_code",
            className: "column-layout",
            width: 110,
            render: (code: string) => (
                <StatusTag type={STATUS_INFO} className="code-badge">
                    {code || "—"}
                </StatusTag>
            ),
        },
        {
            title: "Supplier Name",
            dataIndex: "name",
            className: "other-layout",
            width: 140,
            ellipsis: true,
        },
        {
            title: "Contact",
            dataIndex: "contact_number",
            className: "other-layout",
            width: 110,
            render: (value?: string) => value || "—",
        },
        {
            title: "Email",
            dataIndex: "email",
            className: "other-layout",
            width: 160,
            ellipsis: true,
            render: (value?: string) => value || "—",
        },
        {
            title: "Payment Terms",
            dataIndex: "payment_terms",
            className: "other-layout",
            width: 110,
            ellipsis: true,
            render: (value?: string) => value || "—",
        },
        {
            title: "Created",
            dataIndex: "created_at",
            className: "other-layout",
            width: 100,
            render: (value?: string) => value || "—",
        },
        {
            title: "Status",
            dataIndex: "supplier_status",
            align: "center",
            width: 110,
            render: (status: string, record) => {
                const meta = getStatusMeta(status);
                return (
                    <Dropdown
                        trigger={["click"]}
                        menu={{
                            selectable: true,
                            selectedKeys: [normalizeStatus(status)],
                            items: SUPPLIER_STATUS_OPTIONS.map((opt) => ({
                                key: opt.value,
                                label: (
                                    <StatusTag type={getSupplierStatusType(opt.value)} bordered>
                                        {opt.label}
                                    </StatusTag>
                                ),
                            })),
                            onClick: ({ key }) => handleStatusChange(record.id, key),
                        }}
                    >
                        <Tag
                            bordered
                            className={statusTagClassName(
                                getSupplierStatusType(status),
                                "supplier-status-tag",
                            )}
                            role="button"
                            tabIndex={0}
                            aria-label={`Change status for ${record.name}`}
                        >
                            {meta.label}
                            <DownOutlined className="supplier-status-caret" />
                        </Tag>
                    </Dropdown>
                );
            },
        },
        {
            title: "Action",
            key: "action",
            align: "center",
            width: 100,
            fixed: "right",
            render: (_, record) => (
                can("medicine", "update") ? (
                    <Button
                        type="primary"
                        size="small"
                        className="fill-stock-btn"
                        onClick={() =>
                            navigate(`/suppliers/${record.id}/fill-stock`, {
                                state: {
                                    supplierName: record.name,
                                    supplierCode: record.supplier_code,
                                    supplierStatus: record.supplier_status,
                                },
                            })
                        }
                    >
                        Fill Stock
                    </Button>
                ) : null
            ),
        },
    ]

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
                                    <ShopOutlined />
                                    <span>Suppliers</span>
                                </>
                            ),
                        },
                    ]}
                />

                <Content className="main-layout">
                    <div className="button-layout">
                        {canCreate("medicine") ? (
                            <Button
                                className="appointment-button"
                                icon={<PlusCircleOutlined />}
                                onClick={() => navigate("/suppliers/add")}
                            >
                                Add New Supplier
                            </Button>
                        ) : null}
                    </div>

                    <div className="search-layout">
                        <Input
                            allowClear
                            placeholder="Search by supplier name, license, or city..."
                            className="search-input1"
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
                        <Table<SupplierListItem>
                            columns={columns}
                            dataSource={suppliers}
                            rowKey="id"
                            loading={loading}
                            pagination={false}
                            size="small"
                            scroll={{ x: 940 }}
                            locale={{ emptyText: "No suppliers yet" }}
                        />
                    </div>

                    <div className="pagination-tab">
                        <span className="count-label">
                            Total Suppliers ({totalSuppliers})
                        </span>
                        <Pagination
                            current={page}
                            pageSize={pageSize}
                            total={totalSuppliers}
                            onChange={(nextPage) => setPage(nextPage)}
                            showSizeChanger={false}
                        />
                    </div>
                </Content>
            </Layout>
        </Layout>
    )
}

export default Pharmacy
