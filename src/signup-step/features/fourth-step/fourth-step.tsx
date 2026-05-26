import React, { useEffect } from "react";
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

interface FourthProps {
    Userdata: any;
    OrgData: any;
    onBack: () => void;
}

const ReviewAndCreate = ({ Userdata, OrgData, onBack }: FourthProps) => {
    const navigate = useNavigate();

    useEffect(() => {
        if (Userdata) {
            console.log('data123', Userdata)
        }
        if (OrgData) {
            console.log('orgdata123', OrgData)
        }

    })
    const handleCreateOrganisation = async () => {
        try {
            navigate("/login");
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
                style={{ marginBottom: 16 }}
                className="review-card"
            >
                <Row gutter={[32, 20]}>
                    <Col xs={24} sm={12}>
                        <Text type="secondary" className="review-label">
                            ORGANISATION NAME
                        </Text>
                        <div>
                            <Text strong>{OrgData?.organisation_name}</Text>
                        </div>
                    </Col>

                    <Col xs={24} sm={12}>
                        <Text type="secondary" className="review-label">
                            TAX ID / REGISTRATION
                        </Text>
                        <div>
                            <Text strong>{OrgData?.code}</Text>
                        </div>
                    </Col>

                    <Col xs={24} sm={12}>
                        <Text type="secondary" className="review-label">
                            TYPE
                        </Text>
                        <div>
                            <Text strong>{OrgData?.hospital_type}</Text>
                        </div>
                    </Col>
                </Row>
            </Card>

            {/* Location & Contact */}
            <Card
                title="Location & Contact"
                extra={<Link><EditOutlined /> Edit</Link>}
                style={{ marginBottom: 16 }}
                className="review-card"
            >
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                        <Text type="secondary" className="review-label">COUNTRY</Text>
                        <div>
                            <Text strong>
                                {OrgData?.address.country_id}
                            </Text>
                        </div>

                    </Col>

                    <Col xs={24} sm={12}>
                        <Text type="secondary" className="review-label">CITY & STATE</Text>
                        <div>
                            <Text strong>{OrgData?.address.city}, {OrgData?.address.state}</Text>
                        </div>

                    </Col>
                </Row>
            </Card>

            {/* Root Admin Profile */}
            <Card
                title="Root Admin Profile"
                extra={<Link><EditOutlined /> Edit</Link>}>
                <Row align="middle" gutter={16}>
                    <Col>
                        <Avatar size={32} icon={<UserOutlined />} />
                    </Col>
                    <Col>
                        <Text type="secondary" className="review-label">FULL NAME</Text>
                        <div>
                            <Text strong>{Userdata?.username}</Text>
                        </div>
                        <div>
                            <Tag
                                color="#25D366"
                                className="root-admin-tag">
                                ROOT ADMIN
                            </Tag>
                        </div>
                    </Col>
                    <Col flex="auto" />
                    <Col>
                        <Text type="secondary">PROFESSIONAL EMAIL</Text>
                        <div>
                            <Text strong>
                                {Userdata?.email_id}
                            </Text>
                        </div>
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
