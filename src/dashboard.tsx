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
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  BellOutlined,
  CalendarOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DownOutlined,
  MoreOutlined,
  SearchOutlined,
  UserAddOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import Sidebar from "./sidebar";
import DashboardSkeleton from "./dashboard-skeleton";
import {
  getDashboardOverview,
  searchPatients,
  type DashboardOverview,
  type PrescriptionAttentionItem,
  type QueueAppointment,
  type QueueStatus,
  type SearchPatientItem,
  type UpNextAppointment,
  type VisitType,
} from "./dashboard-mock-data";
import {
  getQueueStatusType,
  statusTagClassName,
  STATUS_INFO,
  STATUS_WARNING,
} from "./constants/status-colors";
import { logoutAndRedirect } from "./authentication/logout";
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

    // Replace this block with API fetch (React Query / axios) later
    const timer = window.setTimeout(() => {
      if (cancelled) return;
      setData(getDashboardOverview());
      setIsLoading(false);
    }, 700);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [forceLoading]);

  const overview = data;
  const isQueueEmpty = (overview?.queue.length ?? 0) === 0;
  const isUpNextEmpty = (overview?.up_next.length ?? 0) === 0;
  const isRxEmpty = (overview?.prescriptions_attention.length ?? 0) === 0;

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
          <Text type="secondary" className="dash-queue__meta">
            {row.patient_gender}, {row.patient_age}
          </Text>
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
        <Tag className={statusTagClassName(STATUS_INFO, "dash-tag")}>{visitTypeLabel(row.visit_type)}</Tag>
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
        if (row.status === "waiting" || row.status === "scheduled") {
          if (row.status === "waiting") {
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
        return (
          <div className="dash-queue__actions">
            <Button type="default" size="small" disabled>
              Start Consult
            </Button>
          </div>
        );
      },
    },
  ];

  const userMenuItems = [
    { key: "settings", label: "Settings" },
    {
      key: "logout",
      label: "Logout",
      onClick: () => {
        void logoutAndRedirect(navigate);
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
                          The queue is currently empty. Start by scheduling a new
                          visit.
                        </Text>
                        <Button
                          type="primary"
                          size="large"
                          className="dash-empty__cta"
                          onClick={() => navigate("/patients")}
                        >
                          Book appointment
                        </Button>
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

                  <Card className="dash-card dash-card--up-next" title="Up Next">
                    {isUpNextEmpty ? (
                      <div className="dash-empty dash-empty--inline">
                        <Text type="secondary">No more appointments today</Text>
                      </div>
                    ) : (
                      <ul className="dash-up-next">
                        {overview.up_next.map((item: UpNextAppointment) => (
                          <li key={item.appointment_id}>
                            <button
                              type="button"
                              className="dash-up-next__row"
                              onClick={() => openAppointment(item.appointment_id)}
                            >
                              <span className="dash-up-next__time">{item.start_time}</span>
                              <span className="dash-up-next__name">{item.patient_name}</span>
                              <span className="dash-up-next__meta">
                                {item.doctor_name} · {visitTypeLabel(item.visit_type)}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </Card>
                </Col>

                <Col xs={24} lg={8} className="dash-rail-col">
                  <Card className="dash-card" title="Quick Actions">
                    <Space direction="vertical" size={12} className="dash-quick-actions">
                      <Button
                        type="primary"
                        block
                        size="large"
                        icon={<UserAddOutlined />}
                        onClick={() => navigate("/patients/add-patient")}
                      >
                        Add New Patient
                      </Button>
                      <Button
                        block
                        size="large"
                        icon={<CalendarOutlined />}
                        onClick={() => navigate("/patients")}
                      >
                        Book Appointment
                      </Button>
                      <Button
                        block
                        size="large"
                        icon={<ClockCircleOutlined />}
                        onClick={() => navigate("/appointments")}
                      >
                        Today&apos;s Schedule
                      </Button>
                    </Space>
                  </Card>

                  <Card
                    className="dash-card"
                    title="Prescriptions"
                    extra={
                      isRxEmpty ? (
                        <CheckCircleFilled className="dash-rx-ok-icon" />
                      ) : null
                    }
                  >
                    {isRxEmpty ? (
                      <div className="dash-empty dash-empty--rx">
                        <CheckCircleFilled className="dash-empty__check" />
                        <Text>All prescriptions are up to date.</Text>
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
                                      {rx.prescribed_by} · {rx.prescription_date}
                                    </Text>
                                  </div>
                                  <Tag
                                    className={statusTagClassName(STATUS_WARNING, "dash-tag")}
                                  >
                                    {rx.status === "draft" ? "DRAFT" : "PENDING"}
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
                            View all pending RX
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
