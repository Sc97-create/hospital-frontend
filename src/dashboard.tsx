import { useEffect, useState, type ReactNode } from "react";
import {
  AutoComplete,
  Button,
  Card,
  Col,
  Dropdown,
  Flex,
  Input,
  Layout,
  Row,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  BellOutlined,
  CalendarOutlined,
  CheckCircleFilled,
  CloseCircleOutlined,
  DownOutlined,
  MoreOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import Sidebar from "./sidebar";
import DashboardSkeleton from "./dashboard-skeleton";
import {
  getDashboardOverview,
  searchPatients,
  type DashboardKpis,
  type DashboardEmployeesSummary,
  type DashboardOverview,
  type DashboardPaymentsSummary,
  type PaymentMethodType,
  type PrescriptionAttentionItem,
  type QueueAppointment,
  type QueueStatus,
  type SearchPatientItem,
  type VisitType,
} from "./dashboard-mock-data";
import {
  GetDashboardStatusCounts,
  GetDashboardTodayAppointments,
  GetDashboardTodayInvoiceSummary,
  GetDashboardEmployeeStatusCounts,
  GetDashboardTodayPrescriptions,
  type DashboardStatusCounts,
  type DashboardTodayAppointment,
  type DashboardTodayInvoiceSummary,
  type DashboardEmployeeStatusCounts,
  type DashboardTodayPrescriptionsData,
} from "./api/dashboard";
import {
  getQueueStatusType,
  getPrescriptionStatusType,
  statusTagClassName,
  canStartConsultation,
  STATUS_INFO,
} from "./constants/status-colors";
import { logoutAndRedirect } from "./authentication/logout";
import { usePermissions } from "./auth/permissions-context";
import "./dashboard.css";

const { Content, Header } = Layout;
const { Text, Title } = Typography;

const visitTypeLabel = (type: VisitType): string => {
  switch (type) {
    case "new_patient":
      return "New";
    case "follow_up":
      return "Follow-up";
    case "opd":
      return "OPD";
    default:
      return type;
  }
};

const statusLabel = (status: QueueStatus): string => {
  switch (status) {
    case "ongoing":
      return "In Consult";
    case "waiting":
      return "Waiting";
    case "scheduled":
      return "Scheduled";
    case "completed":
      return "Completed";
    case "missed":
      return "Missed";
    default:
      return status;
  }
};

const statusTagClass = (status: QueueStatus): string => {
  return statusTagClassName(getQueueStatusType(status), "dash-tag");
};

const PAYMENT_METHOD_LABELS: Record<PaymentMethodType, string> = {
  cash: "Cash",
  qr: "QR",
  payment_link: "Payment link",
};

const formatInr = (amount: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const mapStatusCountsToKpis = (counts: DashboardStatusCounts): DashboardKpis => ({
  scheduled: counts.scheduled ?? 0,
  ongoing: counts.in_consult ?? 0,
  completed: counts.completed ?? 0,
  missed: counts.missed ?? 0,
  waiting: counts.waiting ?? 0,
});

const mapInvoiceSummaryToPayments = (
  summary: DashboardTodayInvoiceSummary,
): DashboardPaymentsSummary => ({
  invoice_count: summary.total_invoices ?? 0,
  collected_total: summary.total_amount ?? 0,
  pending_count: 0,
  by_method: [
    {
      method: "cash",
      count: summary.cash?.count ?? 0,
      amount: summary.cash?.amount ?? 0,
    },
    {
      method: "qr",
      count: summary.qr?.count ?? 0,
      amount: summary.qr?.amount ?? 0,
    },
    {
      method: "payment_link",
      count: summary.link?.count ?? 0,
      amount: summary.link?.amount ?? 0,
    },
  ],
});

const formatPrescriptionDate = (value: string): string => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatPrescriptionStatusLabel = (status: string): string =>
  status
    .trim()
    .replace(/[\s-]+/g, "_")
    .replace(/_/g, " ")
    .toUpperCase();

const mapEmployeeStatusCounts = (
  counts: DashboardEmployeeStatusCounts,
): DashboardEmployeesSummary => ({
  active: counts.active ?? 0,
  inactive: counts.inactive ?? 0,
  total: counts.total ?? 0,
});

const mapTodayPrescriptions = (
  data: DashboardTodayPrescriptionsData,
): { prescriptions: PrescriptionAttentionItem[]; total: number } => ({
  total: data.total ?? 0,
  prescriptions: (Array.isArray(data.prescriptions) ? data.prescriptions : []).map(
    (rx) => ({
      id: rx.id,
      code: rx.code,
      prescribed_by: rx.prescribed_by,
      prescription_date: formatPrescriptionDate(rx.created_at),
      status: rx.status,
      patient_id: rx.patient_id,
      patient_name: rx.patient_name,
      appointment_id: rx.appointment_id,
    }),
  ),
});

const QUEUE_ACTIVE_STATUSES = new Set<QueueStatus>([
  "ongoing",
  "waiting",
  "scheduled",
]);

const mapApiStatusToQueueStatus = (status: string): QueueStatus => {
  const normalized = status.trim().toLowerCase().replace(/[\s-]+/g, "_");
  switch (normalized) {
    case "in_consult":
    case "ongoing":
      return "ongoing";
    case "waiting":
      return "waiting";
    case "scheduled":
    case "upcoming":
      return "scheduled";
    case "completed":
      return "completed";
    case "missed":
      return "missed";
    default:
      return "scheduled";
  }
};

const parseTimeToMinutes = (time: string): number => {
  const parts = time.trim().split(":").map((part) => Number(part));
  if (parts.length < 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) {
    return 0;
  }
  return parts[0] * 60 + parts[1];
};

const compareQueueRows = (a: QueueAppointment, b: QueueAppointment): number => {
  if (a.status === "ongoing" && b.status !== "ongoing") return -1;
  if (b.status === "ongoing" && a.status !== "ongoing") return 1;
  return parseTimeToMinutes(a.start_time) - parseTimeToMinutes(b.start_time);
};

const mapTodayAppointmentToQueueRow = (
  appointment: DashboardTodayAppointment,
): QueueAppointment => ({
  appointment_id: appointment.appointment_id,
  appointment_code: appointment.appointment_code,
  start_time: appointment.start_time,
  end_time: appointment.end_time,
  patient_id: appointment.patient_id ?? "",
  patient_name: appointment.patient_name,
  patient_gender: appointment.patient_gender ?? "",
  patient_age: appointment.patient_age ?? 0,
  doctor_name: appointment.doctor_name,
  visit_type: (appointment.visit_type as VisitType) || "opd",
  status: mapApiStatusToQueueStatus(appointment.status),
  mobile_no: appointment.mobile_no ?? "",
});

const splitTodayAppointments = (
  appointments: DashboardTodayAppointment[],
): QueueAppointment[] => {
  const rows = appointments.map(mapTodayAppointmentToQueueRow);

  return rows
    .filter((row) => QUEUE_ACTIVE_STATUSES.has(row.status))
    .sort(compareQueueRows)
    .slice(0, 8);
};

const kpiAccentClass = (key: string, isZero: boolean): string => {
  if (isZero) return "dash-kpi__value dash-kpi__value--muted";
  switch (key) {
    case "scheduled":
    case "completed":
      return "dash-kpi__value dash-kpi__value--success";
    case "ongoing":
      return "dash-kpi__value dash-kpi__value--ongoing";
    case "missed":
      return "dash-kpi__value dash-kpi__value--danger";
    case "waiting":
      return "dash-kpi__value dash-kpi__value--warning";
    default:
      return "dash-kpi__value";
  }
};

function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearAccess, canCreate } = usePermissions();
  const canBookAppointment = canCreate("appointment");
  // Preview loading: /dashboard?loading=1
  const forceLoading = searchParams.get("loading") === "1";

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [searchOptions, setSearchOptions] = useState<
    { value: string; label: ReactNode; patient: SearchPatientItem }[]
  >([]);

  useEffect(() => {
    if (forceLoading) {
      setIsLoading(true);
      setData(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    const loadDashboard = async () => {
      const overview = getDashboardOverview();
      const organisationId = localStorage.getItem("organisation_id") || "";

      if (organisationId) {
        try {
          const [
            statusResponse,
            appointmentsResponse,
            invoiceResponse,
            employeeResponse,
            prescriptionsResponse,
          ] = await Promise.all([
            GetDashboardStatusCounts(organisationId),
            GetDashboardTodayAppointments(organisationId),
            GetDashboardTodayInvoiceSummary(organisationId),
            GetDashboardEmployeeStatusCounts(organisationId),
            GetDashboardTodayPrescriptions(organisationId),
          ]);

          if (!cancelled) {
            if (statusResponse?.data) {
              overview.kpis = mapStatusCountsToKpis(statusResponse.data);
            }

            const appointments = Array.isArray(appointmentsResponse?.data)
              ? appointmentsResponse.data
              : [];
            overview.queue = splitTodayAppointments(appointments);

            if (invoiceResponse?.data) {
              overview.payments = mapInvoiceSummaryToPayments(invoiceResponse.data);
            }

            if (employeeResponse?.data) {
              overview.employees = mapEmployeeStatusCounts(employeeResponse.data);
            }

            if (prescriptionsResponse?.data) {
              const mappedPrescriptions = mapTodayPrescriptions(
                prescriptionsResponse.data,
              );
              overview.prescriptions_attention = mappedPrescriptions.prescriptions;
              overview.prescriptions_total = mappedPrescriptions.total;
            }
          }
        } catch (error) {
          console.error("Failed to fetch dashboard data:", error);
        }
      }

      if (!cancelled) {
        setData(overview);
        setIsLoading(false);
      }
    };

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [forceLoading]);

  const overview = data;
  const isQueueEmpty = (overview?.queue.length ?? 0) === 0;
  const isRxEmpty = (overview?.prescriptions_attention.length ?? 0) === 0;
  const payments: DashboardPaymentsSummary = overview?.payments ?? {
    invoice_count: 0,
    collected_total: 0,
    pending_count: 0,
    by_method: [],
  };
  const isPaymentsEmpty = payments.invoice_count === 0;
  const employees: DashboardEmployeesSummary = overview?.employees ?? {
    active: 0,
    inactive: 0,
    total: 0,
  };

  const kpiCards = [
    {
      key: "scheduled",
      label: "Scheduled",
      value: overview?.kpis.scheduled ?? 0,
      subtext: "Today",
      filter: "scheduled",
    },
    {
      key: "ongoing",
      label: "In consult",
      value: overview?.kpis.ongoing ?? 0,
      subtext: "Active",
      filter: "ongoing",
    },
    {
      key: "completed",
      label: "Completed",
      value: overview?.kpis.completed ?? 0,
      subtext: "Today",
      filter: "completed",
    },
    {
      key: "missed",
      label: "Missed",
      value: overview?.kpis.missed ?? 0,
      subtext: "Today",
      filter: "missed",
    },
    {
      key: "waiting",
      label: "Waiting",
      value: overview?.kpis.waiting ?? 0,
      subtext: "Current",
      filter: "waiting",
    },
  ];

  const handleSearch = (value: string) => {
    setSearchValue(value);
    const results = searchPatients(value, overview?.patients ?? []);
    setSearchOptions(
      results.map((patient) => ({
        value: patient.patient_id,
        patient,
        label: (
          <div className="dash-search-option">
            <span className="dash-search-option__name">{patient.patient_name}</span>
            <span className="dash-search-option__meta">
              {patient.patient_code} · {patient.patient_phone} · {patient.patient_age}
              {patient.patient_gender}
            </span>
          </div>
        ),
      })),
    );
  };

  const openPatient = (patientId: string) => {
    navigate(`/patients/patient-overview/${patientId}`);
  };

  const openAppointment = (appointmentId: string) => {
    navigate(`/appointment/preview/${appointmentId}`);
  };

  const startConsult = (appointmentId: string) => {
    // Status update will come from API later; navigate to Rx flow for now
    navigate(`/prescription/add-prescription/${appointmentId}`);
  };

  const queueColumns: ColumnsType<QueueAppointment> = [
    {
      title: "Time",
      key: "time",
      width: 120,
      render: (_, row) => (
        <Text className="dash-queue__time">
          {row.start_time}–{row.end_time}
        </Text>
      ),
    },
    {
      title: "Patient",
      key: "patient",
      render: (_, row) => (
        <div className="dash-queue__patient">
          <Text strong>{row.patient_name}</Text>
          {row.patient_gender || row.patient_age ? (
            <Text type="secondary" className="dash-queue__meta">
              {[row.patient_gender, row.patient_age || null]
                .filter(Boolean)
                .join(", ")}
            </Text>
          ) : row.appointment_code ? (
            <Text type="secondary" className="dash-queue__meta">
              {row.appointment_code}
            </Text>
          ) : null}
        </div>
      ),
    },
    {
      title: "Doctor",
      dataIndex: "doctor_name",
      key: "doctor_name",
    },
    {
      title: "Type",
      key: "visit_type",
      render: (_, row) => (
        <Tag className={statusTagClassName(STATUS_INFO, "dash-tag")}>
          {row.visit_type ? visitTypeLabel(row.visit_type) : row.appointment_code ?? "—"}
        </Tag>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, row) => (
        <Tag className={statusTagClass(row.status)}>{statusLabel(row.status)}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 168,
      className: "dash-queue__actions-col",
      render: (_, row) => {
        if (canStartConsultation(row.status) && canCreate("prescription")) {
          return (
            <div className="dash-queue__actions">
              <Button
                type="primary"
                size="small"
                className="dash-start-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  startConsult(row.appointment_id);
                }}
              >
                Start Consult
              </Button>
            </div>
          );
        }

        if (row.status === "scheduled") {
          return (
            <div className="dash-queue__actions">
              <Button
                type="text"
                size="small"
                icon={<MoreOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  openAppointment(row.appointment_id);
                }}
              />
            </div>
          );
        }

        return null;
      },
    },
  ];

  const userMenuItems = [
    {
      key: "my-profile",
      label: "My Profile",
      onClick: () => navigate("/profile"),
    },
    {
      key: "update-password",
      label: "Update Password",
      onClick: () => navigate("/update-password"),
    },
    {
      key: "logout",
      label: "Logout",
      onClick: () => {
        void logoutAndRedirect(navigate, clearAccess);
      },
    },
  ];

  return (
    <div className="container-fluid">
      <Flex>
        <Layout className="dash-shell">
          <Sidebar />
          <Layout>
            <Header className="dash-header">
              <div className="dash-header__left">
                <Title level={4} className="dash-header__title">
                  Overview
                </Title>
                <Text type="secondary" className="dash-header__date">
                  {overview?.date_label ?? "—"}
                </Text>
              </div>

              <AutoComplete
                className="dash-header__search"
                options={searchOptions}
                onSearch={handleSearch}
                value={searchValue}
                onChange={setSearchValue}
                onSelect={(_, option) => {
                  const patient = (
                    option as { patient?: SearchPatientItem }
                  ).patient;
                  if (patient) {
                    setSearchValue(patient.patient_name);
                    openPatient(patient.patient_id);
                  }
                }}
                notFoundContent={
                  searchValue.trim() ? "No patients found" : null
                }
              >
                <Input
                  allowClear
                  size="large"
                  prefix={<SearchOutlined />}
                  placeholder="Search by name, UHID, or phone"
                />
              </AutoComplete>

              <div className="dash-header__right">
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  className="dash-header__bell"
                  aria-label="Notifications"
                />
                <Dropdown menu={{ items: userMenuItems }} trigger={["click"]}>
                  <button type="button" className="dash-header__user">
                    <span className="dash-header__avatar">
                      <UserOutlined />
                    </span>
                    <span className="dash-header__branch">
                      {overview?.branch_label ?? "Clinic"}
                    </span>
                    <DownOutlined />
                  </button>
                </Dropdown>
              </div>
            </Header>

            <Content className="dash-content">
              {isLoading || !overview ? (
                <DashboardSkeleton />
              ) : (
                <>
              <Row gutter={[12, 12]} className="dash-kpi-row">
                {kpiCards.map((kpi) => (
                  <Col xs={12} sm={8} md={4} lg={4} xl={4} key={kpi.key} className="dash-kpi-col">
                    <Card
                      className="dash-kpi"
                      hoverable
                      onClick={() =>
                        navigate(`/appointments?status=${kpi.filter}`)
                      }
                    >
                      <Text className="dash-kpi__label">{kpi.label}</Text>
                      <div className={kpiAccentClass(kpi.key, kpi.value === 0)}>
                        {kpi.value}
                        <span className="dash-kpi__subtext"> {kpi.subtext}</span>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>

              <Row gutter={[16, 16]} className="dash-main-row">
                <Col xs={24} lg={16} className="dash-main-col">
                  <Card
                    className={`dash-card${isQueueEmpty ? " dash-card--queue-empty" : ""}`}
                    title={
                      <div className="dash-card__title-block">
                        <span className="dash-card__title">Live Queue</span>
                        {!isQueueEmpty ? (
                          <Text type="secondary" className="dash-card__subtitle">
                            Today · sorted by time
                          </Text>
                        ) : null}
                      </div>
                    }
                    extra={
                      isQueueEmpty ? (
                        <span className="dash-active-badge">0 ACTIVE</span>
                      ) : (
                        <Button
                          type="link"
                          className="dash-link-btn"
                          onClick={() => navigate("/appointments")}
                        >
                          View all
                        </Button>
                      )
                    }
                  >
                    {isQueueEmpty ? (
                      <div className="dash-empty dash-empty--queue">
                        <div className="dash-empty__icon" aria-hidden>
                          <CalendarOutlined />
                          <CloseCircleOutlined className="dash-empty__icon-x" />
                        </div>
                        <Title level={5} className="dash-empty__title">
                          No appointments today
                        </Title>
                        <Text type="secondary" className="dash-empty__desc">
                          {canBookAppointment
                            ? "The queue is currently empty. Start by scheduling a new visit."
                            : "The queue is currently empty."}
                        </Text>
                        {canBookAppointment ? (
                          <Button
                            type="primary"
                            size="large"
                            className="dash-empty__cta"
                            onClick={() => navigate("/patients")}
                          >
                            Book appointment
                          </Button>
                        ) : null}
                      </div>
                    ) : (
                      <Table<QueueAppointment>
                        className="dash-queue-table"
                        rowKey="appointment_id"
                        columns={queueColumns}
                        dataSource={overview.queue}
                        pagination={false}
                        size="middle"
                        onRow={(record) => ({
                          onClick: () => openAppointment(record.appointment_id),
                          className: "dash-queue-row",
                        })}
                      />
                    )}
                  </Card>

                  <Card className="dash-card dash-card--employees" title="Employees">
                    <div className="dash-payments-summary dash-payments-summary--three">
                      <div className="dash-payments-summary__stat">
                        <Text className="dash-payments-summary__label">Active</Text>
                        <Text className="dash-payments-summary__value dash-payments-summary__value--success">
                          {employees.active}
                        </Text>
                      </div>
                      <div className="dash-payments-summary__stat">
                        <Text className="dash-payments-summary__label">Inactive</Text>
                        <Text className="dash-payments-summary__value dash-payments-summary__value--danger">
                          {employees.inactive}
                        </Text>
                      </div>
                      <div className="dash-payments-summary__stat">
                        <Text className="dash-payments-summary__label">Total</Text>
                        <Text className="dash-payments-summary__value">
                          {employees.total}
                        </Text>
                      </div>
                    </div>
                  </Card>
                </Col>

                <Col xs={24} lg={8} className="dash-rail-col">
                  <Card className="dash-card" title="Payments today">
                    {isPaymentsEmpty ? (
                      <div className="dash-empty dash-empty--inline">
                        <Text type="secondary">No invoices yet today</Text>
                      </div>
                    ) : (
                      <>
                        <div className="dash-payments-summary">
                          <div className="dash-payments-summary__stat">
                            <Text className="dash-payments-summary__label">Collected</Text>
                            <Text className="dash-payments-summary__value">
                              {formatInr(payments.collected_total)}
                            </Text>
                          </div>
                          <div className="dash-payments-summary__stat">
                            <Text className="dash-payments-summary__label">Invoices</Text>
                            <Text className="dash-payments-summary__value">
                              {payments.invoice_count}
                            </Text>
                          </div>
                        </div>

                        <ul className="dash-payments-breakdown">
                          {payments.by_method.map((row) => (
                            <li key={row.method} className="dash-payments-breakdown__row">
                              <span className="dash-payments-breakdown__method">
                                {PAYMENT_METHOD_LABELS[row.method]}
                              </span>
                              <span className="dash-payments-breakdown__count">
                                {row.count}
                              </span>
                              <span className="dash-payments-breakdown__amount">
                                {formatInr(row.amount)}
                              </span>
                            </li>
                          ))}
                        </ul>

                        {payments.pending_count > 0 ? (
                          <Text type="secondary" className="dash-payments-pending">
                            {payments.pending_count} unpaid invoice
                            {payments.pending_count === 1 ? "" : "s"}
                          </Text>
                        ) : null}
                      </>
                    )}
                  </Card>

                  <Card
                    className="dash-card"
                    title="Prescriptions"
                    extra={
                      isRxEmpty ? (
                        <CheckCircleFilled className="dash-rx-ok-icon" />
                      ) : (
                        <Text type="secondary" className="dash-card__count">
                          {overview.prescriptions_total}
                        </Text>
                      )
                    }
                  >
                    {isRxEmpty ? (
                      <div className="dash-empty dash-empty--rx">
                        <CheckCircleFilled className="dash-empty__check" />
                        <Text>No prescriptions today.</Text>
                      </div>
                    ) : (
                      <>
                        <ul className="dash-rx-list">
                          {overview.prescriptions_attention.map(
                            (rx: PrescriptionAttentionItem) => (
                              <li key={rx.id}>
                                <button
                                  type="button"
                                  className="dash-rx-list__row"
                                  onClick={() => navigate(`/prescription/${rx.id}`)}
                                >
                                  <div className="dash-rx-list__main">
                                    <Text strong>{rx.code}</Text>
                                    <Text type="secondary" className="dash-rx-list__meta">
                                      {rx.patient_name
                                        ? `${rx.patient_name} · ${rx.prescribed_by}`
                                        : rx.prescribed_by}
                                      {" · "}
                                      {rx.prescription_date}
                                    </Text>
                                  </div>
                                  <Tag
                                    className={statusTagClassName(
                                      getPrescriptionStatusType(rx.status),
                                      "dash-tag",
                                    )}
                                  >
                                    {formatPrescriptionStatusLabel(rx.status)}
                                  </Tag>
                                </button>
                              </li>
                            ),
                          )}
                        </ul>
                        <div className="dash-card__footer">
                          <Button
                            type="link"
                            className="dash-link-btn"
                            onClick={() => navigate("/prescription")}
                          >
                            View all ({overview.prescriptions_total})
                          </Button>
                        </div>
                      </>
                    )}
                  </Card>
                </Col>
              </Row>
                </>
              )}
            </Content>
          </Layout>
        </Layout>
      </Flex>
    </div>
  );
}

export default Dashboard;
