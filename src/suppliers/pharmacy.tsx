import { Breadcrumb, Button, Card, Col, Drawer, Input, Layout, Row, Tag, Typography } from "antd"
import Sidebar from "../sidebar"
import Header from "../header"
import './pharmacy.css'
import { MedicineBoxOutlined, PlusCircleOutlined, PlusOutlined, SearchOutlined, ShopOutlined } from '@ant-design/icons'
import { Content } from "antd/es/layout/layout"
import { Outlet, useMatch, useNavigate, useParams } from "react-router-dom"
import { useState } from "react"

function AddPharmacy() {
    const navigate = useNavigate()
    const isAddOpen = useMatch("/pharmacy/add")
    const [open, setOpen] = useState(false);
    const { id } = useParams();
    const showDrawer = () => {
        setOpen(true);
    };
    const { Title, Text } = Typography;

    interface Supplier {
        id: string;
        name: string;
        location: string;
        status: "active" | "closed";
        orders: number;
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
        }
    ];

    const onClose = () => {
        setOpen(false);
    };
    return (
        <>
            <Layout>
                <Sidebar />
                <Layout>
                    <Header />
                    <div className="breadcrumb-layout">
                        <Breadcrumb >
                            <Breadcrumb.Item>

                                Suppliers
                            </Breadcrumb.Item>
                            <Breadcrumb.Item>
                                Suppliers List
                            </Breadcrumb.Item>
                        </Breadcrumb>
                    </div>
                    <Content className="supplier-container">


                        <div className="supplier-wrapper">

                            {/* Header */}
                            <div className="supplier-header">
                                <div>
                                    <Title level={3}>Supplier Selection</Title>
                                    <Text className="subtitle">
                                        Choose a registered supplier to begin your purchase entry or create a new partner profile for the pharmacy network.
                                    </Text>
                                </div>

                                <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("add")}>
                                    Add New Supplier
                                </Button>
                            </div>

                            {/* Search + Filters */}
                            <div className="search-bar">
                                <Input
                                    placeholder="Search by supplier name, license, or city..."
                                    prefix={<SearchOutlined />}
                                    className="search-input"
                                />

                                <Button className="action-btn">Filters</Button>
                                <Button className="action-btn">Sort</Button>
                            </div>

                            {/* Supplier Cards */}
                            <div className="supplier-grid">
                                {suppliers.map((supplier) => (
                                    <Card key={supplier.id} className="supplier-card" hoverable>

                                        {/* Header */}
                                        <div className="card-header">
                                            <Tag color={supplier.status === "active" ? "green" : "red"} className="app-tag">
                                                {supplier.status === "active" ? "Active" : "Closed"}
                                            </Tag>
                                        </div>

                                        {/* Body */}
                                        <div className="card-body">
                                            <Title level={5} className="supplier-title">
                                                {supplier.name}
                                            </Title>

                                            <Text type="secondary" className="supplier-info">
                                                ID: {supplier.id} | {supplier.location}
                                            </Text>
                                        </div>

                                        {/* Footer */}
                                        <div className="card-footer">
                                            <div className="contract-info">
                                                <span className="contracts-label">Active Contracts</span>
                                                <span className="contracts-value">
                                                    {supplier.orders} active orders
                                                </span>
                                            </div>

                                            <Button
                                                type="primary"
                                                size="small"
                                                className="add-medicine-btn"
                                                onClick={() => navigate(`/suppliers/${supplier.id}/add-medicines`)}
                                            >
                                                Add Medicines →
                                            </Button>
                                        </div>

                                    </Card>

                                ))}
                            </div>



                            {/* Load More */}
                            <div className="load-more">
                                <Button>Load More Suppliers</Button>
                                <Text className="footer-text">
                                    Showing 5 of 124 registered suppliers
                                </Text>
                            </div>

                        </div>

                    </Content>
                </Layout>
            </Layout>
        </>
    )
}
export default AddPharmacy