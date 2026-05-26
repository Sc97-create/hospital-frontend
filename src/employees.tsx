import { Breadcrumb, Button, Input, Layout } from "antd"
import Sidebar from "./sidebar"
import Header from "./header"
import { Link, useNavigate } from "react-router-dom"
import { HomeOutlined, PlusCircleOutlined, SearchOutlined } from '@ant-design/icons'
import { Content } from "antd/es/layout/layout"

function Employees() {
    const navigate = useNavigate()
    return (
        <>
            <Layout>
                <Sidebar />
                <Layout>
                    <Header />
                    <div className="breadcrumb-layout">
                        <Breadcrumb>
                            <Breadcrumb.Item>
                                <HomeOutlined />
                                <Link to={'/dashboard'}>Overview</Link>
                            </Breadcrumb.Item>
                            <Breadcrumb.Item>
                                Employees
                            </Breadcrumb.Item>
                        </Breadcrumb>
                    </div>
                    <Content className="main-layout">
                        <div className="button-layout">
                            <Button icon={<PlusCircleOutlined />} className="appointment-button" onClick={() => { navigate('/employees/add-employee') }}>
                                Add Employee
                            </Button>
                        </div>
                        <div className="search-layout">
                            <Input className="search-input1" placeholder="search employees" suffix={<SearchOutlined />} />
                        </div>
                    </Content>

                </Layout>
            </Layout>
        </>
    )
}

export default Employees