import { Card, Layout, List } from "antd"
import './third-step-appointment.css'

function PreviewAppointment() {
    const previewData = [
        { label: "Patient Name", value: "Manjunath Holi" },
        { label: "Age", value: "41" },
        { label: "Gender", value: "Female" },
        { label: "Contact", value: "696969696969" },
    ];
    return <>
        <Layout>
            <Card className="thirdstepcard">
                <div className="profile-summary-heading">
                    <div className="icon">

                    </div>
                    <div className="profile-name">
                        <h2>Patient Summary</h2>
                        <h4>A summary of patients personal information</h4>
                    </div>
                </div>
                <hr className="divider" />
                <List
                    dataSource={previewData}

                    renderItem={(item) => (
                        <List.Item
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                padding: "8px 0",
                            }}>
                            <List.Item.Meta title={item.label} />
                            <div>{item.value}</div>
                        </List.Item>
                    )}
                />
            </Card>
            <Card className="thirdstepcard">
                <div className="appointment-text">
                    <h2>Appointment Details</h2>
                </div>
                <hr className="divider"/>
                 <List
                    dataSource={previewData}

                    renderItem={(item) => (
                        <List.Item
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                padding: "8px 0",
                            }}>
                            <List.Item.Meta title={item.label} />
                            <div>{item.value}</div>
                        </List.Item>
                    )}
                />
            </Card>
            <Card className="thirdstepcard">
                <div className="appointment-text">
                    <h2>Admission Details</h2>
                </div>
                <hr className="divider"/>
                 <List
                    dataSource={previewData}

                    renderItem={(item) => (
                        <List.Item
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                padding: "8px 0",
                            }}>
                            <List.Item.Meta title={item.label} />
                            <div>{item.value}</div>
                        </List.Item>
                    )}
                />
            </Card>
        </Layout>
    </>
}
export default PreviewAppointment