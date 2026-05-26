import { Breadcrumb, Button, Layout, Modal, Form, Input, message, Radio, Select, Row, Col } from "antd"
import './patient-overview.css'
import Sidebar from "./sidebar"
import HeaderLayout from "./header"
import { Link, useNavigate } from "react-router-dom";
import {
    CloseCircleOutlined,
    DownOutlined,
    HomeOutlined,
    MedicineBoxOutlined,
    PaperClipOutlined,
    PlusCircleOutlined,
    SearchOutlined,
    UserOutlined
} from '@ant-design/icons'
import { Content } from "antd/es/layout/layout"
import { Tabs } from 'antd'
import TabPane from "antd/es/tabs/TabPane";
import GeneralInfo from "./general-info";
import { useState } from "react";
import type { CheckboxGroupProps } from "antd/es/checkbox";
import PrescriptionDetails from "./prescription-details";
import AddPrescription from "./add-prescription";

function OverviewPatient() {
const [open, setOpen] = useState(false);


    return (
        <>
            <Layout>

                <Sidebar />
                <Layout>

                    <Breadcrumb className='appointment-breadcrumb-layout'>
                        <Breadcrumb.Item>
                            <HomeOutlined />
                            <Link to='/dashboard'>Home</Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            <UserOutlined />
                            <Link to='/patients'>Patient List</Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            Patient Overview
                        </Breadcrumb.Item>
                    </Breadcrumb>
                    <Content className="main-layout">
                        <div className="prescription-button-layout">
                            <Button disabled style={{ width: 240, height: 40 }}>
                                Add BP Record
                            </Button>
                            <Button
                                className="appointment-button"
                                icon={<PlusCircleOutlined />}
                                onClick={() => setOpen(true)}
                            >
                                Add Prescription
                            </Button>
                            <AddPrescription open={open} onClose={()=>setOpen(false)}/>
                        </div>
                        <Tabs className="tabs-layout" type="card" defaultActiveKey="1" tabBarGutter={16}>
                            <TabPane className="each-tab" tab='General Information' key='1' icon={<UserOutlined />}>
                                <GeneralInfo />
                            </TabPane>
                            <TabPane tab='Prescription Details' key='2' icon={<MedicineBoxOutlined />}>
                                <PrescriptionDetails />
                            </TabPane>
                            <TabPane tab='Laboratory Information' key='3' icon={<PaperClipOutlined />}>
                                <h2>general info of patient</h2>
                            </TabPane>
                        </Tabs>


                    </Content>
                </Layout>
            </Layout>


        </>
    )

}

export default OverviewPatient

