import {
    AutoComplete,
    Breadcrumb,
    Button,
    Card,
    Col,
    DatePicker,
    Drawer,
    Form,
    Input,
    InputNumber,
    Layout,
    Modal,
    Row,
    Select,
    Table,
    Tag,
    Typography,
    message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
    ArrowLeftOutlined,
    EditOutlined,
    FilePdfOutlined,
    HomeOutlined,
    PlusOutlined,
    SearchOutlined,
    ShopOutlined,
} from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import { useMemo, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import Sidebar from "../../sidebar";
import { SearchMedicines } from "../../prescriptions/api/prescription";
import type { SearchMedicineItem } from "../../prescriptions/types/prescriptionmodel";
import { AddMedicine } from "../api/stock-fill";
import type { AddMedicineInfo, AddMedicinePayload } from "../types/stock-fill";

import "./fill-stock.css";

const { Content } = Layout;
const { Title, Text } = Typography;

type EntryMode = "chooser" | "manual" | "upload";

export interface FillStockLocationState {
    supplierName?: string;
    supplierCode?: string;
    supplierStatus?: string;
}

interface StockFillLine extends AddMedicineInfo {
    key: string;
}

interface MedicineFormValues {
    name: string;
    form: string;
    strength: string;
    hsn_code: string;
    batch_no: string;
    expiry_date: Dayjs;
    shelf_location: string;
    purchase_qty_boxes: number;
    units_per_box: number;
    mrp: number;
    purchase_price: number;
    discount: number;
    selling_price: number;
    reorder_level: number;
    max_stock_target: number;
}

interface MedicineOption {
    value: string;
    label: ReactNode;
    medicine?: SearchMedicineItem;
    isNew?: boolean;
}

const MEDICINE_FORMS = [
    { value: "TABLET", label: "Tablet" },
    { value: "CAPSULE", label: "Capsule" },
    { value: "SYRUP", label: "Syrup" },
    { value: "INJECTION", label: "Injection" },
    { value: "OINTMENT", label: "Ointment" },
    { value: "DROPS", label: "Drops" },
    { value: "POWDER", label: "Powder" },
    { value: "OTHER", label: "Other" },
];

function normalizeMedicineForm(formValue?: string): string {
    if (!formValue) return "TABLET";
    const upper = formValue.trim().toUpperCase();
    const match = MEDICINE_FORMS.find((f) => f.value === upper || f.label.toUpperCase() === upper);
    return match?.value ?? "OTHER";
}

function lineUnits(line: StockFillLine): number {
    return (line.purchase_qty_boxes || 0) * (line.units_per_box || 0);
}

function linePurchaseTotal(line: StockFillLine): number {
    return (line.purchase_price || 0) * (line.purchase_qty_boxes || 0);
}

function getApiErrorMessage(error: unknown): string | null {
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
    if (error instanceof Error) return error.message;
    return null;
}

function FillStockPage() {
    const { supplierId } = useParams<{ supplierId: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();
    const [modal, modalContextHolder] = Modal.useModal();
    const [form] = Form.useForm<MedicineFormValues>();

    const navState = (location.state ?? {}) as FillStockLocationState;
    const supplierName = navState.supplierName || "Supplier";
    const supplierCode = navState.supplierCode || supplierId?.slice(0, 8) || "—";
    const supplierStatus = navState.supplierStatus || "Active";

    const [invoiceNo, setInvoiceNo] = useState("");
    const [paymentDueDate, setPaymentDueDate] = useState<Dayjs | null>(dayjs().add(5, "day"));
    const [mode, setMode] = useState<EntryMode>("chooser");
    const [lines, setLines] = useState<StockFillLine[]>([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [medicineOptions, setMedicineOptions] = useState<MedicineOption[]>([]);
    const [nameSearchValue, setNameSearchValue] = useState("");
    const [isNewMedicine, setIsNewMedicine] = useState(false);
    const [selectedMedicineId, setSelectedMedicineId] = useState<string | null>(null);

    const watchedMrp = Form.useWatch("mrp", form);
    const watchedDiscount = Form.useWatch("discount", form);

    const invoiceReady = invoiceNo.trim().length > 0 && paymentDueDate != null;

    const buildNewMedicineOption = (name: string): MedicineOption => ({
        value: name,
        isNew: true,
        label: (
            <div>
                <div className="fill-stock-medicine-option-name">Add as new medicine</div>
                <div className="fill-stock-medicine-option-generic">{name}</div>
            </div>
        ),
    });

    const searchMedicine = async (value: string) => {
        const query = value.trim();
        if (query.length < 1) {
            setMedicineOptions([]);
            return;
        }
        try {
            const response = await SearchMedicines(query);
            const rows = Array.isArray(response?.data) ? response.data : [];
            const options: MedicineOption[] = rows.map((item: SearchMedicineItem) => ({
                value: item.name,
                label: (
                    <div>
                        <div className="fill-stock-medicine-option-name">{item.name}</div>
                        <div className="fill-stock-medicine-option-generic">
                            {[item.generic_name, item.strength, item.form, item.hsn_code]
                                .filter(Boolean)
                                .join(" · ")}
                        </div>
                    </div>
                ),
                medicine: item,
            }));

            const hasExact = rows.some(
                (item) => item.name.trim().toLowerCase() === query.toLowerCase(),
            );
            if (!hasExact) {
                options.push(buildNewMedicineOption(query));
            }
            setMedicineOptions(options);
        } catch (err) {
            console.error(err);
            messageApi.error("Failed to search medicines");
            setMedicineOptions([buildNewMedicineOption(query)]);
        }
    };

    const applyExistingMedicine = (medicine: SearchMedicineItem) => {
        form.setFieldsValue({
            name: medicine.name,
            form: normalizeMedicineForm(medicine.form),
            strength: medicine.strength || form.getFieldValue("strength"),
            ...(medicine.hsn_code != null && medicine.hsn_code !== ""
                ? { hsn_code: medicine.hsn_code }
                : {}),
            ...(medicine.shelf_location != null && medicine.shelf_location !== ""
                ? { shelf_location: medicine.shelf_location }
                : {}),
            ...(medicine.reorder_level != null
                ? { reorder_level: Number(medicine.reorder_level) }
                : {}),
            ...(medicine.max_stock_target != null
                ? { max_stock_target: Number(medicine.max_stock_target) }
                : {}),
        });
        setNameSearchValue(medicine.name);
        setMedicineOptions([]);
        setSelectedMedicineId(medicine.id);
        setIsNewMedicine(false);
    };

    const commitAsNewMedicine = (rawName: string) => {
        const name = rawName.trim();
        if (!name) return;
        form.setFieldsValue({
            name,
            form: form.getFieldValue("form") || "TABLET",
            strength: form.getFieldValue("strength") || undefined,
        });
        setNameSearchValue(name);
        setMedicineOptions([]);
        setSelectedMedicineId(null);
        setIsNewMedicine(true);
        messageApi.success(`New medicine: ${name} — fill the remaining fields`);
    };

    const handleMedicineNameEnter = () => {
        const typed = nameSearchValue.trim();
        if (!typed) return;

        const exact = medicineOptions.find(
            (opt) =>
                !opt.isNew &&
                opt.medicine &&
                opt.value.trim().toLowerCase() === typed.toLowerCase(),
        );
        if (exact?.medicine) {
            applyExistingMedicine(exact.medicine);
            return;
        }
        commitAsNewMedicine(typed);
    };

    const requireInvoice = (): boolean => {
        if (invoiceReady) return true;
        messageApi.warning("Enter invoice number and payment due date before continuing");
        return false;
    };

    const handleChooseMode = (next: "manual" | "upload") => {
        if (!requireInvoice()) return;
        if (next === "upload") {
            messageApi.info("Invoice upload coming next — use Manual Entry for now");
            return;
        }
        setMode("manual");
    };

    const openAddDrawer = () => {
        if (!requireInvoice()) return;
        setEditingKey(null);
        form.resetFields();
        setNameSearchValue("");
        setMedicineOptions([]);
        setIsNewMedicine(false);
        setSelectedMedicineId(null);
        form.setFieldsValue({
            form: "TABLET",
            purchase_qty_boxes: 1,
            units_per_box: 15,
            discount: 0,
            reorder_level: 50,
            max_stock_target: 200,
        });
        setDrawerOpen(true);
    };

    const openEditDrawer = (line: StockFillLine) => {
        setEditingKey(line.key);
        setNameSearchValue(line.name);
        setMedicineOptions([]);
        setSelectedMedicineId(line.medicine_id ?? null);
        setIsNewMedicine(!line.medicine_id);
        form.setFieldsValue({
            name: line.name,
            form: line.form,
            strength: line.strength,
            hsn_code: line.hsn_code,
            batch_no: line.batch_no,
            expiry_date: dayjs(line.expiry_date),
            shelf_location: line.shelf_location,
            purchase_qty_boxes: line.purchase_qty_boxes,
            units_per_box: line.units_per_box,
            mrp: line.mrp,
            purchase_price: line.purchase_price,
            discount: line.discount,
            selling_price: line.selling_price,
            reorder_level: line.reorder_level,
            max_stock_target: line.max_stock_target,
        });
        setDrawerOpen(true);
    };

    const closeDrawer = () => {
        setDrawerOpen(false);
        setEditingKey(null);
        setNameSearchValue("");
        setMedicineOptions([]);
        setIsNewMedicine(false);
        setSelectedMedicineId(null);
        form.resetFields();
    };

    const handleDrawerSave = async () => {
        try {
            const values = await form.validateFields();
            const medicine: AddMedicineInfo = {
                ...(selectedMedicineId ? { medicine_id: selectedMedicineId } : {}),
                name: values.name.trim(),
                form: values.form,
                strength: values.strength.trim(),
                hsn_code: values.hsn_code.trim(),
                batch_no: values.batch_no.trim(),
                expiry_date: values.expiry_date.startOf("day").toISOString(),
                shelf_location: values.shelf_location.trim(),
                purchase_qty_boxes: Number(values.purchase_qty_boxes),
                units_per_box: Number(values.units_per_box),
                mrp: Number(values.mrp),
                purchase_price: Number(values.purchase_price),
                discount: Number(values.discount) || 0,
                selling_price: Number(values.selling_price),
                reorder_level: Number(values.reorder_level),
                max_stock_target: Number(values.max_stock_target),
            };

            if (editingKey) {
                setLines((prev) =>
                    prev.map((row) =>
                        row.key === editingKey ? { ...medicine, key: editingKey } : row,
                    ),
                );
            } else {
                setLines((prev) => [...prev, { ...medicine, key: `${Date.now()}-${prev.length}` }]);
            }
            closeDrawer();
        } catch {
            /* validation errors shown by form */
        }
    };

    const removeLine = (key: string) => {
        setLines((prev) => prev.filter((row) => row.key !== key));
    };

    const summary = useMemo(() => {
        const totalUnits = lines.reduce((sum, l) => sum + lineUnits(l), 0);
        const purchaseValue = lines.reduce((sum, l) => sum + linePurchaseTotal(l), 0);
        return { totalUnits, purchaseValue };
    }, [lines]);

    const columns: ColumnsType<StockFillLine> = [
        {
            title: "Medicine",
            dataIndex: "name",
            render: (name: string, record) => (
                <div className="fill-stock-medicine-cell">
                    <div className="fill-stock-medicine-cell-name" title={name}>
                        {name}
                    </div>
                    <div className="fill-stock-medicine-cell-meta">
                        {record.form} · {record.strength}
                    </div>
                </div>
            ),
        },
        {
            title: "Batch",
            dataIndex: "batch_no",
            width: "10%",
            ellipsis: true,
        },
        {
            title: "Expiry",
            dataIndex: "expiry_date",
            width: "9%",
            render: (value: string) => dayjs(value).format("MMM YYYY"),
        },
        {
            title: "Boxes",
            dataIndex: "purchase_qty_boxes",
            width: "7%",
            align: "right",
            className: "fill-stock-col-num",
        },
        {
            title: "U/box",
            dataIndex: "units_per_box",
            width: "7%",
            align: "right",
            className: "fill-stock-col-num",
        },
        {
            title: "Units",
            width: "8%",
            align: "right",
            className: "fill-stock-col-num",
            render: (_, record) => lineUnits(record),
        },
        {
            title: "MRP",
            dataIndex: "mrp",
            width: "9%",
            align: "right",
            className: "fill-stock-col-num",
            render: (v: number) => `₹${Number(v).toFixed(2)}`,
        },
        {
            title: "Purchase",
            dataIndex: "purchase_price",
            width: "10%",
            align: "right",
            className: "fill-stock-col-num",
            render: (v: number) => `₹${Number(v).toFixed(2)}`,
        },
        {
            title: "Selling",
            dataIndex: "selling_price",
            width: "9%",
            align: "right",
            className: "fill-stock-col-num",
            render: (v: number) => `₹${Number(v).toFixed(2)}`,
        },
        {
            title: "Actions",
            key: "actions",
            width: "12%",
            align: "right",
            render: (_, record) => (
                <div className="fill-stock-row-actions">
                    <Button type="link" size="small" onClick={() => openEditDrawer(record)}>
                        Edit
                    </Button>
                    <Button type="link" danger size="small" onClick={() => removeLine(record.key)}>
                        Remove
                    </Button>
                </div>
            ),
        },
    ];

    const buildPayload = (): AddMedicinePayload | null => {
        const organisation_id = localStorage.getItem("organisation_id") || "";
        const user_id = localStorage.getItem("user_id") || "";
        if (!organisation_id || !user_id) {
            messageApi.error("Missing organisation or user — please log in again");
            return null;
        }
        if (!supplierId) {
            messageApi.error("Missing supplier");
            return null;
        }
        if (!invoiceNo.trim()) {
            messageApi.warning("Enter invoice number before posting");
            return null;
        }
        if (!paymentDueDate) {
            messageApi.warning("Payment due date is required");
            return null;
        }
        if (lines.length === 0) {
            messageApi.warning("Add at least one medicine");
            return null;
        }

        return {
            user_id,
            supplier_id: supplierId,
            organisation_id,
            invoice_no: invoiceNo.trim(),
            payment_due_date: paymentDueDate.startOf("day").toISOString(),
            medicine_info: lines.map((line) => {
                const info: AddMedicineInfo = {
                    name: line.name,
                    form: line.form,
                    strength: line.strength,
                    hsn_code: line.hsn_code,
                    batch_no: line.batch_no,
                    expiry_date: dayjs(line.expiry_date).startOf("day").toISOString(),
                    shelf_location: line.shelf_location,
                    purchase_qty_boxes: Number(line.purchase_qty_boxes),
                    units_per_box: Number(line.units_per_box),
                    mrp: Number(line.mrp),
                    purchase_price: Number(line.purchase_price),
                    discount: Number(line.discount) || 0,
                    selling_price: Number(line.selling_price),
                    reorder_level: Number(line.reorder_level),
                    max_stock_target: Number(line.max_stock_target),
                };
                if (line.medicine_id) {
                    info.medicine_id = line.medicine_id;
                }
                return info;
            }),
        };
    };

    const postStock = async (payload: AddMedicinePayload) => {
        setSubmitting(true);
        try {
            const response = await AddMedicine(payload);
            const code = response.code != null ? String(response.code) : "200";
            if (code !== "200" && code !== "201") {
                throw new Error(response.message || "Failed to add medicine stock");
            }
            messageApi.success(response.message || "Stock filled successfully");
            navigate("/suppliers");
        } catch (error) {
            console.error("AddMedicine failed:", error);
            messageApi.error(getApiErrorMessage(error) || "Failed to post stock. Try again.");
            throw error;
        } finally {
            setSubmitting(false);
        }
    };

    const handleConfirm = () => {
        if (!requireInvoice()) return;

        const payload = buildPayload();
        if (!payload) return;

        modal.confirm({
            title: "Confirm stock fill?",
            content: (
                <div>
                    <p>
                        Post <strong>{payload.medicine_info.length}</strong> medicine
                        {payload.medicine_info.length === 1 ? "" : "s"} (
                        {summary.totalUnits} units) from invoice{" "}
                        <strong>{payload.invoice_no}</strong>?
                    </p>
                    <p style={{ marginBottom: 0, color: "#6b7280" }}>
                        Purchase value: ₹{summary.purchaseValue.toFixed(2)}
                    </p>
                </div>
            ),
            okText: "Confirm & Post",
            okButtonProps: { type: "primary" },
            cancelText: "Cancel",
            onOk: async () => {
                await postStock(payload);
            },
        });
    };

    const statusColor =
        supplierStatus.toLowerCase() === "active"
            ? "green"
            : supplierStatus.toLowerCase() === "inactive"
              ? "red"
              : "default";

    return (
        <Layout>
            {contextHolder}
            {modalContextHolder}
            <Sidebar />
            <Layout>
                <Content className="fill-stock-page">
                    <Breadcrumb
                        className="fill-stock-breadcrumb"
                        items={[
                            {
                                href: "/dashboard",
                                title: <HomeOutlined />,
                            },
                            {
                                title: (
                                    <Link to="/suppliers">
                                        <ShopOutlined />
                                        <span> Suppliers</span>
                                    </Link>
                                ),
                            },
                            {
                                title: <span>{supplierName}</span>,
                            },
                            {
                                title: "Fill Stock",
                            },
                        ]}
                    />

                    <div className="fill-stock-content">
                        <Card className="fill-stock-header-card" bordered>
                            <div className="fill-stock-supplier-row">
                                <Title level={4} className="fill-stock-supplier-name">
                                    {supplierName}
                                </Title>
                                <span className="fill-stock-supplier-code">{supplierCode}</span>
                                <Tag color={statusColor} bordered>
                                    {supplierStatus}
                                </Tag>
                                <Tag>Draft</Tag>
                            </div>

                            <Form layout="vertical" className="fill-stock-invoice-row">
                                <Form.Item label="Invoice No." required style={{ flex: 1.2 }}>
                                    <Input
                                        placeholder="e.g. GST-2026-0001"
                                        value={invoiceNo}
                                        onChange={(e) => setInvoiceNo(e.target.value)}
                                        maxLength={64}
                                    />
                                </Form.Item>
                                <Form.Item label="Payment due date" required style={{ flex: 1 }}>
                                    <DatePicker
                                        value={paymentDueDate}
                                        onChange={(d) => setPaymentDueDate(d)}
                                        style={{ width: "100%" }}
                                        format="DD/MM/YYYY"
                                    />
                                </Form.Item>
                            </Form>
                        </Card>

                        {mode === "chooser" && (
                            <div className="fill-stock-mode-section">
                                <Title level={4} className="fill-stock-mode-title">
                                    How do you want to add stock?
                                </Title>
                                <Text className="fill-stock-mode-subtitle">
                                    Choose an entry method. Invoice number is required first.
                                </Text>

                                <div className="fill-stock-mode-grid">
                                    <Card
                                        className="fill-stock-mode-card"
                                        bordered
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => handleChooseMode("manual")}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault();
                                                handleChooseMode("manual");
                                            }
                                        }}
                                    >
                                        <div className="fill-stock-mode-icon">
                                            <EditOutlined />
                                        </div>
                                        <Title level={5} className="fill-stock-mode-card-title">
                                            Manual Entry
                                        </Title>
                                        <p className="fill-stock-mode-card-desc">
                                            Add new medicines with batch, boxes, MRP, and prices.
                                        </p>
                                    </Card>

                                    <Card
                                        className="fill-stock-mode-card"
                                        bordered
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => handleChooseMode("upload")}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault();
                                                handleChooseMode("upload");
                                            }
                                        }}
                                    >
                                        <div className="fill-stock-mode-icon">
                                            <FilePdfOutlined />
                                        </div>
                                        <Title level={5} className="fill-stock-mode-card-title">
                                            Upload Invoice PDF
                                        </Title>
                                        <p className="fill-stock-mode-card-desc">
                                            Upload a supplier PDF to extract line items, then review.
                                        </p>
                                    </Card>
                                </div>
                            </div>
                        )}

                        {mode === "manual" && (
                            <>
                                <Button
                                    type="link"
                                    className="fill-stock-back-mode"
                                    icon={<ArrowLeftOutlined />}
                                    onClick={() => setMode("chooser")}
                                >
                                    Change entry method
                                </Button>

                                <div className="fill-stock-manual-toolbar">
                                    <Text type="secondary">
                                        Search an existing medicine to autofill, or type a new name.
                                    </Text>
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={openAddDrawer}
                                    >
                                        Add medicine
                                    </Button>
                                </div>

                                <Text className="fill-stock-unit-hint">
                                    Total units = boxes × units per box. Purchase price is per box
                                    (supplier cost). Selling price is what you charge (often near MRP).
                                </Text>

                                {lines.length === 0 ? (
                                    <div className="fill-stock-empty">
                                        No items yet — click Add medicine to create a stock line.
                                    </div>
                                ) : (
                                    <Table
                                        className="fill-stock-line-table"
                                        columns={columns}
                                        dataSource={lines}
                                        pagination={false}
                                        rowKey="key"
                                        size="middle"
                                        tableLayout="fixed"
                                    />
                                )}

                                <div className="fill-stock-footer">
                                    <div className="fill-stock-footer-summary">
                                        {lines.length} medicine{lines.length === 1 ? "" : "s"} ·{" "}
                                        {summary.totalUnits} units · Purchase ₹
                                        {summary.purchaseValue.toFixed(2)}
                                    </div>
                                    <div className="fill-stock-footer-actions">
                                        <Button onClick={() => navigate("/suppliers")}>
                                            Cancel
                                        </Button>
                                        <Button
                                            type="primary"
                                            onClick={handleConfirm}
                                            disabled={lines.length === 0}
                                            loading={submitting}
                                        >
                                            Confirm & Post Stock
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </Content>
            </Layout>

            <Drawer
                title={editingKey ? "Edit medicine" : "Add medicine"}
                width={520}
                open={drawerOpen}
                onClose={closeDrawer}
                destroyOnClose
                footer={
                    <div className="fill-stock-drawer-footer">
                        <Button onClick={closeDrawer}>Cancel</Button>
                        <Button type="primary" onClick={() => void handleDrawerSave()}>
                            {editingKey ? "Update line" : "Add to list"}
                        </Button>
                    </div>
                }
            >
                <Form
                    form={form}
                    layout="vertical"
                    className="fill-stock-medicine-form"
                    requiredMark
                >
                    <Form.Item
                        name="name"
                        label="Medicine name"
                        className="fill-stock-name-item"
                        rules={[{ required: true, message: "Search or enter medicine name" }]}
                    >
                        <AutoComplete
                            className="fill-stock-medicine-search"
                            options={medicineOptions}
                            value={nameSearchValue}
                            defaultActiveFirstOption={false}
                            onSearch={(value) => {
                                setNameSearchValue(value);
                                form.setFieldValue("name", value);
                                setIsNewMedicine(false);
                                setSelectedMedicineId(null);
                                void searchMedicine(value);
                            }}
                            onChange={(value) => {
                                setNameSearchValue(value);
                                form.setFieldValue("name", value);
                                setIsNewMedicine(false);
                                setSelectedMedicineId(null);
                            }}
                            onSelect={(_value, option) => {
                                const opt = option as MedicineOption;
                                if (opt.isNew || !opt.medicine) {
                                    commitAsNewMedicine(opt.value || nameSearchValue);
                                    return;
                                }
                                applyExistingMedicine(opt.medicine);
                            }}
                        >
                            <Input
                                prefix={<SearchOutlined />}
                                placeholder="Search medicine..."
                                allowClear
                                maxLength={120}
                                onPressEnter={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleMedicineNameEnter();
                                }}
                            />
                        </AutoComplete>
                    </Form.Item>
                    <div className="fill-stock-name-meta">
                        {selectedMedicineId ? (
                            <Tag color="green">Existing medicine</Tag>
                        ) : isNewMedicine ? (
                            <Tag color="blue">New medicine</Tag>
                        ) : null}
                        <Text type="secondary" className="fill-stock-name-hint">
                            Select a match to autofill, or press Enter to add as a new medicine.
                        </Text>
                    </div>

                    <Row gutter={12}>
                        <Col span={12}>
                            <Form.Item
                                name="form"
                                label="Form"
                                rules={[{ required: true, message: "Select form" }]}
                            >
                                <Select options={MEDICINE_FORMS} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="strength"
                                label="Strength"
                                rules={[{ required: true, message: "Enter strength" }]}
                            >
                                <Input placeholder="e.g. 650mg" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={12}>
                        <Col span={12}>
                            <Form.Item
                                name="hsn_code"
                                label="HSN code"
                                rules={[{ required: true, message: "Enter HSN code" }]}
                            >
                                <Input placeholder="e.g. 30049011" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="batch_no"
                                label="Batch No."
                                rules={[{ required: true, message: "Enter batch number" }]}
                            >
                                <Input placeholder="e.g. BAT-4029" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={12}>
                        <Col span={12}>
                            <Form.Item
                                name="expiry_date"
                                label="Expiry"
                                rules={[{ required: true, message: "Select expiry" }]}
                            >
                                <DatePicker
                                    style={{ width: "100%" }}
                                    format="DD/MM/YYYY"
                                    disabledDate={(d) => d != null && d.isBefore(dayjs(), "day")}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="shelf_location"
                                label="Shelf location"
                                rules={[{ required: true, message: "Enter shelf location" }]}
                            >
                                <Input placeholder="e.g. Rack 3-B" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={12}>
                        <Col span={12}>
                            <Form.Item
                                name="purchase_qty_boxes"
                                label="Purchase qty (boxes)"
                                rules={[{ required: true, message: "Enter boxes" }]}
                            >
                                <InputNumber min={1} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="units_per_box"
                                label="Units per box"
                                rules={[{ required: true, message: "Enter units/box" }]}
                            >
                                <InputNumber min={1} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={12}>
                        <Col span={12}>
                            <Form.Item
                                name="mrp"
                                label="MRP (₹)"
                                rules={[{ required: true, message: "Enter MRP" }]}
                            >
                                <InputNumber
                                    min={0.01}
                                    step={0.5}
                                    precision={2}
                                    style={{ width: "100%" }}
                                    onChange={(mrp) => {
                                        const discount = Number(form.getFieldValue("discount")) || 0;
                                        if (mrp != null && form.getFieldValue("selling_price") == null) {
                                            form.setFieldValue(
                                                "selling_price",
                                                Math.max(0, Number(mrp) - discount),
                                            );
                                        }
                                    }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="purchase_price"
                                label="Purchase price (₹ / box)"
                                rules={[{ required: true, message: "Enter purchase price" }]}
                            >
                                <InputNumber min={0.01} step={0.5} precision={2} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={12}>
                        <Col span={12}>
                            <Form.Item name="discount" label="Discount (₹)" initialValue={0}>
                                <InputNumber
                                    min={0}
                                    step={0.5}
                                    precision={2}
                                    style={{ width: "100%" }}
                                    onChange={(discount) => {
                                        const mrp = Number(form.getFieldValue("mrp"));
                                        if (!Number.isNaN(mrp) && mrp > 0) {
                                            form.setFieldValue(
                                                "selling_price",
                                                Math.max(0, mrp - (Number(discount) || 0)),
                                            );
                                        }
                                    }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="selling_price"
                                label="Selling price (₹)"
                                rules={[{ required: true, message: "Enter selling price" }]}
                                extra={
                                    watchedMrp != null
                                        ? `Suggested: ₹${Math.max(0, Number(watchedMrp) - (Number(watchedDiscount) || 0)).toFixed(2)}`
                                        : undefined
                                }
                            >
                                <InputNumber min={0.01} step={0.5} precision={2} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={12}>
                        <Col span={12}>
                            <Form.Item
                                name="reorder_level"
                                label="Reorder level"
                                rules={[{ required: true, message: "Enter reorder level" }]}
                            >
                                <InputNumber min={0} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="max_stock_target"
                                label="Max stock target"
                                rules={[{ required: true, message: "Enter max stock" }]}
                            >
                                <InputNumber min={1} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Drawer>
        </Layout>
    );
}

export default FillStockPage;
