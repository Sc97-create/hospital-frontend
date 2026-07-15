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
import { useEffect, useState } from "react"
import { GetSuppliersByOrgID } from "./api/supplier"
import type { SupplierListItem } from "./types/supplier"

const SUPPLIER_STATUS_OPTIONS = [
    { value: "Active", label: "Active", color: "green" },
    { value: "Inactive", label: "Inactive", color: "red" },
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
            color: "default" as const,
        }
    );
}

function Pharmacy() {
    const navigate = useNavigate()
    const [messageApi, contextHolder] = message.useMessage()
    const [page, setPage] = useState(1)
    const pageSize = 10
    const [suppliers, setSuppliers] = useState<SupplierListItem[]>([])
    const [totalSuppliers, setTotalSuppliers] = useState(0)
    const [loading, setLoading] = useState(false)
    const organisationId = localStorage.getItem("organisation_id") || ""

    const fetchSuppliers = async (pageNo: number) => {
        if (!organisationId) {
            messageApi.error("Missing organisation — please log in again")
            return
        }
        setLoading(true)
        try {
            const response = await GetSuppliersByOrgID(organisationId, pageSize, pageNo)
            const rows = Array.isArray(response?.data) ? response.data : []
            const total = Number(response?.total)
            setSuppliers(rows)
            setTotalSuppliers(Number.isFinite(total) ? total : 0)
        } catch (error) {
            console.error("Failed to load suppliers:", error)
            messageApi.error("Failed to load suppliers")
            setSuppliers([])
            setTotalSuppliers(0)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSuppliers(page)
        // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch when page changes
    }, [page, organisationId])

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
            render: (code: string) => <span className="code-badge">{code || "—"}</span>,
        },
        {
            title: "Supplier Name",
            dataIndex: "name",
            className: "other-layout",
        },
        {
            title: "Contact",
            dataIndex: "contact_number",
            className: "other-layout",
            render: (value?: string) => value || "—",
        },
        {
            title: "Email",
            dataIndex: "email",
            className: "other-layout",
            render: (value?: string) => value || "—",
        },
        {
            title: "Payment Terms",
            dataIndex: "payment_terms",
            className: "other-layout",
            render: (value?: string) => value || "—",
        },
        {
            title: "Created",
            dataIndex: "created_at",
            className: "other-layout",
            render: (value?: string) => value || "—",
        },
        {
            title: "Status",
            dataIndex: "supplier_status",
            align: "center",
            width: 140,
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
                                    <Tag color={opt.color} bordered className="app-tag">
                                        {opt.label}
                                    </Tag>
                                ),
                            })),
                            onClick: ({ key }) => handleStatusChange(record.id, key),
                        }}
                    >
                        <Tag
                            color={meta.color}
                            bordered
                            className="supplier-status-tag app-tag"
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
            render: (_, record) => (
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
                        <Button
                            className="appointment-button"
                            icon={<PlusCircleOutlined />}
                            onClick={() => navigate("/suppliers/add")}
                        >
                            Add New Supplier
                        </Button>
                    </div>

                    <div className="search-layout">
                        <Input
                            placeholder="Search by supplier name, license, or city..."
                            className="search-input1"
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
                            scroll={{ x: "max-content", y: 400 }}
                            locale={{ emptyText: "No suppliers yet" }}
                            showSorterTooltip={{ target: "sorter-icon" }}
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
