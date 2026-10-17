import { Breadcrumb, Layout } from "antd";
import { EnvironmentOutlined, HomeOutlined } from "@ant-design/icons";
import Sidebar from "../sidebar";
import "../prescriptions/prescription-details.css";

const { Content } = Layout;

function DiagnosticCenter() {
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
                                    <EnvironmentOutlined />
                                    <span>Diagnostic Center</span>
                                </>
                            ),
                        },
                    ]}
                />

                <Content className="main-layout prescriptions-page">
                    <div className="table-wrapper">
                        <div className="table-footer">
                            <span className="count-label">No diagnostic centers</span>
                        </div>
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}

export default DiagnosticCenter;
