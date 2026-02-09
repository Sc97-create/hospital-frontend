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

interface SecondStepProps {
  onNext: () => void;
  onBack: () => void;
}

const { Option } = Select;

function SecondStep({ onNext, onBack }: SecondStepProps) {
  return (
    <div className="main-layout">
      <h2>Location & Security</h2>
      <p className="muted-text" style={{ marginBottom: 24 }}>
        Set your organization's primary operating location and review mandatory
        security protocols.
      </p>

      <Form layout="vertical">
        {/* ✅ Location Details Card */}
        <Card
          title="📍 Location Details"
          bordered
          style={{ marginBottom: 24 }}
        >
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item label="Country" required>
                <Select defaultValue="United States">
                  <Option value="United States">United States</Option>
                  <Option value="India">India</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="State / Province" required>
                <Input placeholder="e.g. California" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="City" required>
                <Input placeholder="e.g. San Francisco" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Timezone" required>
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
              <Switch defaultChecked />
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
              <Switch />
            </Col>
          </Row>
        </Card>

        {/* Navigation */}
        <div className="button-row1">
          <Button className="custom-primary-btn" onClick={onBack}>
            ← Back
          </Button>
          <Button className="custom-primary-btn" onClick={onNext}>
            Next: Root Admin →
          </Button>
        </div>
      </Form>
    </div>
  );
}

export default SecondStep;
