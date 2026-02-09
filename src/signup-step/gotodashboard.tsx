import React from "react";
import {
  Layout,
  Typography,
  Card,
  Button,
  Space,
  Avatar,
} from "antd";
import {
  CheckCircleFilled,
  DashboardOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import "./OrganisationSuccess.css";

const { Header, Content } = Layout;
const { Title, Text, Link } = Typography;


 
interface OrganisationSuccessProps {
  organisationName: string;
  rootAdminEmail: string;
  onGoToDashboard: () => void;
  onInviteUsers: () => void;
  avatarUrl?: string;
}


const OrganisationSuccess: React.FC<OrganisationSuccessProps> = ({
  organisationName,
  rootAdminEmail,
  onGoToDashboard,
  onInviteUsers,
  avatarUrl,
}) => {
  return (
    <Layout className="success-layout">
      {/* Header */}
      <Header className="success-header">
        <div className="header-left">
          <div className="app-logo">+</div>
          <span className="app-title">
            Hospital Management Platform
          </span>
        </div>

        <Avatar
          size={36}
          src={avatarUrl}
        />
      </Header>

      {/* Content */}
      <Content className="success-content">
        <div className="success-center">
          {/* Success Icon */}
          <div className="success-icon">
            <CheckCircleFilled />
          </div>

          {/* Title */}
          <Title level={2} className="success-title">
            Organisation Created <br /> Successfully
          </Title>

          <Text className="success-subtitle">
            Your hospital environment is ready. You can now start
            managing patients, staff, and medical records.
          </Text>

          {/* Summary Card */}
          <Card className="success-card">
            <div className="summary-row">
              <Text className="summary-label">
                ORGANIZATION NAME
              </Text>
              <Text className="summary-value">
                {organisationName}
              </Text>
            </div>

            <div className="summary-divider" />

            <div className="summary-row">
              <Text className="summary-label">
                ROOT ADMIN
              </Text>
              <Text className="summary-value">
                {rootAdminEmail}
              </Text>
            </div>
          </Card>

          {/* Actions */}
          <Space size={16} className="success-actions">
            <Button
              type="primary"
              size="large"
              icon={<DashboardOutlined />}
              onClick={onGoToDashboard}
              className="dashboard-btn"
            >
              Go to Dashboard
            </Button>

            <Button
              size="large"
              icon={<UserAddOutlined />}
              onClick={onInviteUsers}
            >
              Invite Users
            </Button>
          </Space>

          {/* Help */}
          <div className="success-help">
            <Link>
              📖 Need help? View Quick Start Guide
            </Link>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default OrganisationSuccess;
