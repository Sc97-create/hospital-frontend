import { Breadcrumb, Button, Drawer, Input, Layout } from "antd"
import Sidebar from "../sidebar"
import Header from "../header"
import './pharmacy.css'
import { MedicineBoxOutlined, PlusCircleOutlined, SearchOutlined, ShopOutlined } from '@ant-design/icons'
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

                                Pharmacy
                            </Breadcrumb.Item>
                            <Breadcrumb.Item>
                                Pharmacy List
                            </Breadcrumb.Item>
                        </Breadcrumb>
                    </div>
                    <Content className="main-layout">

                        <div className="button-layout">
                            <Button icon={<PlusCircleOutlined />} className="appointment-button" onClick={() => navigate("add")}>
                                Add Medicine
                            </Button>
                            <Drawer
                                title={
                                    <>
                                        <MedicineBoxOutlined /> Add New Medicine
                                        <div style={{ fontSize: 12, color: "#888" }}>
                                            Enter medicine details for pharmacy records
                                        </div>
                                    </>
                                }
                                open={!!isAddOpen}
                                placement="right"
                                closable={true}
                                width={420}
                                onClose={() => navigate("/pharmacy")}>
                                <Outlet />
                            </Drawer>
                        </div>

                        <div className="search-layout">
                            <Input className="search-input" placeholder="search pharamcy" suffix={<SearchOutlined />} />
                        </div>
                        <div className="table-data">
                            <h3>table data goes here</h3>
                        </div>


                    </Content>
                </Layout>
            </Layout>
        </>
    )
}
export default AddPharmacy