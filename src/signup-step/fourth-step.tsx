import React from "react";
import {
    Layout,
    Typography,
    Progress,
    Alert,
    Card,
    Row,
    Col,
    Button,
    Avatar,
    Space,
    Divider,
    Tag,
} from "antd";
import {
    EditOutlined,
    UserOutlined,
    WarningOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Header, Content, Footer } = Layout;
const { Title, Text, Link } = Typography;

const ReviewAndCreate = ({ onBack }: any) => {
    const navigate = useNavigate();

    const handleCreateOrganisation = async () => {
        try {
            // 🔹 API call goes here
            // await createOrganisation(payload);

            // ✅ Navigate to dashboard on success
            navigate("/employees/add-employee");
        } catch (error) {
            console.error("Failed to create organisation", error);
        }
    };
    return (

        <Content>
            {/* Step & Progress */}
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
                <Text strong>Step 4: Review & Create</Text>
                <Progress percent={100} showInfo />
                <Text type="secondary">Finalizing your organization setup</Text>
            </Space>

            <Divider />

            {/* Title */}
            <Title level={2}>Final Review</Title>
            <Text type="secondary">
                Please verify all details before finalizing your organization setup.
            </Text>

            <Divider />

            {/* Warning */}
            <Alert
                message="Root Admin Access Warning"
                description="The Root Admin assigned will have full system access, including billing, user management, and security protocols."
                type="warning"
                showIcon
                icon={<WarningOutlined />}
                action={
                    <Button size="small" type="default">
                        Acknowledge
                    </Button>
                }
                style={{ marginBottom: 24 }}
            />

            {/* Organisation Details */}
            <Card
                title="Organisation Details"
                extra={<Link><EditOutlined /> Edit</Link>}
                style={{ marginBottom: 16 }}>
                <Row gutter={[16, 16]}>
                    <Col span={12}>
                        <Text type="secondary">ORGANISATION NAME</Text>
                        <br />
                        <Text strong>St. Jude Medical Center</Text>
                    </Col>
                    <Col span={12}>
                        <Text type="secondary">TAX ID / REGISTRATION</Text>
                        <br />
                        <Text strong>TAX-882910-B</Text>
                    </Col>

                    <Col span={12}>
                        <Text type="secondary">TYPE</Text>
                        <br />
                        <Text strong>General Hospital (Private)</Text>
                    </Col>
                    <Col span={12}>
                        <Text type="secondary">WEBSITE</Text>
                        <br />
                        <Link href="https://www.stjude-medical.com" target="_blank">
                            www.stjude-medical.com
                        </Link>
                    </Col>
                </Row>
            </Card>

            {/* Location & Contact */}
            <Card
                title="Location & Contact"
                extra={<Link><EditOutlined /> Edit</Link>}
                style={{ marginBottom: 16 }}
            >
                <Row gutter={[16, 16]}>
                    <Col span={12}>
                        <Text type="secondary">STREET ADDRESS</Text>
                        <br />
                        <Text strong>
                            124 Healthcare Plaza, Medical District
                        </Text>
                    </Col>

                    <Col span={12}>
                        <Text type="secondary">CONTACT NUMBER</Text>
                        <br />
                        <Text strong>+1 (617) 555-0123</Text>
                    </Col>

                    <Col span={12}>
                        <Text type="secondary">CITY & STATE</Text>
                        <br />
                        <Text strong>Boston, Massachusetts</Text>
                    </Col>
                </Row>
            </Card>

            {/* Root Admin Profile */}
            <Card
                title="Root Admin Profile"
                extra={<Link><EditOutlined /> Edit</Link>}>
                <Row align="middle" gutter={16}>
                    <Col>
                        <Avatar size={64} icon={<UserOutlined />} />
                    </Col>
                    <Col>
                        <Text type="secondary">FULL NAME</Text>
                        <br />
                        <Text strong>Dr. Sarah Richardson</Text>
                        <br />
                        <Tag
                            color="#25D366"
                            className="root-admin-tag">
                            ROOT ADMIN
                        </Tag>

                    </Col>
                    <Col flex="auto" />
                    <Col>
                        <Text type="secondary">PROFESSIONAL EMAIL</Text>
                        <br />
                        <Text strong>
                            s.richardson@stjude-medical.com
                        </Text>
                    </Col>
                </Row>
            </Card>
            <div className="button-row1">
                <Button onClick={onBack}>Back</Button>
                <Button onClick={handleCreateOrganisation} className="custom-primary-btn">
                    Create Organisation
                </Button>
            </div>
        </Content>



    );
};

export default ReviewAndCreate;
