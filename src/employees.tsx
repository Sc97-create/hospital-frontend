import { Breadcrumb, Button, Input, Layout, Pagination, Table, message } from "antd"
import type { TableColumnsType } from "antd"
import Sidebar from "./sidebar"
import './employees.css'
import { useNavigate } from "react-router-dom"
import { HomeOutlined, PlusCircleOutlined, SearchOutlined, TeamOutlined } from '@ant-design/icons'
import { Content } from "antd/es/layout/layout"
import { useEffect, useRef, useState } from "react"
import { StatusTag } from "./components/status-tag"
import { getEmployeeStatusType, STATUS_INFO } from "./constants/status-colors"
import { GetEmployees } from "./employees/api/employee"
import type { EmployeeListItem } from "./employees/types/employee"
import { usePermissions } from "./auth/permissions-context"

const SEARCH_DEBOUNCE_MS = 400;

function formatStatusLabel(status: string): string {
    if (!status) return "—";
    return status
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function Employees() {
    const navigate = useNavigate()
    const { canCreate } = usePermissions()
    const [messageApi, contextHolder] = message.useMessage()
    const [page, setPage] = useState(1)
    const pageSize = 10
    const [employees, setEmployees] = useState<EmployeeListItem[]>([])
    const [totalEmployees, setTotalEmployees] = useState(0)
    const [loading, setLoading] = useState(false)
    const [searchInput, setSearchInput] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const organisationId = localStorage.getItem("organisation_id") || ""
    const requestIdRef = useRef(0)

    useEffect(() => {
        const nextSearch = searchInput.trim()
        if (nextSearch === debouncedSearch) return
        const timer = window.setTimeout(() => {
            setDebouncedSearch(nextSearch)
            setPage(1)
        }, SEARCH_DEBOUNCE_MS)
        return () => window.clearTimeout(timer)
    }, [searchInput, debouncedSearch])

    const fetchEmployees = async (pageNo: number, search: string) => {
        if (!organisationId) {
            messageApi.error("Missing organisation — please log in again")
            return
        }

        const requestId = ++requestIdRef.current
        setLoading(true)
        try {
            const trimmedSearch = search.trim()
            const response = await GetEmployees({
                organisation_id: organisationId,
                limit: pageSize,
                page_no: pageNo,
                ...(trimmedSearch ? { search: trimmedSearch } : {}),
            })
            if (requestId !== requestIdRef.current) return

            const rows = Array.isArray(response?.data) ? response.data : []
            const total = Number(response?.total ?? response?.total_count)
            setEmployees(rows)
            setTotalEmployees(Number.isFinite(total) ? total : 0)

            const maxPage = Math.max(1, Math.ceil((Number.isFinite(total) ? total : 0) / pageSize) || 1)
            if (pageNo > maxPage) {
                setPage(maxPage)
            }
        } catch (error) {
            if (requestId !== requestIdRef.current) return
            console.error("Failed to load employees:", error)
            messageApi.error("Failed to load employees")
            setEmployees([])
            setTotalEmployees(0)
        } finally {
            if (requestId === requestIdRef.current) {
                setLoading(false)
            }
        }
    }

    useEffect(() => {
        fetchEmployees(page, debouncedSearch)
        // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch when page / search changes
    }, [page, debouncedSearch, organisationId])

    const columns: TableColumnsType<EmployeeListItem> = [
        {
            title: "Code",
            dataIndex: "employee_code",
            className: "column-layout",
            render: (code: string) => (
                <StatusTag type={STATUS_INFO} className="code-badge">
                    {code || "—"}
                </StatusTag>
            ),
        },
        {
            title: "Employee Name",
            dataIndex: "employee_name",
            className: "other-layout",
            render: (name: string) => name || "—",
        },
        {
            title: "Role",
            dataIndex: "role_name",
            className: "other-layout",
            render: (role: string) => role || "—",
        },
        {
            title: "Department",
            dataIndex: "department_name",
            className: "other-layout",
            render: (department: string) => department || "—",
        },
        {
            title: "Mobile",
            dataIndex: "employee_phone",
            className: "other-layout",
            render: (phone: string) => phone || "—",
        },
        {
            title: "Email",
            dataIndex: "employee_email",
            className: "other-layout",
            render: (email: string) => email || "—",
        },
        {
            title: "Status",
            dataIndex: "employee_status",
            align: "center",
            render: (status: string) => (
                <StatusTag type={getEmployeeStatusType(status)} bordered>
                    {formatStatusLabel(status)}
                </StatusTag>
            ),
        },
    ]

    return (
        <Layout>
            {contextHolder}
            <Sidebar />
            <Layout>
                <Breadcrumb
                    className="breadcrumb-layout"
                    items={[
                        {
                            href: "/dashboard",
                            title: <HomeOutlined />,
                        },
                        {
                            title: (
                                <>
                                    <TeamOutlined />
                                    <span>Employees</span>
                                </>
                            ),
                        },
                    ]}
                />

                <Content className="main-layout">
                    <div className="button-layout">
                        {canCreate("employee") ? (
                            <Button
                                icon={<PlusCircleOutlined />}
                                className="appointment-button"
                                onClick={() => navigate("/employees/add-employee")}
                            >
                                Add Employee
                            </Button>
                        ) : null}
                    </div>

                    <div className="search-layout">
                        <Input
                            allowClear
                            className="search-input1"
                            placeholder="Search by name, code, phone, or email"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            suffix={
                                <SearchOutlined
                                    style={{ cursor: "pointer", width: "14px", height: "14px" }}
                                />
                            }
                        />
                    </div>

                    <div className="table-data">
                        <Table<EmployeeListItem>
                            columns={columns}
                            dataSource={employees}
                            rowKey="employee_id"
                            loading={loading}
                            pagination={false}
                            size="small"
                            locale={{ emptyText: "No employees yet" }}
                            showSorterTooltip={{ target: "sorter-icon" }}
                        />
                    </div>

                    <div className="pagination-tab">
                        <span className="count-label">
                            Total Employees ({totalEmployees})
                        </span>
                        <Pagination
                            current={page}
                            pageSize={pageSize}
                            total={totalEmployees}
                            onChange={(nextPage) => setPage(nextPage)}
                            showSizeChanger={false}
                        />
                    </div>
                </Content>
            </Layout>
        </Layout>
    )
}

export default Employees
