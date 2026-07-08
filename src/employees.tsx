import { Breadcrumb, Button, Input, Layout, Pagination, Table, Tag } from "antd"
import type { TableColumnsType } from "antd"
import Sidebar from "./sidebar"
import './employees.css'
import { useNavigate } from "react-router-dom"
import { HomeOutlined, PlusCircleOutlined, SearchOutlined, TeamOutlined } from '@ant-design/icons'
import { Content } from "antd/es/layout/layout"
import { useMemo, useState } from "react"
import dayjs from "dayjs"

interface Employee {
    id: string;
    name: string;
    role: string;
    department: string;
    mobile: string;
    joining_date: string;
    status: "active" | "on_leave" | "inactive";
}

interface EmployeeRow extends Employee {
    key: string;
    code: string;
}

const employees: Employee[] = [
    {
        id: "emp-001",
        name: "Dr. Rajesh Sangolli",
        role: "Doctor",
        department: "Cardiology",
        mobile: "9876543210",
        joining_date: "2022-03-15",
        status: "active",
    },
    {
        id: "emp-002",
        name: "Priya Sharma",
        role: "Nurse",
        department: "ICU",
        mobile: "9876543211",
        joining_date: "2023-01-10",
        status: "active",
    },
    {
        id: "emp-003",
        name: "Amit Patel",
        role: "Pharmacist",
        department: "Pharmacy",
        mobile: "9876543212",
        joining_date: "2021-08-22",
        status: "active",
    },
    {
        id: "emp-004",
        name: "Sneha Reddy",
        role: "Receptionist",
        department: "Reception",
        mobile: "9876543213",
        joining_date: "2024-02-01",
        status: "on_leave",
    },
    {
        id: "emp-005",
        name: "Vikram Singh",
        role: "Attendant",
        department: "Emergency",
        mobile: "9876543214",
        joining_date: "2023-06-18",
        status: "active",
    },
    {
        id: "emp-006",
        name: "Anita Desai",
        role: "Admin",
        department: "Reception",
        mobile: "9876543215",
        joining_date: "2020-11-05",
        status: "inactive",
    },
];

const statusColorMap: Record<Employee["status"], string> = {
    active: "green",
    on_leave: "orange",
    inactive: "red",
};

const statusLabelMap: Record<Employee["status"], string> = {
    active: "Active",
    on_leave: "On Leave",
    inactive: "Inactive",
};

function Employees() {
    const navigate = useNavigate()
    const [page, setPage] = useState(1)
    const pageSize = 10

    const dataSource: EmployeeRow[] = useMemo(
        () =>
            employees.map((employee, index) => ({
                ...employee,
                key: employee.id,
                code: `HMS-2024-${String(index + 1).padStart(3, "0")}`,
            })),
        []
    )

    const columns: TableColumnsType<EmployeeRow> = [
        {
            title: "Code",
            dataIndex: "code",
            className: "column-layout",
            render: (code: string) => <span className="code-badge">{code}</span>,
        },
        {
            title: "Employee Name",
            dataIndex: "name",
            className: "other-layout",
        },
        {
            title: "Role",
            dataIndex: "role",
            className: "other-layout",
        },
        {
            title: "Department",
            dataIndex: "department",
            className: "other-layout",
        },
        {
            title: "Mobile",
            dataIndex: "mobile",
            className: "other-layout",
        },
        {
            title: "Joining Date",
            dataIndex: "joining_date",
            className: "other-layout",
            sorter: (a, b) =>
                new Date(a.joining_date).getTime() - new Date(b.joining_date).getTime(),
            render: (date: string) => dayjs(date).format("DD MMMM YYYY"),
        },
        {
            title: "Status",
            dataIndex: "status",
            align: "center",
            render: (status: Employee["status"]) => (
                <Tag color={statusColorMap[status]} bordered className="app-tag">
                    {statusLabelMap[status]}
                </Tag>
            ),
        },
    ]

    return (
        <Layout>
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
                        <Button
                            icon={<PlusCircleOutlined />}
                            className="appointment-button"
                            onClick={() => navigate("/employees/add-employee")}
                        >
                            Add Employee
                        </Button>
                    </div>

                    <div className="search-layout">
                        <Input
                            className="search-input1"
                            placeholder="Search employees"
                            suffix={
                                <SearchOutlined
                                    style={{ cursor: "pointer", width: "14px", height: "14px" }}
                                />
                            }
                        />
                    </div>

                    <div className="table-data">
                        <Table<EmployeeRow>
                            columns={columns}
                            dataSource={dataSource}
                            pagination={false}
                            scroll={{ x: "max-content", y: 400 }}
                            showSorterTooltip={{ target: "sorter-icon" }}
                        />
                    </div>

                    <div className="pagination-tab">
                        <span className="count-label">
                            Total Employees ({dataSource.length})
                        </span>
                        <Pagination
                            current={page}
                            pageSize={pageSize}
                            total={dataSource.length}
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
