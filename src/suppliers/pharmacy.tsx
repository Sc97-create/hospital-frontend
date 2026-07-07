import { Breadcrumb, Button, Input, Layout, Pagination, Table, Tag } from "antd"
import type { TableColumnsType } from "antd"
import Sidebar from "../sidebar"
import './pharmacy.css'
import { HomeOutlined, PlusCircleOutlined, SearchOutlined, ShopOutlined } from '@ant-design/icons'
import { Content } from "antd/es/layout/layout"
import { useNavigate } from "react-router-dom"
import { useMemo, useState } from "react"

interface Supplier {
    id: string;
    name: string;
    location: string;
    status: "active" | "closed";
    orders: number;
}

interface SupplierRow extends Supplier {
    key: string;
}

const suppliers: Supplier[] = [
    {
        id: "PL-9920-X",
        name: "PharmaLink Distribution",
        location: "New Jersey, USA",
        status: "active",
        orders: 12,
    },
    {
        id: "GML-1044-A",
        name: "Global Med Logics",
        location: "Geneva, Switzerland",
        status: "closed",
        orders: 5,
    },
    {
        id: "APX-5511-B",
        name: "Apex Health Supplies",
        location: "Local Warehouse",
        status: "active",
        orders: 24,
    },
    {
        id: "CRYO-2234-L",
        name: "CryoPharma Express",
        location: "Toronto, Canada",
        status: "closed",
        orders: 8,
    },
    {
        id: "MED-7788-Z",
        name: "MediCore Supplies",
        location: "Mumbai, India",
        status: "active",
        orders: 18,
    },
];

function AddPharmacy() {
    const navigate = useNavigate()
    const [page, setPage] = useState(1)
    const pageSize = 10
    const totalSuppliers = 124

    const dataSource: SupplierRow[] = useMemo(
        () => suppliers.map((supplier) => ({ ...supplier, key: supplier.id })),
        []
    )

    const columns: TableColumnsType<SupplierRow> = [
        {
            title: "Code",
            dataIndex: "id",
            className: "column-layout",
            render: (id: string) => <span className="code-badge">{id}</span>,
        },
        {
            title: "Supplier Name",
            dataIndex: "name",
            className: "other-layout",
        },
        {
            title: "Location",
            dataIndex: "location",
            className: "other-layout",
        },
        {
            title: "Active Contracts",
            dataIndex: "orders",
            className: "other-layout",
            render: (orders: number) => `${orders} active orders`,
        },
        {
            title: "Status",
            dataIndex: "status",
            align: "center",
            render: (status: Supplier["status"]) => (
                <Tag color={status === "active" ? "green" : "red"} bordered className="app-tag">
                    {status === "active" ? "Active" : "Closed"}
                </Tag>
            ),
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
                    onClick={() => navigate(`/suppliers/${record.id}/fill-stock`)}
                >
                    Fill Stock
                </Button>
            ),
        },
    ]

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
                        <Table<SupplierRow>
                            columns={columns}
                            dataSource={dataSource}
                            pagination={false}
                            scroll={{ x: "max-content", y: 400 }}
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

export default AddPharmacy
