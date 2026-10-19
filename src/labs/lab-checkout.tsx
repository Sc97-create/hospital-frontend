import {
    Avatar,
    Breadcrumb,
    Button,
    Card,
    Checkbox,
    Col,
    Input,
    Layout,
    message,
    Modal,
    Row,
    Segmented,
    Space,
    Spin,
    Table,
    Typography,
} from "antd";
import {
    ArrowLeftOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    ExperimentOutlined,
    HomeOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Sidebar from "../sidebar";
import { StatusTag } from "../components/status-tag";
import {
    getLabStatusType,
    STATUS_INFO,
    STATUS_SUCCESS,
} from "../constants/status-colors";
import SwipeToConfirm from "../prescriptions/components/swipe-to-confirm";
import { GetLabOrderById } from "./api/lab-order";
import type { LabOrderDetail, LabOrderDetailTest } from "./types/lab-order";
import "../prescriptions/prescription-preview.css";
import "../prescriptions/prescription-checkout.css";

const { Content } = Layout;
const { Title, Text } = Typography;

const TAX_RATE = 0.05;
const DEFAULT_TEST_PRICE = 0;
const CHECKOUT_TIMEOUT_SECONDS = 2 * 60;

type PaymentMethod = "cash" | "qr" | "link";

type CheckoutLine = {
    key: string;
    name: string;
    code: string;
    status: string;
    unit_price: number;
    selected: boolean;
};

function formatInr(amount: number) {
    return `₹${amount.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function formatCountdown(totalSeconds: number) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatStatusLabel(status: string) {
    if (!status?.trim()) return "—";
    return status
        .trim()
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getOrderTestTitle(tests: LabOrderDetailTest[]) {
    const names = tests.map((test) => test.name?.trim()).filter(Boolean);
    if (!names.length) return "Lab Order";
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]}, ${names[1]}`;
    return `${names[0]} +${names.length - 1} more`;
}

function toCheckoutLines(tests: LabOrderDetailTest[]): CheckoutLine[] {
    return tests.map((test) => ({
        key: test.id,
        name: test.name,
        code: test.sub_test || "",
        status: test.status,
        unit_price: DEFAULT_TEST_PRICE,
        selected: test.status?.trim().toLowerCase() !== "cancelled",
    }));
}

function LabCheckout() {
    const { labId = "" } = useParams<{ labId: string }>();
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();
    const [order, setOrder] = useState<LabOrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [lines, setLines] = useState<CheckoutLine[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
    const [notes, setNotes] = useState("");
    const [secondsLeft, setSecondsLeft] = useState(CHECKOUT_TIMEOUT_SECONDS);
    const [manualConfirmOpen, setManualConfirmOpen] = useState(false);
    const [paying, setPaying] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            if (!labId.trim()) {
                setOrder(null);
                setLines([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const data = await GetLabOrderById(labId);
                if (cancelled) return;
                setOrder(data);
                setLines(toCheckoutLines(data.tests ?? []));
            } catch (error) {
                console.error("Failed to load lab order for checkout:", error);
                if (!cancelled) {
                    setOrder(null);
                    setLines([]);
                    messageApi.error("Failed to load lab order");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        void load();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when lab id changes
    }, [labId]);

    useEffect(() => {
        if (secondsLeft <= 0) return;
        const id = window.setInterval(() => {
            setSecondsLeft((prev) => Math.max(0, prev - 1));
        }, 1000);
        return () => window.clearInterval(id);
    }, [secondsLeft]);

    const timerExpired = secondsLeft <= 0;
    const orderTitle = getOrderTestTitle(order?.tests ?? []);

    const totals = useMemo(() => {
        const selected = lines.filter((line) => line.selected);
        const subtotal = selected.reduce((sum, line) => sum + line.unit_price, 0);
        const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
        const total = Math.round((subtotal + tax) * 100) / 100;
        return {
            itemCount: selected.length,
            subtotal,
            tax,
            total,
        };
    }, [lines]);

    const updateLineSelected = (key: string, selected: boolean) => {
        setLines((prev) =>
            prev.map((line) => (line.key === key ? { ...line, selected } : line)),
        );
    };

    const goBack = () => navigate(`/lab/tests/${labId}`);

    const handleConfirmPay = () => {
        if (timerExpired) {
            messageApi.warning("Checkout session expired. Reload to retry.");
            return;
        }
        if (totals.itemCount === 0) {
            messageApi.warning("Select at least one test to bill");
            return;
        }
        if (paymentMethod === "link") {
            messageApi.success("Payment link created");
            navigate(`/lab/tests/${labId}`);
            return;
        }
        setManualConfirmOpen(true);
    };

    const confirmManualPayment = () => {
        setPaying(true);
        window.setTimeout(() => {
            setPaying(false);
            setManualConfirmOpen(false);
            messageApi.success("Payment confirmed");
            navigate(`/lab/tests/${labId}`);
        }, 400);
    };

    const columns = [
        {
            title: "",
            key: "selected",
            width: 48,
            render: (_: unknown, record: CheckoutLine) => (
                <Checkbox
                    checked={record.selected}
                    onChange={(e) => updateLineSelected(record.key, e.target.checked)}
                    aria-label={`Include ${record.name}`}
                />
            ),
        },
        {
            title: "TEST",
            key: "test",
            render: (_: unknown, record: CheckoutLine) => (
                <div className="medicine-info">
                    <Text strong>{record.name}</Text>
                    {record.code ? (
                        <Text type="secondary" className="medicine-generic">
                            {record.code}
                        </Text>
                    ) : null}
                </div>
            ),
        },
        {
            title: "STATUS",
            dataIndex: "status",
            key: "status",
            width: 120,
            render: (status: string) => (
                <StatusTag type={getLabStatusType(status)} bordered>
                    {formatStatusLabel(status)}
                </StatusTag>
            ),
        },
        {
            title: "UNIT PRICE",
            key: "unit_price",
            width: 120,
            align: "right" as const,
            render: (_: unknown, record: CheckoutLine) => (
                <Text type={record.selected ? undefined : "secondary"}>
                    {formatInr(record.unit_price)}
                </Text>
            ),
        },
        {
            title: "LINE TOTAL",
            key: "line_total",
            width: 120,
            align: "right" as const,
            render: (_: unknown, record: CheckoutLine) => (
                <Text strong={record.selected} type={record.selected ? undefined : "secondary"}>
                    {formatInr(record.selected ? record.unit_price : 0)}
                </Text>
            ),
        },
    ];

    return (
        <Layout>
            {contextHolder}
            <Sidebar />
            <Layout>
                <Breadcrumb className="appointment-breadcrumb-layout">
                    <Breadcrumb.Item>
                        <HomeOutlined />
                        <Link to="/lab/tests">Lab Tests</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <Link to={`/lab/tests/${labId}`}>
                            <ExperimentOutlined /> {orderTitle}
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Checkout</Breadcrumb.Item>
                </Breadcrumb>

                <Content className="pharmacy-main-layout checkout-layout">
                    {loading ? (
                        <div style={{ padding: 48, textAlign: "center" }}>
                            <Spin size="large" />
                        </div>
                    ) : !order ? (
                        <Card>
                            <Text type="secondary">Lab order not found.</Text>
                        </Card>
                    ) : (
                        <>
                            <div
                                className={`checkout-timer-banner ${
                                    timerExpired
                                        ? "checkout-timer-banner--expired"
                                        : secondsLeft <= 30
                                          ? "checkout-timer-banner--warn"
                                          : ""
                                }`}
                                role="status"
                                aria-live="polite"
                            >
                                <ClockCircleOutlined className="checkout-timer-banner__icon" />
                                <div className="checkout-timer-banner__text">
                                    <span className="checkout-timer-banner__label">
                                        Checkout timer
                                    </span>
                                    <span className="checkout-timer-banner__value">
                                        {timerExpired
                                            ? "Expired — reload to retry"
                                            : formatCountdown(secondsLeft)}
                                    </span>
                                </div>
                            </div>

                            <Card className="patient-card">
                                <Row justify="space-between" align="middle" gutter={[16, 16]}>
                                    <Col>
                                        <Space size={16}>
                                            <Avatar size={56} icon={<UserOutlined />} />
                                            <div>
                                                <Title level={5} className="patient-name">
                                                    {order.patient?.patient_name || "—"}
                                                </Title>
                                                <Text className="patient-subtext">
                                                    {order.patient?.patient_code || "—"}
                                                    {order.patient?.age != null
                                                        ? ` · ${order.patient.age}y`
                                                        : ""}
                                                </Text>
                                            </div>
                                        </Space>
                                    </Col>
                                    <Col>
                                        <div className="patient-meta">
                                            <div className="patient-meta__item">
                                                <Text className="info-label">TESTS</Text>
                                                <StatusTag
                                                    type={STATUS_INFO}
                                                    className="code-badge"
                                                >
                                                    {orderTitle}
                                                </StatusTag>
                                            </div>
                                            <div className="patient-meta__item">
                                                <Text className="info-label">LAB STATUS</Text>
                                                <StatusTag
                                                    type={getLabStatusType(order.status)}
                                                    bordered
                                                >
                                                    {formatStatusLabel(order.status)}
                                                </StatusTag>
                                            </div>
                                            <div className="patient-meta__item">
                                                <Text className="info-label">DOCTOR</Text>
                                                <Text>
                                                    {order.doctor?.doctor_name || "—"}
                                                </Text>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </Card>

                            <Card className="medicine-table-card">
                                <div className="table-header">
                                    <Space wrap>
                                        <Title level={5} className="table-title">
                                            Order items
                                        </Title>
                                        <StatusTag type={STATUS_INFO}>
                                            {totals.itemCount} billed
                                        </StatusTag>
                                        <StatusTag type={STATUS_SUCCESS}>Lab invoice</StatusTag>
                                    </Space>
                                </div>

                                <Table
                                    columns={columns}
                                    dataSource={lines}
                                    pagination={false}
                                    scroll={{ x: "max-content" }}
                                    className="medicine-table checkout-table"
                                    rowKey="key"
                                    rowClassName={(record) =>
                                        record.selected ? "" : "checkout-row--muted"
                                    }
                                    locale={{ emptyText: "No tests on this lab order" }}
                                />

                                <div className="checkout-below-table">
                                    <div className="checkout-payment-block">
                                        <Text className="info-label">PAYMENT METHOD</Text>
                                        <Segmented
                                            className="checkout-payment-segmented"
                                            value={paymentMethod}
                                            onChange={(value) =>
                                                setPaymentMethod(value as PaymentMethod)
                                            }
                                            options={[
                                                { label: "Cash", value: "cash" },
                                                { label: "QR", value: "qr" },
                                                { label: "Link", value: "link" },
                                            ]}
                                        />
                                        <Text type="secondary" className="checkout-payment-hint">
                                            {paymentMethod === "link"
                                                ? "Link: finishes automatically when the patient pays."
                                                : "Cash / QR: swipe to mark paid in a popup before finishing."}
                                        </Text>
                                        <Text className="info-label checkout-notes-label">
                                            NOTES
                                        </Text>
                                        <Input.TextArea
                                            className="notes-textarea"
                                            rows={2}
                                            maxLength={200}
                                            placeholder="Optional note (e.g. paid at counter)"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                        />
                                    </div>

                                    <div className="billing-summary checkout-billing">
                                        <div className="summary-row">
                                            <span>Subtotal</span>
                                            <span>{formatInr(totals.subtotal)}</span>
                                        </div>
                                        <div className="summary-row">
                                            <span>Tax (5%)</span>
                                            <span>{formatInr(totals.tax)}</span>
                                        </div>
                                        <div className="summary-row total">
                                            <Text strong>Total due</Text>
                                            <Text strong>{formatInr(totals.total)}</Text>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <div className="sticky-footer">
                                <Space wrap align="center">
                                    <Button icon={<ArrowLeftOutlined />} onClick={goBack}>
                                        Back
                                    </Button>
                                    <Text
                                        strong
                                        className={`checkout-timer-footer-text ${
                                            timerExpired
                                                ? "checkout-timer-footer-text--expired"
                                                : secondsLeft <= 30
                                                  ? "checkout-timer-footer-text--warn"
                                                  : ""
                                        }`}
                                    >
                                        <ClockCircleOutlined />{" "}
                                        {timerExpired
                                            ? "Time expired"
                                            : formatCountdown(secondsLeft)}
                                    </Text>
                                </Space>
                                <Space wrap>
                                    <Button danger onClick={goBack}>
                                        Discard
                                    </Button>
                                    <Button
                                        type="primary"
                                        icon={<CheckCircleOutlined />}
                                        className="confirm-btn"
                                        disabled={timerExpired || totals.itemCount === 0}
                                        onClick={handleConfirmPay}
                                    >
                                        {timerExpired ? "Time expired" : "Confirm & Pay"}
                                    </Button>
                                </Space>
                            </div>
                        </>
                    )}
                </Content>
            </Layout>

            <Modal
                open={manualConfirmOpen}
                title={
                    paymentMethod === "cash"
                        ? "Confirm cash payment"
                        : "Confirm QR payment"
                }
                onCancel={() => {
                    if (!paying) setManualConfirmOpen(false);
                }}
                maskClosable={!paying}
                footer={[
                    <Button
                        key="cancel"
                        disabled={paying}
                        onClick={() => setManualConfirmOpen(false)}
                    >
                        Cancel
                    </Button>,
                ]}
            >
                <Space direction="vertical" size={16} className="checkout-manual-modal">
                    <div className="checkout-manual-amount">
                        <Text type="secondary" className="checkout-manual-amount-label">
                            Amount due
                        </Text>
                        <Text strong className="checkout-manual-amount-value">
                            {formatInr(totals.total)}
                        </Text>
                    </div>

                    {paymentMethod === "qr" ? (
                        <div className="checkout-qr-placeholder" aria-hidden>
                            <div className="checkout-qr-mock-square" />
                            <Text type="secondary">QR code placeholder</Text>
                            <Text type="secondary" className="checkout-qr-amount">
                                {formatInr(totals.total)}
                            </Text>
                        </div>
                    ) : (
                        <div className="checkout-cash-callout">
                            <Text>
                                Count the cash from the patient, then swipe below to mark paid.
                            </Text>
                        </div>
                    )}

                    <SwipeToConfirm
                        label="Swipe to confirm payment"
                        disabled={paying}
                        onConfirm={confirmManualPayment}
                    />
                </Space>
            </Modal>
        </Layout>
    );
}

export default LabCheckout;
