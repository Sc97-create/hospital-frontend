import { message, Progress, Table, Upload, type TableColumnsType, type UploadProps, Pagination, type TablePaginationConfig } from "antd";
import { CheckCircleFilled, FilePdfOutlined, HighlightOutlined, InboxOutlined } from '@ant-design/icons'
import './upload-inovice.css'
import { Content } from "antd/es/layout/layout";
import datecheck from 'dayjs'
import { useState } from "react";

const { Dragger } = Upload;
const props: UploadProps = {
    name: 'file',
    multiple: true,
    action: 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload',
    onChange(info) {
        const { status } = info.file;
        if (status !== 'uploading') {
            console.log(info.file, info.fileList);
        }
        if (status === 'done') {
            message.success(`${info.file.name} file uploaded successfully.`);
        } else if (status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
        }
    },
    onDrop(e) {
        console.log('Dropped files', e.dataTransfer.files);
    },
};
interface DataType {
    key: React.Key;
    medicine_name: string;
    batch: string;
    expiry: Date;
    qty: number;
}
function UploadCsv() {
    return (
        <>
            <Content>
                <Dragger {...props}>
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <div className="upload-info">
                        <p className="inovice-upload-info">Click to upload or drag and drop</p>
                        <p className="invoice-upload-info-medium">PDF invoices only (max. 10MB)</p>
                    </div>
                    <div className="upload-hint">
                        <p >
                            <HighlightOutlined style={{ marginRight: 8 }} /> Upload supplier invoice to auto-extract medicines
                        </p>
                    </div>
                </Dragger>
                <div className="progress-bar-main">
                    <div className="info-row">
                        <div className="info-bar">
                            <div className="file-title">
                                <FilePdfOutlined className="file-icon" />
                                <h4>Invoice_inv-2023-001.pdf</h4>
                            </div>
                            <p className="status-text">Process In-Progress</p>
                        </div>
                        {/* <CheckCircleFilled className="status-icon" /> */}
                    </div>

                    <div className="progress-bar">
                        <Progress percent={70} status="exception" />
                    </div>
                </div>

            </Content>

        </>
    )
}
export default UploadCsv