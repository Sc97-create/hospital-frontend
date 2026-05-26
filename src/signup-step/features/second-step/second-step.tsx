import {
  Row,
  Col,
  Form,
  Input,
  Select,
  Switch,
  Button,
  Alert,
  Card,
} from "antd";

import './second-step.css'
import { useSecondSignup } from "./useSecondStepSignup";
import type { SecondSignupPayload } from "../../types/second-step-signup";
import { useEffect, useState } from "react";

interface SecondStepProps {
  data: any
  organisationID: string;
  OnUpdate(): void
  onNext: () => void;
  onBack: () => void;
}

const { Option } = Select;

function SecondStep({ data, OnUpdate, organisationID, onNext, onBack }: SecondStepProps) {
  const { mutate, isPending } = useSecondSignup();
  const [form] = Form.useForm<SecondSignupPayload>();
  const [auditLogs, setAuditLogs] = useState(true);
  const [emergencyAccess, setEmergencyAccess] = useState(false);

  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        country_id: data?.address?.country_id ? data.address.country_id : 'United States',
        state_id: data?.address?.state,
        city_id: data?.address?.city
      })
    }
  }, [data, isPending])

  console.log("org id", organisationID)
  const onFinish = (values: Omit<SecondSignupPayload, "organisation_id">) => {
    mutate({
      organisation_id: organisationID,
      ...values,
    },
      {
        onSuccess: (data) => {
          OnUpdate()
          console.log("API Success", data);
          onNext();
        },
        onError: (error) => {
          console.error("API failed", error);
        }
      });
  };
  return (
    <div className="main-layout">
      <h2>Location & Security</h2>
      <p className="muted-text" style={{ marginBottom: 24 }}>
        Set your organization's primary operating location and review mandatory
        security protocols.
      </p>

      <Form layout="vertical" form={form} initialValues={{
        country_id: "United States",
        timezone: "GMT-08:00"
      }} onFinish={onFinish}>
        {/* ✅ Location Details Card */}
        <Card
          title="📍 Location Details"
          style={{ marginBottom: 24 }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Country"
                name="country_id"
                rules={[{ required: true, message: "Please select country" }]}
              >
                <Select>
                  <Select.Option value="United States">United States</Select.Option>
                  <Select.Option value="India">India</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item label="State / Province" name="state_id" required>
                <Input placeholder="e.g. California" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item label="City" name="city_id" required>
                <Input placeholder="e.g. San Francisco" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item label="Timezone" name="timezone" required>
                <Select defaultValue="GMT-08:00">
                  <Option value="GMT-08:00">
                    (GMT-08:00) Pacific Time (US & Canada)
                  </Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* ✅ Security & Configuration Card */}
        <Card title="🛡 Security & Configuration" bordered>
          <Alert
            type="info"
            showIcon
            message="Security defaults are enabled to meet healthcare compliance requirements (HIPAA/GDPR). These settings ensure patient data remains protected at all times."
            style={{ marginBottom: 24 }}
          />

          <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
            <Col>
              <strong>Enable Audit Logs 🔒</strong>
              <p className="muted-text">
                Maintains a permanent record of all data access and modifications.
              </p>
            </Col>
            <Col>
              <Form.Item
                name="enable_audit_logs"
                valuePropName="checked"
                initialValue={true}
                noStyle
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Row justify="space-between" align="middle">
            <Col>
              <strong>Emergency Access (Break-Glass)</strong>
              <p className="muted-text">
                Allows override during critical outages or medical emergencies.
              </p>
            </Col>
            <Col>
              <Form.Item
                name="emergency_access"
                valuePropName="checked"
                initialValue={false}
                noStyle
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

        </Card>

        {/* Navigation */}
        <div className="button-row1">
          <Button className="custom-primary-btn" onClick={onBack}>
            ← Back
          </Button>
          <Button className="custom-primary-btn" htmlType="submit" loading={isPending}>
            Next: Root Admin →
          </Button>
        </div>
      </Form>
    </div>
  );
}

export default SecondStep;
