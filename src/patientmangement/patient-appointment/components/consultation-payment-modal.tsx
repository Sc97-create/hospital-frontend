import { useEffect, useRef, useState } from 'react';
import {
    Button,
    Input,
    InputNumber,
    message,
    Modal,
    Segmented,
    Space,
    Typography,
} from 'antd';
import { CheckCircleFilled } from '@ant-design/icons';

import {
    ConfirmPayment,
    CreateBilling,
    GetInvoiceByAppointmentID,
    parseBillingCreateResponse,
    parseInvoiceByAppointmentResponse,
} from '../../../prescriptions/api/prescription';
import { isPaidInvoiceStatus } from '../../../prescriptions/prescription-patient';
import SwipeToConfirm from '../../../prescriptions/components/swipe-to-confirm';

import './consultation-payment-modal.css';

const { Text } = Typography;

type ConsultationPaymentMethod = 'cash' | 'qr';

/** Wizard runs inside a single Modal — avoids stacking separate popups per step. */
type Step = 'collect' | 'confirm' | 'done';

const DEFAULT_CONSULTATION_FEE = 500;

export interface ConsultationPaymentModalProps {
    open: boolean;
    appointmentId: string;
    patientId: string;
    /** Prefilled, editable consultation fee. */
    defaultAmount?: number;
    onClose: () => void;
    /** Fired once payment is confirmed (or skipped via "Pay later"). */
    onDone?: (result: { paid: boolean; invoiceId?: string }) => void;
}

function formatInr(amount: number): string {
    return `₹${amount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function extractApiErrorMessage(error: unknown, fallback: string): string {
    if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data &&
        typeof error.response.data.message === 'string'
    ) {
        return error.response.data.message;
    }
    if (error instanceof Error && error.message) {
        return error.message;
    }
    return fallback;
}

function createIdempotencyKey(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return `pay_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

export default function ConsultationPaymentModal({
    open,
    appointmentId,
    patientId,
    defaultAmount = DEFAULT_CONSULTATION_FEE,
    onClose,
    onDone,
}: ConsultationPaymentModalProps) {
    const [messageApi, contextHolder] = message.useMessage();
    const [step, setStep] = useState<Step>('collect');
    const [paymentMethod, setPaymentMethod] = useState<ConsultationPaymentMethod>('cash');
    const [amount, setAmount] = useState<number>(defaultAmount);
    const [transactionReference, setTransactionReference] = useState('');
    const [checkingExisting, setCheckingExisting] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [invoiceId, setInvoiceId] = useState<string | null>(null);
    const [paidAmount, setPaidAmount] = useState(0);
    const inFlightRef = useRef(false);
    const billingKeyRef = useRef<string | null>(null);
    const confirmKeyRef = useRef<string | null>(null);

    const organisationId = localStorage.getItem('organisation_id') || '';
    const cashierId = localStorage.getItem('user_id') || '';

    // Reset wizard state + resume any unpaid invoice for this appointment on open.
    useEffect(() => {
        if (!open) return;
        setStep('collect');
        setPaymentMethod('cash');
        setAmount(defaultAmount);
        setTransactionReference('');
        setInvoiceId(null);
        billingKeyRef.current = null;
        confirmKeyRef.current = null;

        if (!appointmentId) return;
        setCheckingExisting(true);
        GetInvoiceByAppointmentID(appointmentId)
            .then((response) => {
                const existing = parseInvoiceByAppointmentResponse(response);
                if (!existing) return;
                if (isPaidInvoiceStatus(existing.status)) {
                    setPaidAmount(existing.total_amount);
                    setInvoiceId(existing.id);
                    setStep('done');
                    return;
                }
                // Unpaid invoice already exists — resume straight to the swipe step.
                setInvoiceId(existing.id);
                setAmount(existing.total_amount);
                setPaymentMethod(
                    existing.payment_mode === 'qr' ? 'qr' : 'cash',
                );
                setStep('confirm');
            })
            .catch(() => {
                // 404 → no invoice yet, normal first-time flow.
            })
            .finally(() => setCheckingExisting(false));
    }, [open, appointmentId, defaultAmount]);

    const getBillingKey = (): string => {
        if (!billingKeyRef.current) {
            billingKeyRef.current = createIdempotencyKey();
        }
        return billingKeyRef.current;
    };

    const getConfirmKey = (): string => {
        if (!confirmKeyRef.current) {
            confirmKeyRef.current = createIdempotencyKey();
        }
        return confirmKeyRef.current;
    };

    const handleConfirmAndPay = async () => {
        if (inFlightRef.current) return;
        if (!amount || amount <= 0) {
            messageApi.error('Enter a consultation amount greater than 0');
            return;
        }
        if (!organisationId || !cashierId) {
            messageApi.error('Missing user session — please log in again');
            return;
        }
        if (!patientId || !appointmentId) {
            messageApi.error('Missing patient / appointment details');
            return;
        }

        inFlightRef.current = true;
        setSubmitting(true);
        try {
            const response = await CreateBilling({
                payment_type: 'consultation',
                appointment_id: appointmentId,
                patient_id: patientId,
                cashier_id: cashierId,
                organisation_id: organisationId,
                payment_mode: paymentMethod,
                idempotency_key: getBillingKey(),
                financials: {
                    sub_total_amount: amount,
                    tax_amount: 0,
                    discount_amount: 0,
                    total_amount: amount,
                },
            });
            const { invoice_id } = parseBillingCreateResponse(response);
            setInvoiceId(invoice_id);
            setStep('confirm');
        } catch (error) {
            console.error('Consultation billing create failed:', error);
            messageApi.error(
                extractApiErrorMessage(error, 'Failed to create invoice. Please try again.'),
            );
        } finally {
            inFlightRef.current = false;
            setSubmitting(false);
        }
    };

    const handleSwipeConfirmed = async () => {
        if (!invoiceId || inFlightRef.current) return;
        inFlightRef.current = true;
        setSubmitting(true);
        try {
            const trimmedRef = transactionReference.trim();
            await ConfirmPayment({
                invoice_id: invoiceId,
                organisation_id: organisationId,
                payment_mode: paymentMethod,
                idempotency_key: getConfirmKey(),
                ...(trimmedRef ? { transaction_reference: trimmedRef } : {}),
            });
            setPaidAmount(amount);
            setStep('done');
            messageApi.success('Payment confirmed');
        } catch (error) {
            console.error('Consultation payment confirm failed:', error);
            messageApi.error(
                extractApiErrorMessage(error, 'Failed to confirm payment. Please try again.'),
            );
        } finally {
            inFlightRef.current = false;
            setSubmitting(false);
        }
    };

    const closeAndFinish = (paid: boolean) => {
        onClose();
        onDone?.({ paid, invoiceId: invoiceId ?? undefined });
    };

    const title =
        step === 'collect'
            ? 'Consultation payment'
            : step === 'confirm'
              ? paymentMethod === 'cash'
                  ? 'Confirm cash payment'
                  : 'Confirm QR payment'
              : 'Payment successful';

    return (
        <Modal
            open={open}
            title={title}
            centered
            maskClosable={false}
            closable={!submitting}
            onCancel={() => {
                if (submitting) return;
                if (step === 'confirm') {
                    // Invoice already created — closing here just lets them resume later.
                    closeAndFinish(false);
                    return;
                }
                closeAndFinish(false);
            }}
            footer={null}
            className="consultation-pay-modal"
        >
            {contextHolder}

            {step === 'collect' && (
                <Space direction="vertical" size={16} className="consultation-pay-body">
                    <div>
                        <Text className="consultation-pay-label">PAYMENT METHOD</Text>
                        <Segmented
                            block
                            className="consultation-pay-segmented"
                            value={paymentMethod}
                            disabled={checkingExisting}
                            onChange={(value) => {
                                billingKeyRef.current = null;
                                setPaymentMethod(value as ConsultationPaymentMethod);
                            }}
                            options={[
                                { label: 'Cash', value: 'cash' },
                                { label: 'QR', value: 'qr' },
                            ]}
                        />
                    </div>

                    <div>
                        <Text className="consultation-pay-label">CONSULTATION AMOUNT</Text>
                        <InputNumber
                            className="consultation-pay-amount-input"
                            size="large"
                            min={0}
                            prefix="₹"
                            disabled={checkingExisting}
                            value={amount}
                            onChange={(value) => setAmount(Number(value) || 0)}
                        />
                    </div>

                    <Button
                        type="primary"
                        size="large"
                        block
                        loading={submitting || checkingExisting}
                        onClick={() => {
                            void handleConfirmAndPay();
                        }}
                    >
                        Confirm &amp; Pay
                    </Button>

                    <Button
                        type="text"
                        block
                        disabled={submitting || checkingExisting}
                        onClick={() => closeAndFinish(false)}
                    >
                        Pay later
                    </Button>
                </Space>
            )}

            {step === 'confirm' && (
                <Space direction="vertical" size={16} className="consultation-pay-body">
                    <div className="consultation-pay-amount-due">
                        <Text type="secondary" className="consultation-pay-amount-due-label">
                            Amount due
                        </Text>
                        <Text strong className="consultation-pay-amount-due-value">
                            {formatInr(amount)}
                        </Text>
                    </div>

                    {paymentMethod === 'qr' ? (
                        <div className="consultation-pay-qr-placeholder" aria-hidden>
                            <div className="consultation-pay-qr-mock-square" />
                            <Text type="secondary">Scan to pay via UPI</Text>
                            <Text type="secondary" className="consultation-pay-qr-amount">
                                {formatInr(amount)}
                            </Text>
                        </div>
                    ) : (
                        <div className="consultation-pay-cash-callout">
                            <Text>
                                Collect cash from the patient, then swipe below to mark paid.
                            </Text>
                        </div>
                    )}

                    <div className="consultation-pay-txn-ref">
                        <Text className="consultation-pay-label">
                            TRANSACTION REFERENCE (OPTIONAL)
                        </Text>
                        <Input
                            placeholder={
                                paymentMethod === 'qr'
                                    ? 'UPI / bank reference (optional)'
                                    : 'Receipt / reference (optional)'
                            }
                            value={transactionReference}
                            onChange={(e) => setTransactionReference(e.target.value)}
                            disabled={submitting}
                            maxLength={100}
                        />
                    </div>

                    <SwipeToConfirm
                        active={step === 'confirm'}
                        loading={submitting}
                        onConfirm={() => {
                            void handleSwipeConfirmed();
                        }}
                    />
                </Space>
            )}

            {step === 'done' && (
                <Space
                    direction="vertical"
                    align="center"
                    size={12}
                    className="consultation-pay-body consultation-pay-done"
                >
                    <CheckCircleFilled className="consultation-pay-done-icon" />
                    <Text strong className="consultation-pay-done-title">
                        Payment received
                    </Text>
                    <Text type="secondary">
                        {formatInr(paidAmount)} · {paymentMethod.toUpperCase()}
                    </Text>
                    <Button
                        type="primary"
                        size="large"
                        block
                        onClick={() => closeAndFinish(true)}
                    >
                        Done
                    </Button>
                </Space>
            )}
        </Modal>
    );
}
