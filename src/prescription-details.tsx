import { Button, Layout, Space, Table, Tag, type TableProps } from "antd"
import { Content } from "antd/es/layout/layout"
import './prescription-details.css'
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";
interface DataType {
    key: string;
    code: string;
    doctor: string;
    issued_on: Date;
    prescription: string;
    symptoms: string[];
    approval: string;
}


function PrescriptionDetails() {
    const navigate = useNavigate()
    const patientID=useParams<{ patientID: string }>()
    const columns: TableProps<DataType>['columns'] = [
        {
            title: 'Code',
            dataIndex: 'code',
            key: 'code',
            className: 'other-layout',
            render: (text) => (
                <span style={{ backgroundColor: "yellow", padding: "2px 4px" }}>
                    {text}
                </span>
            )
        },
        {
            title: 'Doctor',
            dataIndex: 'doctor',
            key: 'doctor',
            className: 'other-layout',

        },


        {
            title: 'Issued On',
            dataIndex: 'issued_on',
            className: 'other-layout',
            key: 'issued_on',
            render: (date: Date) => dayjs(date).format("MMMM DD YYYY")
        },
        {
            title: 'Symptoms',
            key: 'symptoms',
            dataIndex: 'symptoms',
            className: 'other-layout',
            render: (_, { symptoms }) => (
                <>
                    {symptoms.map((tag) => {
                        let color = tag.length > 5 ? 'geekblue' : 'green';
                        if (tag === 'loser') {
                            color = 'volcano';
                        }
                        return (
                            <Tag color={color} key={tag}>
                                {tag}
                            </Tag>
                        );
                    })}
                </>
            ),
        },

        {
            title: 'Pharma Status',
            key: 'send_to_pharma',
            dataIndex: 'approval',
            align: 'center',
            render: (text) => (
                <>

                    <Tag>
                        {text}
                    </Tag>
                </>

            )
        },
        {
            title: 'Prescription',
            dataIndex: 'prescription',
            key: 'prescription',
            className: 'other-layout',
            align: 'center',
            render: (_) => (
                <Button
                    size="small"
                    className="file-button"
                    onClick={() => navigate(`/patients/prescription-preview/${patientID}`)}
                >
                    Preview
                </Button>
            ),
        },
    ];
    const data: DataType[] = [
        {
            key: '1',
            code: '#2145',
            doctor: 'John Brown',
            issued_on: new Date(2025, 8, 7),
            prescription: 'file',
            symptoms: ['nice', 'developer'],
            approval: 'Sent',
        },
        {
            key: '2',
            code: '#2145',
            doctor: 'Jim Green',
            issued_on: new Date(2025, 9, 8),
            prescription: 'file',
            symptoms: ['loser'],
            approval: 'Pending',

        },
        {
            key: '3',
            code: '#2145',
            doctor: 'Joe Black',
            issued_on: new Date(2025, 9, 8),
            prescription: 'file',
            symptoms: ['cool', 'teacher'],
            approval: 'Expired',
        },
    ];
    return (
        <>
            <div className="prescription-layout">
                <Table<DataType> columns={columns} dataSource={data} />
            </div>
        </>
    )
}
export default PrescriptionDetails