import {
    Breadcrumb,
    Button,
    Checkbox,
    Input,
    Layout,
    message,
    Pagination,
    Select,
    Table,
} from "antd";
import {
    ArrowRightOutlined,
    CheckCircleOutlined,
    CheckOutlined,
    ExperimentOutlined,
    EyeOutlined,
    HomeOutlined,
    PlusOutlined,
    PrinterOutlined,
    SaveOutlined,
    SearchOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Sidebar from "../sidebar";
import { findOne } from "../patientmangement/api/patients";
import type { patientlist } from "../patientmangement/types/patients";
import { StatusTag } from "../components/status-tag";
import { STATUS_INFO, STATUS_SUCCESS } from "../constants/status-colors";
import { ListDiagnosticCentres } from "../diagnostic-center/api/diagnostic-center";
import type { DiagnosticCentreListItem } from "../diagnostic-center/types/diagnostic-center";
import { GetDoctors } from "../shared/api/shared-api";
import type { Doctor } from "../shared/types/share-type";
import { CreateLabOrder } from "./api/lab-order";
import {
    CreateLabTestTemplate,
    ListLabTestTemplateDefaults,
} from "./api/lab-test-template";
import type { LabTestTemplateDefault } from "./types/lab-test-template";
import SaveTemplateModal from "./save-template-modal";
import "./add-lab-test.css";

const { Content } = Layout;
const TESTS_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;

type LabCategory =
    | "all"
    | "blood"
    | "biochemistry"
    | "hematology"
    | "endocrinology"
    | "urine";

type LabTestOption = {
    id: string;
    name: string;
    code: string;
    specimen: string;
    specimens: string[];
    type: string;
    tat: string;
    tat_minutes: number;
    category: Exclude<LabCategory, "all">;
};

type TemplateOption = {
    id: string;
    label: string;
    testIds: string[];
};

function mapSavedTemplateToOption(template: {
    id: string;
    name: string;
    tests?: { test_code?: string }[];
}): TemplateOption {
    return {
        id: template.id,
        label: template.name,
        testIds: (template.tests ?? [])
            .map((test) => test.test_code?.trim() || "")
            .filter(Boolean),
    };
}

const CATEGORIES: { key: LabCategory; label: string }[] = [
    { key: "all", label: "All Tests" },
    { key: "blood", label: "Blood Tests" },
    { key: "biochemistry", label: "Biochemistry" },
    { key: "hematology", label: "Hematology" },
    { key: "endocrinology", label: "Endocrinology" },
    { key: "urine", label: "Urine & Fluid" },
];

function formatDiagnosticCentreLabel(centre: DiagnosticCentreListItem) {
    const status = centre.status?.trim();
    if (!status) return centre.name;
    const normalized = status.toLowerCase();
    const statusLabel =
        normalized === "active"
            ? "Active"
            : normalized === "inactive"
              ? "Inactive"
              : status.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return `${centre.name} (${statusLabel})`;
}

function formatTatMinutes(minutes: number): string {
    if (!Number.isFinite(minutes) || minutes <= 0) return "—";
    if (minutes < 60) return `${minutes} mins TAT`;
    const hours = minutes / 60;
    if (Number.isInteger(hours)) return `${hours} hrs TAT`;
    const rounded = Math.round(hours * 10) / 10;
    return `${rounded} hrs TAT`;
}

function deriveCategory(item: LabTestTemplateDefault): Exclude<LabCategory, "all"> {
    const type = item.type?.trim().toLowerCase();
    if (type === "urine_test") return "urine";

    const prefix = item.test_code?.trim().split("-")[0]?.toUpperCase();
    if (prefix === "URI") return "urine";
    if (prefix === "HEM") return "hematology";
    if (prefix === "END") return "endocrinology";
    return "biochemistry";
}

function mapTemplateDefaultToOption(item: LabTestTemplateDefault): LabTestOption {
    const specimens = Array.isArray(item.specimens)
        ? item.specimens.filter((value) => Boolean(value?.trim()))
        : [];
    return {
        id: item.test_code,
        name: item.test_name,
        code: item.test_code,
        specimen: specimens.join(", ") || "—",
        specimens,
        type: item.type || "blood_test",
        tat: formatTatMinutes(item.tat_minutes),
        tat_minutes: item.tat_minutes,
        category: deriveCategory(item),
    };
}

function matchesCategory(test: LabTestOption, category: LabCategory) {
    if (category === "all") return true;
    if (category === "blood") {
        return ["biochemistry", "hematology", "endocrinology"].includes(test.category);
    }
    return test.category === category;
}

function AddLabTest() {
    const { patientID } = useParams<{ patientID: string }>();
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();
    const [patient, setPatient] = useState<patientlist | null>(null);
    const [labTests, setLabTests] = useState<LabTestOption[]>([]);
    const [testsLoading, setTestsLoading] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const [category, setCategory] = useState<LabCategory>("all");
    const [testsPage, setTestsPage] = useState(1);
    const [templates, setTemplates] = useState<TemplateOption[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
    const [diagnosticCenters, setDiagnosticCenters] = useState<DiagnosticCentreListItem[]>([]);
    const [diagnosticCenter, setDiagnosticCenter] = useState<string | undefined>(undefined);
    const [diagnosticLoading, setDiagnosticLoading] = useState(false);
    const [diagnosticSearch, setDiagnosticSearch] = useState("");
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [doctorId, setDoctorId] = useState<string | undefined>(undefined);
    const [doctorsLoading, setDoctorsLoading] = useState(false);
    const [doctorSearch, setDoctorSearch] = useState("");
    const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
    const [savingTemplate, setSavingTemplate] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const diagnosticRequestIdRef = useRef(0);
    const doctorRequestIdRef = useRef(0);

    const organisationId = localStorage.getItem("organisation_id") || "";

    const diagnosticOptions = useMemo(
        () =>
            diagnosticCenters.map((centre) => ({
                value: centre.id,
                label: formatDiagnosticCentreLabel(centre),
            })),
        [diagnosticCenters],
    );

    const doctorOptions = useMemo(
        () =>
            doctors.map((doctor) => ({
                value: doctor.id,
                label: doctor.username,
            })),
        [doctors],
    );

    const fetchDiagnosticCentres = async (search = "") => {
        if (!organisationId) {
            setDiagnosticCenters([]);
            setDiagnosticCenter(undefined);
            return;
        }

        const requestId = ++diagnosticRequestIdRef.current;
        setDiagnosticLoading(true);
        try {
            const response = await ListDiagnosticCentres({
                organisation_id: organisationId,
                limit: 50,
                page_no: 1,
                ...(search.trim() ? { search: search.trim() } : {}),
            });
            if (requestId !== diagnosticRequestIdRef.current) return;

            const centres = response.data ?? [];
            setDiagnosticCenters(centres);
            setDiagnosticCenter((current) => {
                if (current && centres.some((centre) => centre.id === current)) {
                    return current;
                }
                return centres[0]?.id;
            });
        } catch (error) {
            if (requestId !== diagnosticRequestIdRef.current) return;
            console.error("Failed to load diagnostic centres:", error);
            messageApi.error("Failed to load diagnostic centres");
            setDiagnosticCenters([]);
            setDiagnosticCenter(undefined);
        } finally {
            if (requestId === diagnosticRequestIdRef.current) {
                setDiagnosticLoading(false);
            }
        }
    };

    const fetchDoctors = async (search = "") => {
        if (!organisationId) {
            setDoctors([]);
            setDoctorId(undefined);
            return;
        }

        const requestId = ++doctorRequestIdRef.current;
        setDoctorsLoading(true);
        try {
            const response = await GetDoctors(search.trim(), organisationId);
            if (requestId !== doctorRequestIdRef.current) return;

            const list = response.data ?? [];
            setDoctors(list);
            setDoctorId((current) => {
                if (current && list.some((doctor) => doctor.id === current)) {
                    return current;
                }
                return list[0]?.id;
            });
        } catch (error) {
            if (requestId !== doctorRequestIdRef.current) return;
            console.error("Failed to load doctors:", error);
            messageApi.error("Failed to load doctors");
            setDoctors([]);
            setDoctorId(undefined);
        } finally {
            if (requestId === doctorRequestIdRef.current) {
                setDoctorsLoading(false);
            }
        }
    };

    const selectedTests = useMemo(
        () => labTests.filter((test) => selectedIds.includes(test.id)),
        [labTests, selectedIds],
    );

    const defaultTemplateName = useMemo(() => {
        const active = templates.find((template) => template.id === activeTemplate);
        if (active) return `${active.label} Custom`;
        return "Custom Clinical Template";
    }, [activeTemplate, templates]);

    const openSaveTemplateModal = () => {
        if (!selectedIds.length) {
            messageApi.warning("Select at least one lab test to save as a template");
            return;
        }
        setSaveTemplateOpen(true);
    };

    useEffect(() => {
        if (!patientID) return;
        findOne(patientID)
            .then((res) => setPatient(res.data))
            .catch((err) => {
                console.error("Failed to fetch patient:", err);
            });
    }, [patientID]);

    useEffect(() => {
        let cancelled = false;

        const loadDefaults = async () => {
            if (!organisationId) {
                setLabTests([]);
                setTemplates([]);
                setSelectedIds([]);
                setActiveTemplate(null);
                return;
            }

            setTestsLoading(true);
            try {
                const response = await ListLabTestTemplateDefaults(organisationId);
                if (cancelled) return;

                const mapped = (response.defaults ?? []).map(mapTemplateDefaultToOption);
                const savedTemplates = (response.templates ?? []).map(mapSavedTemplateToOption);

                setLabTests(mapped);
                setTemplates(savedTemplates);
                setSelectedIds((current) =>
                    current.filter((id) => mapped.some((test) => test.id === id)),
                );
                setActiveTemplate((current) =>
                    current && savedTemplates.some((template) => template.id === current)
                        ? current
                        : null,
                );
            } catch (error) {
                if (cancelled) return;
                console.error("Failed to load lab test templates:", error);
                messageApi.error("Failed to load lab tests");
                setLabTests([]);
                setTemplates([]);
            } finally {
                if (!cancelled) setTestsLoading(false);
            }
        };

        void loadDefaults();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [organisationId]);

    useEffect(() => {
        const delay = diagnosticSearch.trim() ? SEARCH_DEBOUNCE_MS : 0;
        const timer = window.setTimeout(() => {
            void fetchDiagnosticCentres(diagnosticSearch);
        }, delay);
        return () => window.clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [organisationId, diagnosticSearch]);

    useEffect(() => {
        const delay = doctorSearch.trim() ? SEARCH_DEBOUNCE_MS : 0;
        const timer = window.setTimeout(() => {
            void fetchDoctors(doctorSearch);
        }, delay);
        return () => window.clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [organisationId, doctorSearch]);

    const filteredTests = useMemo(() => {
        const query = searchInput.trim().toLowerCase();
        const selectedSet = new Set(selectedIds);
        return labTests
            .filter((test) => {
                if (!matchesCategory(test, category)) return false;
                if (!query) return true;
                return [test.name, test.code, test.specimen]
                    .join(" ")
                    .toLowerCase()
                    .includes(query);
            })
            .sort((a, b) => {
                const aSelected = selectedSet.has(a.id) ? 0 : 1;
                const bSelected = selectedSet.has(b.id) ? 0 : 1;
                if (aSelected !== bSelected) return aSelected - bSelected;
                // Keep template selection order for selected rows
                if (aSelected === 0) {
                    return selectedIds.indexOf(a.id) - selectedIds.indexOf(b.id);
                }
                return 0;
            });
    }, [labTests, searchInput, category, selectedIds]);

    const pagedTests = useMemo(() => {
        const start = (testsPage - 1) * TESTS_PAGE_SIZE;
        return filteredTests.slice(start, start + TESTS_PAGE_SIZE);
    }, [filteredTests, testsPage]);

    const showTestsPagination = filteredTests.length > TESTS_PAGE_SIZE;

    useEffect(() => {
        const maxPage = Math.max(1, Math.ceil(filteredTests.length / TESTS_PAGE_SIZE) || 1);
        if (testsPage > maxPage) setTestsPage(maxPage);
    }, [filteredTests.length, testsPage]);

    const categoryCounts = useMemo(() => {
        const counts: Record<LabCategory, number> = {
            all: labTests.length,
            blood: labTests.filter((t) => matchesCategory(t, "blood")).length,
            biochemistry: labTests.filter((t) => t.category === "biochemistry").length,
            hematology: labTests.filter((t) => t.category === "hematology").length,
            endocrinology: labTests.filter((t) => t.category === "endocrinology").length,
            urine: labTests.filter((t) => t.category === "urine").length,
        };
        return counts;
    }, [labTests]);

    const toggleTest = (id: string, checked: boolean) => {
        setActiveTemplate(null);
        setSelectedIds((prev) =>
            checked ? Array.from(new Set([...prev, id])) : prev.filter((item) => item !== id),
        );
    };

    const applyTemplate = (template: TemplateOption) => {
        // Clicking the active template again clears selection
        if (activeTemplate === template.id) {
            setActiveTemplate(null);
            setSelectedIds([]);
            setTestsPage(1);
            return;
        }

        const availableIds = new Set(labTests.map((test) => test.id));
        const nextIds = template.testIds.filter((id) => availableIds.has(id));
        setActiveTemplate(template.id);
        setSelectedIds(nextIds);
        setCategory("all");
        setSearchInput("");
        setTestsPage(1);
    };

    const handleCancel = () => {
        if (patientID) {
            navigate(`/patients/patient-overview/${patientID}`);
            return;
        }
        navigate("/patients");
    };

    const handleSaveDraft = () => {
        if (!selectedIds.length) {
            messageApi.warning("Select at least one lab test");
            return;
        }
        messageApi.success("Lab test draft saved");
    };

    const handleSubmit = async () => {
        if (!patientID) {
            messageApi.warning("Patient is required");
            return;
        }
        if (!organisationId) {
            messageApi.warning("Organisation is required");
            return;
        }
        if (!selectedIds.length) {
            messageApi.warning("Select at least one lab test");
            return;
        }
        if (!doctorId) {
            messageApi.warning("Select a doctor for Assigned by");
            return;
        }
        if (!diagnosticCenter) {
            messageApi.warning("Select a diagnostic centre");
            return;
        }

        // Temporary mapping — test name+sub_test will be wired properly later.
        const tests = selectedTests.map((test) => ({
            name: test.name,
            sub_test: test.code,
        }));

        setSubmitting(true);
        try {
            const response = await CreateLabOrder({
                organisation_id: organisationId,
                patient_id: patientID,
                doctor_id: doctorId,
                diagnostic_centre_id: diagnosticCenter,
                tests,
            });

            if (String(response.code) === "200") {
                messageApi.success(response.message || "Lab order created successfully");
                navigate(`/patients/patient-overview/${patientID}`);
                return;
            }

            messageApi.error(response.message || "Failed to create lab order");
        } catch (error) {
            console.error("Failed to create lab order:", error);
            messageApi.error("Failed to create lab order");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSaveTemplate = async (payload: {
        name: string;
        tags: string[];
        testIds: string[];
    }) => {
        const organisation_id = localStorage.getItem("organisation_id") || "";
        const created_by = localStorage.getItem("user_id") || "";

        if (!organisation_id) {
            messageApi.error("Missing organisation id — please log in again");
            return;
        }
        if (!created_by) {
            messageApi.error("Missing user id — please log in again");
            return;
        }

        const testsById = new Map(labTests.map((test) => [test.id, test]));
        const tests = payload.testIds
            .map((id) => testsById.get(id))
            .filter((test): test is LabTestOption => Boolean(test))
            .map((test) => ({
                test_code: test.code,
                test_name: test.name,
                specimens: test.specimens.length ? test.specimens : [test.specimen].filter(Boolean),
                type: test.type || "blood_test",
                tat_minutes: test.tat_minutes,
            }));

        if (!tests.length) {
            messageApi.warning("Select at least one lab test to save as a template");
            return;
        }

        setSavingTemplate(true);
        try {
            const response = await CreateLabTestTemplate({
                organisation_id,
                created_by,
                name: payload.name.trim(),
                description: payload.tags.length ? payload.tags.join(", ") : "",
                tests,
            });

            if (String(response.code) !== "200" && response.code !== 200) {
                messageApi.error(response.message || "Failed to save template");
                return;
            }

            const templateId =
                response.data?.id ||
                response.data?.template_id ||
                response.id ||
                response.template_id ||
                `custom-${Date.now()}`;

            const newTemplate: TemplateOption = {
                id: String(templateId),
                label: payload.name.trim(),
                testIds: tests.map((test) => test.test_code),
            };
            setTemplates((prev) => [...prev, newTemplate]);
            setActiveTemplate(newTemplate.id);
            setSelectedIds(newTemplate.testIds);
            setCategory("all");
            setSearchInput("");
            setTestsPage(1);
            setSaveTemplateOpen(false);
            messageApi.success(response.message || `Template "${payload.name}" saved`);
        } catch (error) {
            console.error("Failed to save lab test template:", error);
            messageApi.error("Failed to save template");
        } finally {
            setSavingTemplate(false);
        }
    };

    const columns = [
        {
            title: "Select & Investigation Name",
            key: "name",
            render: (_: unknown, record: LabTestOption) => {
                const checked = selectedIds.includes(record.id);
                return (
                    <div
                        className="add-lab-name-cell"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Checkbox
                            checked={checked}
                            onChange={(e) => toggleTest(record.id, e.target.checked)}
                        />
                        <span className="add-lab-test-name">{record.name}</span>
                    </div>
                );
            },
        },
        {
            title: "Code",
            dataIndex: "code",
            key: "code",
            width: 110,
            align: "left" as const,
            className: "add-lab-code-col",
            render: (code: string) => (
                <div className="add-lab-code-cell">
                    <StatusTag type={STATUS_INFO} className="code-badge">
                        {code}
                    </StatusTag>
                </div>
            ),
        },
        {
            title: "Specimen",
            dataIndex: "specimen",
            key: "specimen",
        },
        {
            title: "TAT",
            dataIndex: "tat",
            key: "tat",
            width: 120,
            render: (tat: string) => <span className="add-lab-tat">{tat}</span>,
        },
    ];

    const patientLabel = patient
        ? `${patient.patient_name}${patient.patient_code ? ` (${patient.patient_code})` : ""}`
        : "Patient";

    return (
        <Layout>
            {contextHolder}
            <Sidebar />
            <Layout>
                <Breadcrumb
                    className="add-lab-breadcrumb"
                    items={[
                        {
                            href: "/dashboard",
                            title: <HomeOutlined />,
                        },
                        {
                            title: (
                                <Link to="/patients">
                                    <UserOutlined />
                                    <span>Patients</span>
                                </Link>
                            ),
                        },
                        {
                            title: patientID ? (
                                <Link to={`/patients/patient-overview/${patientID}`}>
                                    {patientLabel}
                                </Link>
                            ) : (
                                patientLabel
                            ),
                        },
                        {
                            title: (
                                <>
                                    <ExperimentOutlined />
                                    <span>Add Lab Test</span>
                                </>
                            ),
                        },
                    ]}
                />

                <Content className="add-lab-page">
                    <section className="add-lab-section">
                        <div className="add-lab-section-header">
                            <div className="add-lab-section-title">
                                <span className="add-lab-step">1</span>
                                <div>
                                    <h2>Select Lab Tests</h2>
                                    <p>Select individual tests or quick templates</p>
                                </div>
                            </div>
                            <StatusTag type={STATUS_SUCCESS} bordered>
                                {selectedIds.length} tests selected
                            </StatusTag>
                        </div>

                        <div className="add-lab-templates">
                            <span className="add-lab-templates-label">Quick Clinical Templates</span>
                            <div className="add-lab-template-list">
                                {templates.map((template) => {
                                    const active = activeTemplate === template.id;
                                    return (
                                        <button
                                            key={template.id}
                                            type="button"
                                            className={`add-lab-template-chip${active ? " is-active" : ""}`}
                                            onClick={() => applyTemplate(template)}
                                        >
                                            {active ? <CheckOutlined /> : null}
                                            {template.label}
                                        </button>
                                    );
                                })}
                                <button
                                    type="button"
                                    className="add-lab-template-chip is-create"
                                    onClick={openSaveTemplateModal}
                                >
                                    <PlusOutlined />
                                    Create Custom Template
                                </button>
                            </div>
                        </div>

                            <Input
                            className="add-lab-search"
                            placeholder="Filter tests by name, code, or specimen (e.g. CBC, Glucose, HbA1c)..."
                            value={searchInput}
                            onChange={(e) => {
                                setSearchInput(e.target.value ?? "");
                                setTestsPage(1);
                            }}
                            allowClear
                            prefix={<SearchOutlined />}
                        />

                        <div className="add-lab-categories">
                            {CATEGORIES.map((item) => (
                                <button
                                    key={item.key}
                                    type="button"
                                    className={`add-lab-category${category === item.key ? " is-active" : ""}`}
                                    onClick={() => {
                                        setCategory(item.key);
                                        setTestsPage(1);
                                    }}
                                >
                                    {item.label} ({categoryCounts[item.key]})
                                </button>
                            ))}
                        </div>

                        <div className="add-lab-table-wrap">
                            <Table
                                rowKey="id"
                                columns={columns}
                                dataSource={pagedTests}
                                loading={testsLoading}
                                pagination={false}
                                size="middle"
                                tableLayout="fixed"
                                locale={{ emptyText: testsLoading ? "Loading tests..." : "No lab tests" }}
                                rowClassName={(record) =>
                                    selectedIds.includes(record.id) ? "add-lab-row-selected" : ""
                                }
                                onRow={(record) => ({
                                    onClick: () =>
                                        toggleTest(record.id, !selectedIds.includes(record.id)),
                                })}
                            />
                            {showTestsPagination ? (
                                <div className="add-lab-table-footer">
                                    <span className="add-lab-table-count">
                                        Showing {(testsPage - 1) * TESTS_PAGE_SIZE + 1}-
                                        {Math.min(testsPage * TESTS_PAGE_SIZE, filteredTests.length)} of{" "}
                                        {filteredTests.length} tests
                                    </span>
                                    <Pagination
                                        current={testsPage}
                                        total={filteredTests.length}
                                        pageSize={TESTS_PAGE_SIZE}
                                        onChange={setTestsPage}
                                        showSizeChanger={false}
                                    />
                                </div>
                            ) : null}
                        </div>

                        <div className="add-lab-template-banner">
                            <div>
                                <strong>Save active selection as custom clinical template?</strong>
                                <p>Reusable panel shortcut for your entire clinic team.</p>
                            </div>
                            <Button icon={<SaveOutlined />} onClick={openSaveTemplateModal}>
                                Save as Template
                            </Button>
                        </div>
                    </section>

                    <section className="add-lab-section">
                        <div className="add-lab-section-header">
                            <div className="add-lab-section-title">
                                <span className="add-lab-step">2</span>
                                <div>
                                    <h2>Diagnostic Centre</h2>
                                    <p>Choose where this lab order should be processed</p>
                                </div>
                            </div>
                            <div className="add-lab-section-actions">
                                <Button type="text" icon={<EyeOutlined />}>
                                    Preview Lab Order
                                </Button>
                                <Button type="text" icon={<PrinterOutlined />}>
                                    Print Order Slip
                                </Button>
                            </div>
                        </div>

                        <div className="add-lab-assignment-grid">
                            <div className="add-lab-diagnostic-field">
                                <label htmlFor="assigned-by">Assigned by</label>
                                <Select
                                    id="assigned-by"
                                    className="add-lab-diagnostic-select"
                                    showSearch
                                    filterOption={false}
                                    loading={doctorsLoading}
                                    placeholder={
                                        doctorsLoading
                                            ? "Loading doctors..."
                                            : "Search and select doctor"
                                    }
                                    value={doctorId}
                                    options={doctorOptions}
                                    onSearch={setDoctorSearch}
                                    onChange={setDoctorId}
                                    notFoundContent={
                                        doctorsLoading ? "Loading..." : "No doctors found"
                                    }
                                />
                            </div>

                            <div className="add-lab-diagnostic-field">
                                <label htmlFor="diagnostic-center">Select Diagnostic Centre / Lab</label>
                                <Select
                                    id="diagnostic-center"
                                    className="add-lab-diagnostic-select"
                                    showSearch
                                    filterOption={false}
                                    loading={diagnosticLoading}
                                    placeholder={
                                        diagnosticLoading
                                            ? "Loading diagnostic centres..."
                                            : "Search and select diagnostic centre"
                                    }
                                    value={diagnosticCenter}
                                    options={diagnosticOptions}
                                    onSearch={setDiagnosticSearch}
                                    onChange={setDiagnosticCenter}
                                    notFoundContent={
                                        diagnosticLoading
                                            ? "Loading..."
                                            : "No diagnostic centres found"
                                    }
                                />
                            </div>
                        </div>

                        <div className="add-lab-dispatch-note">
                            <CheckCircleOutlined />
                            <span>Orders are electronically dispatched upon submission.</span>
                        </div>
                    </section>

                    <div className="add-lab-footer">
                        <Button type="text" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <div className="add-lab-footer-actions">
                            <Button icon={<SaveOutlined />} onClick={handleSaveDraft}>
                                Save Draft
                            </Button>
                            <Button
                                type="primary"
                                className="add-lab-submit-btn"
                                loading={submitting}
                                onClick={() => {
                                    void handleSubmit();
                                }}
                            >
                                Submit Lab Test <ArrowRightOutlined />
                            </Button>
                        </div>
                    </div>

                    <SaveTemplateModal
                        open={saveTemplateOpen}
                        defaultName={defaultTemplateName}
                        selectedTests={selectedTests}
                        saving={savingTemplate}
                        onCancel={() => {
                            if (!savingTemplate) setSaveTemplateOpen(false);
                        }}
                        onSave={(payload) => {
                            void handleSaveTemplate(payload);
                        }}
                    />
                </Content>
            </Layout>
        </Layout>
    );
}

export default AddLabTest;
