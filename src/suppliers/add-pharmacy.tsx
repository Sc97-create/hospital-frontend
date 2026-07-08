import { Tabs, type TabsProps } from "antd";
import './add-pharmacy.css'
import AddManualForm from "./add-manual-form";
import  UploadCsv from "./upload-inovice";

export default function AddPharmacy() {
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
            children: <UploadCsv/>,
        },
    ];
    return (
        <>
            <Tabs defaultActiveKey="1" items={items} size="small" onChange={onChange} />
        </>
    )
}