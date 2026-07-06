import { Modal, Card, Checkbox, Row, Col, Button, Spin } from "antd";
import './add-permission.css'
import { GetPermissions, type Permission, type PermissionModule } from "../api/add-permissions";
import { useEffect, useState } from "react";


interface AddPermissionProps {
    open: boolean;
    onClose: () => void;
}

interface SelectedPermission {
    module_id: string;
    permission_id: string;
}

function AddPermission({ open, onClose }: AddPermissionProps) {
    const [selectedPermissions, setSelectedPermissions] = useState<SelectedPermission[]>([]);
    const toTitleCase = (text: string) => {
        return text
            .replace(/_/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };
    const handlePermissionChange = (
        moduleId: string,
        permissionId: string,
        checked: boolean
    ) => {
        if (checked) {
            setSelectedPermissions((prev) => [
                ...prev,
                { module_id: moduleId, permission_id: permissionId }
            ]);
        } else {
            setSelectedPermissions((prev) =>
                prev.filter(
                    (p) =>
                        !(p.module_id === moduleId && p.permission_id === permissionId)
                )
            );
        }
    };
    const handleSavePermissions = () => {
        console.log("selectedPermissions", selectedPermissions)

    }
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [modules, SetModules] = useState<PermissionModule[]>([])
    const [loading, setLoading] = useState(false)
    const fetchPermissions = async () => {
        setLoading(true)
        const data = await GetPermissions();
        SetModules(data.modules)
        setPermissions(data.permissions)
        setLoading(false)
    }
    const handleClose = () => {
        setSelectedPermissions([]);
        setPermissions([]);
        SetModules([]);
        onClose();
    };
    useEffect(() => {
        if (open) {
            fetchPermissions();
        }
    }, [open]);
    console.log("permissions", permissions)
    console.log("modules", modules)
    return (
        <Modal
            open={open}
            width="min(900px, 95vw)"
            footer={null}
            onCancel={handleClose}
            title="Assign Permissions to Employee"
        >
            <Row gutter={[16, 16]}>
                {loading ? (
                    <Spin
                        size="large"
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                        }}
                    />
                ) : modules.map((module) => (
                    <Col span={12} key={module.id}>
                        <Card
                            size="small"
                            title={toTitleCase(module.name)}
                            style={{ borderRadius: 10 }}
                        >
                            <Row gutter={[8, 8]}>
                                {permissions.map((perm) => (
                                    <Col span={12} key={perm.id}>
                                        <Checkbox value={`${module.id}_${perm.id}`} onChange={(e) => handlePermissionChange(module.id, perm.id, e.target.checked)}>
                                            {toTitleCase(perm.name)}
                                        </Checkbox>
                                    </Col>
                                ))}
                            </Row>
                        </Card>
                    </Col>
                ))}
            </Row>

            <div
                style={{
                    marginTop: 24,
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 10
                }}
            >
                <Button className="preview-button`" onClick={handleClose}>Cancel</Button>
                <Button className="save-perm-button" type="primary" onClick={handleSavePermissions}>Save Permissions & Invite Employee</Button>
            </div>
        </Modal>
    );
}

export default AddPermission;
