import {
    Breadcrumb,
    Button,
    Dropdown,
    Input,
    InputNumber,
    Layout,
    Modal,
    Progress,
    Segmented,
    Space,
    Spin,
    Table,
    Typography,
    message,
} from "antd";
import type { MenuProps } from "antd";
import {
    ArrowLeftOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    DownOutlined,
    EditOutlined,
    ExperimentOutlined,
    FileTextOutlined,
    HomeOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Sidebar from "../sidebar";
import { StatusTag } from "../components/status-tag";
import { getLabStatusType, STATUS_INFO } from "../constants/status-colors";
import SwipeToConfirm from "../prescriptions/components/swipe-to-confirm";
import {
    ConfirmPayment,
    CreateBilling,
    parseBillingCreateResponse,
} from "../prescriptions/api/prescription";
import type { CheckoutPaymentMethod } from "../prescriptions/types/prescriptionmodel";
import { usePermissions } from "../auth/permissions-context";
import {
    BulkUpdateLabOrderStatus,
    CheckBillingByBillingId,
    GetLabOrderById,
} from "./api/lab-order";
import type { LabOrderDetail, LabOrderDetailTest } from "./types/lab-order";
import "../prescriptions/prescription-preview.css";
import "../prescriptions/prescription-checkout.css";
import "./lab-order-details.css";

const { Content } = Layout;
const { Text } = Typography;

const TAX_RATE = 0.05;
const DEFAULT_TEST_PRICE = 0;

function createIdempotencyKey(): string {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return `lab_pay_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

function extractApiErrorMessage(error: unknown, fallback: string): string {
    if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string"
    ) {
        return error.response.data.message;
    }
    if (error instanceof Error && error.message) {
        return error.message;
    }
    return fallback;
}

function getErrorResponseData(error: unknown): Record<string, unknown> | null {
    if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object"
    ) {
        return error.response.data as Record<string, unknown>;
    }
    return null;
}

/** billing/create `{ code: 400, error: "invalid request" }` — close quietly, no toast. */
function isBillingInvalidRequest(payload: unknown): boolean {
    if (!payload || typeof payload !== "object") return false;
    const body = payload as Record<string, unknown>;
    const code = body.code;
    const errorText =
        typeof body.error === "string"
            ? body.error
            : typeof body.message === "string"
              ? body.message
              : "";
    return (
        (code === 400 || code === "400") &&
        errorText.trim().toLowerCase() === "invalid request"
    );
}

const ITEM_STATUS_OPTIONS = ["pending", "completed", "cancelled"] as const;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatInr(amount: number) {
    return `₹${amount.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function formatReceivedAt(isoDate: string) {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return isoDate;
    const day = date.getDate();
    const month = MONTHS[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const period = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;
    return `${day} ${month} ${year}, ${hour12}:${minutes} ${period}`;
}

function formatStatusLabel(status: string) {
    if (!status?.trim()) return "—";
    return status
        .trim()
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeStatus(status: string) {
    return status?.trim().toLowerCase() || "";
}

function getOrderTestTitle(tests: LabOrderDetailTest[]) {
    const names = tests.map((test) => test.name?.trim()).filter(Boolean);
    if (!names.length) return "Lab Order";
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]}, ${names[1]}`;
    return `${names[0]} +${names.length - 1} more`;
}

function LabOrderDetails() {
    const { labId = "" } = useParams<{ labId: string }>();
    const navigate = useNavigate();
    const { canUpdate, canCreate } = usePermissions();
    const canUpdateLabOrder = canUpdate("lab_order");
    const canCreateBilling = canCreate("billing");
    const [messageApi, contextHolder] = message.useMessage();
    const [order, setOrder] = useState<LabOrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [savedAt] = useState("Just now");
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>("cash");
    const [transactionReference, setTransactionReference] = useState("");
    const [paying, setPaying] = useState(false);
    const [editableAmount, setEditableAmount] = useState(0);
    const [editingAmount, setEditingAmount] = useState(false);
    const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [billingCount, setBillingCount] = useState<number | null>(null);
    const [billingCheckLoading, setBillingCheckLoading] = useState(false);
    const billingKeyRef = useRef<string | null>(null);
    const confirmKeyRef = useRef<string | null>(null);
    const inFlightRef = useRef(false);

    const refreshBillingCheck = async (billingId: string) => {
        const trimmedId = billingId.trim();
        if (!trimmedId) {
            setBillingCount(null);
            return;
        }

        setBillingCheckLoading(true);
        try {
            const response = await CheckBillingByBillingId(trimmedId);
            setBillingCount(Number(response.count) || 0);
        } catch (error) {
            console.error("Failed to check lab order billing:", error);
            // Fail closed — keep Complete disabled until we know billing state
            setBillingCount(null);
        } finally {
            setBillingCheckLoading(false);
        }
    };

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            if (!labId.trim()) {
                setOrder(null);
                setBillingCount(null);
                setLoading(false);
                return;
            }

            setLoading(true);
            setBillingCheckLoading(true);
            setCheckoutOpen(false);
            setPaymentMethod("cash");
            setTransactionReference("");
            setPaying(false);
            setEditingAmount(false);
            setPaymentUrl(null);
            setBillingCount(null);
            billingKeyRef.current = null;
            confirmKeyRef.current = null;
            inFlightRef.current = false;

            try {
                const [data, billingResponse] = await Promise.all([
                    GetLabOrderById(labId),
                    CheckBillingByBillingId(labId).catch((error) => {
                        console.error("Failed to check lab order billing:", error);
                        return null;
                    }),
                ]);
                if (cancelled) return;
                setOrder(data);
                setBillingCount(
                    billingResponse == null ? null : Number(billingResponse.count) || 0,
                );
            } catch (error) {
                console.error("Failed to load lab order:", error);
                if (!cancelled) {
                    setOrder(null);
                    setBillingCount(null);
                    messageApi.error("Failed to load lab order details");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                    setBillingCheckLoading(false);
                }
            }
        };

        void load();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when lab id changes
    }, [labId]);

    const tests = order?.tests ?? [];
    const orderTitle = getOrderTestTitle(tests);

    const completedCount = tests.filter((t) => normalizeStatus(t.status) === "completed").length;
    const pendingCount = tests.filter((t) => normalizeStatus(t.status) === "pending").length;
    const remainingCount = pendingCount;
    const progressPercent = tests.length
        ? Math.round((completedCount / tests.length) * 100)
        : 0;
    const testsReadyToComplete =
        tests.length > 0 &&
        tests.every((t) => {
            const status = normalizeStatus(t.status);
            return status === "completed" || status === "cancelled";
        });
    /** count === 0 → no bill yet (enable); count > 0 → already billed (disable). */
    const billingAllowsComplete = billingCount === 0;
    const canCompleteOrder =
        canCreateBilling && testsReadyToComplete && billingAllowsComplete;

    const amountDue = useMemo(() => {
        const subtotal = tests
            .filter((test) => normalizeStatus(test.status) === "completed")
            .reduce((sum) => sum + DEFAULT_TEST_PRICE, 0);
        const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
        return Math.round((subtotal + tax) * 100) / 100;
    }, [tests]);

    const applyLocalTestStatus = (testIds: string[], status: string) => {
        const idSet = new Set(testIds);
        setOrder((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                tests: prev.tests.map((test) =>
                    idSet.has(test.id) ? { ...test, status } : test,
                ),
            };
        });
    };

    const bulkUpdateStatus = async (testIds: string[], status: string) => {
        const labOrderId = order?.id?.trim() || labId.trim();
        if (!labOrderId) {
            messageApi.error("Missing lab order id");
            return false;
        }
        if (!testIds.length) {
            messageApi.warning("No tests to update");
            return false;
        }

        setUpdatingStatus(true);
        try {
            const response = await BulkUpdateLabOrderStatus({
                lab_order_id: labOrderId,
                test_ids: testIds,
                status,
            });
            if (String(response.code) !== "200" && response.code !== 200) {
                messageApi.error(response.message || "Failed to update test status");
                return false;
            }
            applyLocalTestStatus(testIds, status);
            return true;
        } catch (error) {
            console.error("Failed to bulk update lab test status:", error);
            messageApi.error(
                extractApiErrorMessage(error, "Failed to update test status"),
            );
            return false;
        } finally {
            setUpdatingStatus(false);
        }
    };

    const updateItemStatus = async (testId: string, status: string) => {
        if (!canUpdateLabOrder) {
            messageApi.warning("You do not have permission to update lab orders");
            return;
        }
        const ok = await bulkUpdateStatus([testId], status);
        if (ok) messageApi.success("Status updated");
    };

    const markAllCompleted = async () => {
        if (!canUpdateLabOrder) {
            messageApi.warning("You do not have permission to update lab orders");
            return;
        }
        const testIds = tests
            .filter((test) => normalizeStatus(test.status) !== "cancelled")
            .map((test) => test.id)
            .filter(Boolean);
        if (!testIds.length) return;

        const ok = await bulkUpdateStatus(testIds, "completed");
        if (ok) messageApi.success("All tests marked as Completed");
    };

    const allNonCancelledCompleted =
        tests.length > 0 &&
        tests
            .filter((test) => normalizeStatus(test.status) !== "cancelled")
            .every((test) => normalizeStatus(test.status) === "completed");

    const statusMenu = (testId: string): MenuProps => ({
        items: ITEM_STATUS_OPTIONS.map((status) => ({
            key: status,
            label: formatStatusLabel(status),
            disabled: updatingStatus,
            onClick: () => {
                void updateItemStatus(testId, status);
            },
        })),
    });

    const columns = [
        {
            title: "Test Name",
            key: "name",
            render: (_: unknown, record: LabOrderDetailTest) => (
                <div>
                    <span className="lab-detail-test-name">{record.name}</span>
                    {record.sub_test?.trim() ? (
                        <div className="lab-detail-meta-label">{record.sub_test}</div>
                    ) : null}
                </div>
            ),
        },
        {
            title: "Current Status",
            dataIndex: "status",
            key: "status",
            width: 160,
            render: (status: string) => (
                <StatusTag type={getLabStatusType(status)} bordered>
                    {formatStatusLabel(status)}
                </StatusTag>
            ),
        },
        {
            title: "Update Action",
            key: "action",
            width: 180,
            render: (_: unknown, record: LabOrderDetailTest) => (
                <Dropdown
                    menu={statusMenu(record.id)}
                    trigger={["click"]}
                    disabled={updatingStatus || !canUpdateLabOrder}
                >
                    <Button
                        className="lab-detail-status-btn"
                        disabled={updatingStatus || !canUpdateLabOrder}
                    >
                        Status: {formatStatusLabel(record.status)}
                        <DownOutlined />
                    </Button>
                </Dropdown>
            ),
        },
    ];

    const handleCompleteOrder = () => {
        if (!canCompleteOrder) {
            if (billingCount != null && billingCount > 0) {
                messageApi.warning("This lab order is already billed");
            }
            return;
        }
        setPaymentMethod("cash");
        setTransactionReference("");
        setEditableAmount(amountDue > 0 ? amountDue : 500);
        setEditingAmount(false);
        setPaymentUrl(null);
        billingKeyRef.current = null;
        confirmKeyRef.current = null;
        inFlightRef.current = false;
        setCheckoutOpen(true);
    };

    const closeCheckoutModal = () => {
        if (paying) return;
        setCheckoutOpen(false);
        setPaymentUrl(null);
        billingKeyRef.current = null;
        confirmKeyRef.current = null;
    };

    const handlePaymentConfirmed = async () => {
        if (inFlightRef.current || paying) return;

        const organisationId = localStorage.getItem("organisation_id") || "";
        const cashierId = localStorage.getItem("user_id") || "";
        const patientId = order?.patient?.patient_id?.trim() || "";
        const billingId = order?.id?.trim() || labId.trim();
        const totalAmount = Math.round(Number(editableAmount) * 100) / 100;

        if (!billingId) {
            messageApi.error("Missing lab order id");
            return;
        }
        if (!organisationId || !cashierId) {
            messageApi.error("Missing user session — please log in again");
            return;
        }
        if (!patientId) {
            messageApi.error("Missing patient id for this lab order");
            return;
        }
        if (totalAmount <= 1) {
            messageApi.error("Enter an amount greater than ₹1");
            return;
        }

        if (!billingKeyRef.current) {
            billingKeyRef.current = createIdempotencyKey();
        }

        const dismissCheckoutQuietly = () => {
            setCheckoutOpen(false);
            setPaymentUrl(null);
            billingKeyRef.current = null;
            confirmKeyRef.current = null;
            void refreshBillingCheck(billingId);
        };

        inFlightRef.current = true;
        setPaying(true);
        try {
            const billingResponse = await CreateBilling({
                payment_type: "lab_order",
                billing_id: billingId,
                organisation_id: organisationId,
                patient_id: patientId,
                cashier_id: cashierId,
                payment_mode: paymentMethod,
                idempotency_key: billingKeyRef.current,
                financials: {
                    sub_total_amount: totalAmount,
                    tax_amount: 0,
                    discount_amount: 0,
                    total_amount: totalAmount,
                },
            });

            if (isBillingInvalidRequest(billingResponse)) {
                dismissCheckoutQuietly();
                return;
            }

            const { invoice_id, payment_url } = parseBillingCreateResponse(billingResponse);
            if (payment_url) {
                setPaymentUrl(payment_url);
            }

            if (paymentMethod === "cash" || paymentMethod === "qr") {
                if (!confirmKeyRef.current) {
                    confirmKeyRef.current = createIdempotencyKey();
                }
                const trimmedRef = transactionReference.trim();
                await ConfirmPayment({
                    invoice_id,
                    organisation_id: organisationId,
                    payment_mode: paymentMethod,
                    idempotency_key: confirmKeyRef.current,
                    ...(trimmedRef ? { transaction_reference: trimmedRef } : {}),
                });
            }

            setOrder((prev) => (prev ? { ...prev, status: "completed" } : prev));
            setCheckoutOpen(false);
            setPaymentUrl(null);
            billingKeyRef.current = null;
            confirmKeyRef.current = null;

            if (paymentMethod === "link") {
                messageApi.success("Payment link created · Lab order checkout started");
                if (payment_url) {
                    window.open(payment_url, "_blank", "noopener,noreferrer");
                }
            } else if (paymentMethod === "cash") {
                messageApi.success("Cash payment confirmed · Lab order completed");
            } else {
                messageApi.success("QR payment confirmed · Lab order completed");
            }

            setBillingCount((prev) => Math.max(prev ?? 0, 1));
            navigate("/lab/tests");
        } catch (error) {
            const responseData = getErrorResponseData(error);
            if (isBillingInvalidRequest(responseData)) {
                dismissCheckoutQuietly();
                return;
            }

            console.error("Lab order checkout failed:", error);
            messageApi.error(
                extractApiErrorMessage(error, "Failed to complete lab order payment"),
            );
            void refreshBillingCheck(order?.id?.trim() || labId);
        } finally {
            inFlightRef.current = false;
            setPaying(false);
        }
    };

    const handleGenerateInvoice = () => {
        if (!tests.length) {
            messageApi.warning("No tests available to invoice");
            return;
        }
        navigate(`/lab/tests/${labId}/checkout`);
    };

    return (
        <Layout>
            {contextHolder}
            <Sidebar />
            <Layout>
                <Breadcrumb
                    className="lab-detail-breadcrumb"
                    items={[
                        {
                            href: "/dashboard",
                            title: <HomeOutlined />,
                        },
                        {
                            title: (
                                <Link to="/lab/tests">
                                    <ExperimentOutlined />
                                    <span>Lab Tests</span>
                                </Link>
                            ),
                        },
                        {
                            title: orderTitle,
                        },
                    ]}
                />

                <Content className="lab-detail-page">
                    <button
                        type="button"
                        className="lab-detail-back"
                        onClick={() => navigate("/lab/tests")}
                    >
                        <ArrowLeftOutlined />
                        Back to Lab Orders
                    </button>

                    {loading ? (
                        <div style={{ padding: 48, textAlign: "center" }}>
                            <Spin size="large" />
                        </div>
                    ) : !order ? (
                        <section className="lab-detail-card">
                            <Text type="secondary">Lab order not found.</Text>
                        </section>
                    ) : (
                        <>
                            <section className="lab-detail-card lab-detail-header-card">
                                <div className="lab-detail-title-row">
                                    <div className="lab-detail-title-block">
                                        <div className="lab-detail-title-line">
                                            <h1>Lab Order Details</h1>
                                            <StatusTag type={STATUS_INFO} className="code-badge">
                                                {orderTitle}
                                            </StatusTag>
                                            <StatusTag
                                                type={getLabStatusType(order.status)}
                                                bordered
                                            >
                                                {formatStatusLabel(order.status)}
                                            </StatusTag>
                                        </div>
                                        <p className="lab-detail-received">
                                            <CalendarOutlined />
                                            Received: {formatReceivedAt(order.received_at)}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <section className="lab-detail-card lab-detail-patient-card">
                                <div className="lab-detail-section-label">
                                    <UserOutlined />
                                    Patient Information
                                </div>
                                <div className="lab-detail-patient-grid">
                                    <div>
                                        <span className="lab-detail-meta-label">Patient Name</span>
                                        <strong>{order.patient?.patient_name || "—"}</strong>
                                    </div>
                                    <div>
                                        <span className="lab-detail-meta-label">Patient ID</span>
                                        <strong>{order.patient?.patient_code || "—"}</strong>
                                    </div>
                                    <div>
                                        <span className="lab-detail-meta-label">Age</span>
                                        <strong>
                                            {order.patient?.age != null
                                                ? `${order.patient.age} yrs`
                                                : "—"}
                                        </strong>
                                    </div>
                                    <div>
                                        <span className="lab-detail-meta-label">
                                            Prescribing Doctor
                                        </span>
                                        <strong>{order.doctor?.doctor_name || "—"}</strong>
                                    </div>
                                </div>
                            </section>

                            <section className="lab-detail-card">
                                <div className="lab-detail-tests-header">
                                    <div>
                                        <h2>Prescribed Lab Tests</h2>
                                        <p>
                                            Doctor-prescribed tests for this requisition. Update
                                            status as lab processing proceeds.
                                        </p>
                                    </div>
                                    <div className="lab-detail-tests-actions">
                                        <Button
                                            className="lab-detail-complete-btn"
                                            icon={<CheckCircleOutlined />}
                                            loading={updatingStatus}
                                            disabled={
                                                updatingStatus ||
                                                !canUpdateLabOrder ||
                                                !tests.length ||
                                                allNonCancelledCompleted
                                            }
                                            onClick={() => {
                                                void markAllCompleted();
                                            }}
                                        >
                                            Mark all as Completed
                                        </Button>
                                        <div className="lab-detail-progress">
                                            <span>
                                                Progress {completedCount} of {tests.length} tests
                                                completed ({progressPercent}%)
                                            </span>
                                            <Progress
                                                percent={progressPercent}
                                                showInfo={false}
                                                strokeColor="var(--color-primary, #25d366)"
                                                trailColor="#e5e7eb"
                                                size={[180, 8]}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="lab-detail-table-wrap">
                                    <Table
                                        rowKey="id"
                                        columns={columns}
                                        dataSource={tests}
                                        pagination={false}
                                        size="middle"
                                        locale={{ emptyText: "No tests for this order" }}
                                    />
                                </div>

                                {remainingCount > 0 ? (
                                    <div className="lab-detail-info-banner">
                                        <ClockCircleOutlined />
                                        <span>
                                            {remainingCount} tests remaining — {pendingCount}{" "}
                                            pending. Mark all tests as Completed or Cancelled to
                                            finalize the order.
                                        </span>
                                    </div>
                                ) : null}

                                <div className="lab-detail-footer">
                                    <div className="lab-detail-autosave">
                                        <CheckCircleOutlined />
                                        All changes saved automatically · {savedAt}
                                    </div>
                                    <div className="lab-detail-footer-actions">
                                        <Button
                                            icon={<FileTextOutlined />}
                                            className="lab-detail-complete-btn"
                                            onClick={handleGenerateInvoice}
                                        >
                                            Generate Invoice
                                        </Button>
                                        <Button
                                            type="primary"
                                            className="lab-detail-complete-btn"
                                            icon={<CheckCircleOutlined />}
                                            loading={billingCheckLoading}
                                            disabled={
                                                billingCheckLoading ||
                                                !canCompleteOrder ||
                                                billingCount == null
                                            }
                                            onClick={handleCompleteOrder}
                                        >
                                            Complete Lab Order
                                        </Button>
                                    </div>
                                </div>
                            </section>
                        </>
                    )}
                </Content>
            </Layout>

            <Modal
                open={checkoutOpen}
                title="Complete lab order"
                onCancel={closeCheckoutModal}
                maskClosable={!paying}
                footer={[
                    <Button key="cancel" disabled={paying} onClick={closeCheckoutModal}>
                        Cancel
                    </Button>,
                ]}
            >
                <Space direction="vertical" size={16} className="checkout-manual-modal">
                    <div className="checkout-manual-amount lab-checkout-amount">
                        <div className="lab-checkout-amount-header">
                            <Text type="secondary" className="checkout-manual-amount-label">
                                Amount due
                            </Text>
                            <Button
                                type="link"
                                size="small"
                                icon={<EditOutlined />}
                                disabled={paying}
                                onClick={() => setEditingAmount((prev) => !prev)}
                            >
                                {editingAmount ? "Done" : "Edit"}
                            </Button>
                        </div>
                        {editingAmount ? (
                            <InputNumber
                                className="lab-checkout-amount-input"
                                min={1.01}
                                step={1}
                                prefix="₹"
                                value={editableAmount}
                                disabled={paying}
                                onChange={(value) => setEditableAmount(Number(value) || 0)}
                            />
                        ) : (
                            <Text strong className="checkout-manual-amount-value">
                                {formatInr(editableAmount)}
                            </Text>
                        )}
                    </div>

                    <div>
                        <Text className="info-label">PAYMENT METHOD</Text>
                        <Segmented
                            className="checkout-payment-segmented"
                            block
                            value={paymentMethod}
                            disabled={paying}
                            onChange={(value) => setPaymentMethod(value as CheckoutPaymentMethod)}
                            options={[
                                { label: "Cash", value: "cash" },
                                { label: "QR", value: "qr" },
                                { label: "Link", value: "link" },
                            ]}
                        />
                    </div>

                    {paymentMethod === "qr" ? (
                        <>
                            <div className="checkout-qr-placeholder" aria-hidden>
                                <div className="checkout-qr-mock-square" />
                                {paymentUrl ? (
                                    <a
                                        href={paymentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="checkout-qr-link"
                                    >
                                        Open payment link
                                    </a>
                                ) : (
                                    <Text type="secondary">QR code placeholder</Text>
                                )}
                                <Text type="secondary" className="checkout-qr-amount">
                                    {formatInr(editableAmount)}
                                </Text>
                            </div>
                            <Text type="secondary" className="checkout-manual-hint">
                                Show the patient this QR, wait for UPI success, then swipe to mark
                                paid.
                            </Text>
                        </>
                    ) : paymentMethod === "link" ? (
                        <div className="checkout-cash-callout">
                            <Text>
                                Swipe to create a payment link for this lab order.
                            </Text>
                        </div>
                    ) : (
                        <div className="checkout-cash-callout">
                            <Text>
                                Count the cash from the patient, then swipe below to mark paid.
                            </Text>
                        </div>
                    )}

                    {paymentMethod !== "link" ? (
                        <div className="checkout-txn-ref">
                            <Text className="info-label">TRANSACTION REFERENCE (OPTIONAL)</Text>
                            <Input
                                placeholder={
                                    paymentMethod === "qr"
                                        ? "UPI / bank reference (optional)"
                                        : "Receipt / reference (optional)"
                                }
                                value={transactionReference}
                                onChange={(e) => setTransactionReference(e.target.value)}
                                disabled={paying}
                                maxLength={100}
                            />
                        </div>
                    ) : null}

                    {editableAmount <= 1 ? (
                        <Text type="secondary" className="checkout-manual-hint">
                            Enter an amount greater than ₹1 before completing payment.
                        </Text>
                    ) : null}

                    <SwipeToConfirm
                        active={checkoutOpen}
                        disabled={paying || editableAmount <= 1}
                        loading={paying}
                        onConfirm={handlePaymentConfirmed}
                    />
                </Space>
            </Modal>
        </Layout>
    );
}

export default LabOrderDetails;
