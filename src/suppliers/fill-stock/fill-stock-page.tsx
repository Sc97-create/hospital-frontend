import {
    AutoComplete,
    Breadcrumb,
    Button,
    Card,
    DatePicker,
    Form,
    Input,
    InputNumber,
    Layout,
    Modal,
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

import "./fill-stock.css";

const { Content } = Layout;
const { Title, Text } = Typography;

/** Mock default when medicine master has no pack size. */
const DEFAULT_PACK_SIZE = 10;

type EntryMode = "chooser" | "manual" | "upload";

export interface FillStockLocationState {
    supplierName?: string;
    supplierCode?: string;
    supplierStatus?: string;
}

interface MedicineOption {
    value: string;
    label: ReactNode;
    medicine: SearchMedicineItem;
}

interface StockFillLine {
    key: string;
    medicine_id: string;
    medicine_name: string;
    generic_name: string;
    pack_size: number;
    batch_number: string;
    expiry_date: Dayjs | null;
    quantity: number | null;
    mrp: number | null;
}

function unitPrice(mrp: number | null, packSize: number): number | null {
    if (mrp == null || !packSize) return null;
    return Math.round((mrp / packSize) * 100) / 100;
}

function lineTotal(mrp: number | null, packSize: number, qty: number | null): number | null {
    const unit = unitPrice(mrp, packSize);
    if (unit == null || qty == null) return null;
    return Math.round(unit * qty * 100) / 100;
}

function FillStockPage() {
    const { supplierId } = useParams<{ supplierId: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();

    const navState = (location.state ?? {}) as FillStockLocationState;
    const supplierName = navState.supplierName || "Supplier";
    const supplierCode = navState.supplierCode || supplierId?.slice(0, 8) || "—";
    const supplierStatus = navState.supplierStatus || "Active";

    const [invoiceNo, setInvoiceNo] = useState("");
    const [invoiceDate, setInvoiceDate] = useState<Dayjs | null>(dayjs());
    const [mode, setMode] = useState<EntryMode>("chooser");

    const [medicineOptions, setMedicineOptions] = useState<MedicineOption[]>([]);
    const [searchValue, setSearchValue] = useState("");
    const [selectedMedicine, setSelectedMedicine] = useState<SearchMedicineItem | null>(null);
    const [lines, setLines] = useState<StockFillLine[]>([]);

    const invoiceReady = invoiceNo.trim().length > 0 && invoiceDate != null;

    const searchMedicine = async (value: string) => {
        if (value.trim().length < 1) {
            setMedicineOptions([]);
            return;
        }
        try {
            const response = await SearchMedicines(value.trim());
            const rows = Array.isArray(response?.data) ? response.data : [];
            setMedicineOptions(
                rows.map((item: SearchMedicineItem) => ({
                    value: item.name,
                    label: (
                        <div>
                            <div className="fill-stock-medicine-option-name">{item.name}</div>
                            <div className="fill-stock-medicine-option-generic">
                                {[item.generic_name, item.strength, item.form]
                                    .filter(Boolean)
                                    .join(" · ")}
                            </div>
                        </div>
                    ),
                    medicine: item,
                })),
            );
        } catch (err) {
            console.error(err);
            messageApi.error("Failed to search medicines");
        }
    };

    const requireInvoice = (): boolean => {
        if (invoiceReady) return true;
        messageApi.warning("Enter invoice number and date before continuing");
        return false;
    };

    const handleChooseMode = (next: "manual" | "upload") => {
        if (!requireInvoice()) return;
        if (next === "upload") {
            messageApi.info("Invoice upload mock coming next — use Manual Entry for now");
            return;
        }
        setMode("manual");
    };

    const handleAddLine = () => {
        if (!requireInvoice()) return;
        if (!selectedMedicine) {
            messageApi.warning("Search and select a medicine first");
            return;
        }
        const already = lines.some((l) => l.medicine_id === selectedMedicine.id);
        if (already) {
            messageApi.warning("Medicine already added — edit the existing line");
            return;
        }
        setLines((prev) => [
            ...prev,
            {
                key: `${selectedMedicine.id}-${Date.now()}`,
                medicine_id: selectedMedicine.id,
                medicine_name: selectedMedicine.name,
                generic_name: selectedMedicine.generic_name,
                pack_size: DEFAULT_PACK_SIZE,
                batch_number: "",
                expiry_date: null,
                quantity: null,
                mrp: null,
            },
        ]);
        setSelectedMedicine(null);
        setSearchValue("");
        setMedicineOptions([]);
    };

    const updateLine = (key: string, patch: Partial<StockFillLine>) => {
        setLines((prev) => prev.map((row) => (row.key === key ? { ...row, ...patch } : row)));
    };

    const removeLine = (key: string) => {
        setLines((prev) => prev.filter((row) => row.key !== key));
    };

    const summary = useMemo(() => {
        const totalUnits = lines.reduce((sum, l) => sum + (l.quantity ?? 0), 0);
        const invoiceValue = lines.reduce((sum, l) => {
            const t = lineTotal(l.mrp, l.pack_size, l.quantity);
            return sum + (t ?? 0);
        }, 0);
        return { totalUnits, invoiceValue };
    }, [lines]);

    const columns: ColumnsType<StockFillLine> = [
        {
            title: "Medicine",
            dataIndex: "medicine_name",
            render: (name: string, record) => (
                <div>
                    <div>{name}</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {record.generic_name || "—"} · pack {record.pack_size}
                    </Text>
                </div>
            ),
        },
        {
            title: "Batch No.",
            dataIndex: "batch_number",
            width: 140,
            render: (value: string, record) => (
                <Input
                    size="small"
                    placeholder="Batch"
                    value={value}
                    onChange={(e) => updateLine(record.key, { batch_number: e.target.value })}
                />
            ),
        },
        {
            title: "Expiry",
            dataIndex: "expiry_date",
            width: 150,
            render: (value: Dayjs | null, record) => (
                <DatePicker
                    size="small"
                    picker="month"
                    format="MMM YYYY"
                    value={value}
                    disabledDate={(d) => d != null && d.isBefore(dayjs(), "day")}
                    onChange={(d) => updateLine(record.key, { expiry_date: d })}
                    style={{ width: "100%" }}
                />
            ),
        },
        {
            title: "Qty",
            dataIndex: "quantity",
            width: 100,
            render: (value: number | null, record) => (
                <InputNumber
                    size="small"
                    min={1}
                    value={value ?? undefined}
                    onChange={(v) => updateLine(record.key, { quantity: v })}
                    style={{ width: "100%" }}
                />
            ),
        },
        {
            title: "MRP (₹)",
            dataIndex: "mrp",
            width: 110,
            render: (value: number | null, record) => (
                <InputNumber
                    size="small"
                    min={0.01}
                    step={0.5}
                    precision={2}
                    value={value ?? undefined}
                    onChange={(v) => updateLine(record.key, { mrp: v })}
                    style={{ width: "100%" }}
                />
            ),
        },
        {
            title: "Unit (₹)",
            width: 90,
            render: (_, record) => {
                const u = unitPrice(record.mrp, record.pack_size);
                return u != null ? `₹${u.toFixed(2)}` : "—";
            },
        },
        {
            title: "Line total",
            width: 110,
            render: (_, record) => {
                const t = lineTotal(record.mrp, record.pack_size, record.quantity);
                return t != null ? `₹${t.toFixed(2)}` : "—";
            },
        },
        {
            title: "",
            width: 72,
            render: (_, record) => (
                <Button type="link" danger size="small" onClick={() => removeLine(record.key)}>
                    Remove
                </Button>
            ),
        },
    ];

    const handleConfirm = () => {
        if (!requireInvoice()) return;
        if (lines.length === 0) {
            messageApi.warning("Add at least one medicine line");
            return;
        }
        const incomplete = lines.find(
            (l) =>
                !l.batch_number.trim() ||
                !l.expiry_date ||
                l.quantity == null ||
                l.quantity <= 0 ||
                l.mrp == null ||
                l.mrp <= 0,
        );
        if (incomplete) {
            messageApi.warning("Fill batch, expiry, qty, and MRP on every line");
            return;
        }

        Modal.confirm({
            title: "Confirm stock fill?",
            content: (
                <div>
                    <p>
                        Post <strong>{lines.length}</strong> medicine
                        {lines.length === 1 ? "" : "s"} ({summary.totalUnits} units) from invoice{" "}
                        <strong>{invoiceNo.trim()}</strong> to inventory?
                    </p>
                    <p style={{ marginBottom: 0, color: "#6b7280" }}>
                        Invoice value (MRP): ₹{summary.invoiceValue.toFixed(2)}
                    </p>
                </div>
            ),
            okText: "Confirm & Post",
            okButtonProps: { type: "primary" },
            cancelText: "Cancel",
            onOk: () => {
                messageApi.success("Stock posted (mock) — wire API next");
                navigate("/suppliers");
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
                                <Form.Item
                                    label="Invoice No."
                                    required
                                    style={{ flex: 1.2 }}
                                >
                                    <Input
                                        placeholder="e.g. INV-2026-089"
                                        value={invoiceNo}
                                        onChange={(e) => setInvoiceNo(e.target.value)}
                                        maxLength={64}
                                    />
                                </Form.Item>
                                <Form.Item label="Invoice Date" required style={{ flex: 1 }}>
                                    <DatePicker
                                        value={invoiceDate}
                                        onChange={(d) => setInvoiceDate(d)}
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
                                            Search medicines and enter batch, expiry, qty, and MRP.
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
                                    <AutoComplete
                                        className="fill-stock-medicine-search"
                                        options={medicineOptions}
                                        value={searchValue}
                                        onSearch={(value) => {
                                            setSearchValue(value);
                                            void searchMedicine(value);
                                        }}
                                        onChange={(value) => {
                                            setSearchValue(value);
                                            if (!value) setSelectedMedicine(null);
                                        }}
                                        onSelect={(value, option) => {
                                            const med = (option as MedicineOption).medicine;
                                            setSearchValue(value);
                                            setSelectedMedicine(med);
                                        }}
                                    >
                                        <Input
                                            prefix={<SearchOutlined />}
                                            placeholder="Search medicine..."
                                            allowClear
                                        />
                                    </AutoComplete>
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={handleAddLine}
                                    >
                                        Add line
                                    </Button>
                                </div>

                                <Text className="fill-stock-unit-hint">
                                    Unit selling price = MRP ÷ pack size (default pack size{" "}
                                    {DEFAULT_PACK_SIZE} until medicine master provides it).
                                </Text>

                                {lines.length === 0 ? (
                                    <div className="fill-stock-empty">
                                        No items yet — search a medicine and click Add line.
                                    </div>
                                ) : (
                                    <Table
                                        className="fill-stock-line-table"
                                        columns={columns}
                                        dataSource={lines}
                                        pagination={false}
                                        rowKey="key"
                                        size="middle"
                                        scroll={{ x: 900 }}
                                    />
                                )}

                                <div className="fill-stock-footer">
                                    <div className="fill-stock-footer-summary">
                                        {lines.length} line{lines.length === 1 ? "" : "s"} ·{" "}
                                        {summary.totalUnits} units · Invoice value ₹
                                        {summary.invoiceValue.toFixed(2)}
                                    </div>
                                    <div className="fill-stock-footer-actions">
                                        <Button onClick={() => navigate("/suppliers")}>
                                            Cancel
                                        </Button>
                                        <Button
                                            type="primary"
                                            onClick={handleConfirm}
                                            disabled={lines.length === 0}
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
        </Layout>
    );
}

export default FillStockPage;
