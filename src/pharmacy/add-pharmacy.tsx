import { Breadcrumb, Button, Form, Input, Layout, Select, Tabs, type TabsProps } from "antd";
import Sidebar from "../sidebar";
import { Link, useParams } from "react-router-dom";
import './add-pharmacy.css'
import AddManualForm from "./add-manual-form";

export default function AddPharmacy() {
    const { id } = useParams()
    const onChange = (key: string) => {
        console.log(key);
    };
    const items: TabsProps['items'] = [
        {
            key: '1',
            label: 'Manual Entry',
            children: <AddManualForm/>,
        },
        {
            key: '2',
            label: 'Upload Invoice (PDF)',
            children: 'Content of Tab Pane 2',
        },
    ];
    return (
        <>
            <Tabs defaultActiveKey="1" items={items} size="small" onChange={onChange} />
        </>
    )
}