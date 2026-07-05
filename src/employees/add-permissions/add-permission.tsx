import { Modal, Card, Checkbox, Row, Col, Button, Spin } from "antd";
import './add-permission.css'
import { GetPermissions } from "../api/add-permissions";
import { useEffect, useState } from "react";


interface AddPermissionProps {
    open: boolean;
    onClose: () => void;
}


function AddPermission({ open, onClose }: AddPermissionProps) {
    const [selectedPermissions, setSelectedPermissions] = useState<any[]>([]);
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
    const [permissions, setPermissions] = useState<any[]>([]);
    const [modules, SetModules] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const fetchPermissions = async () => {
        setLoading(true)
        const data = await GetPermissions();
        SetModules(data["modules"])
        setPermissions(data["permissions"])
        setLoading(false)
    }
    const handleClose = () => {
        setSelectedPermissions([]);
        setPermissions([]);
        SetModules([]);
        onClose();
    };
    const handleSelectAll = (moduleId: string, checked: boolean) => {
        setSelectedPermissions((prev) => {
            const filtered = prev.filter(
                (p) => String(p.module_id) !== String(moduleId)
            );

            if (!checked) return filtered;

            const allPerms = permissions.map((perm) => ({
                module_id: String(moduleId),
                permission_id: String(perm.id)
            }));

            return [...filtered, ...allPerms];
        });
    };
    const isAllSelected = (moduleId: string) => {
        if (permissions.length === 0) return false;

        return permissions.every((perm) =>
            selectedPermissions.some(
                (p) =>
                    String(p.module_id) === String(moduleId) &&
                    String(p.permission_id) === String(perm.id)
            )
        );
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
                ) : modules.map((module: any) => (
                    <Col span={12} key={module.id}>
                        <Card
                            size="small"
                            title={toTitleCase(module.name)}
                            //extra={<Checkbox onChange={(e) => handleSelectAll(module.id, e.target.checked)}>Select All</Checkbox>}
                            style={{ borderRadius: 10 }}
                        >
                            <Row gutter={[8, 8]}>
                                {permissions.map((perm: any) => (
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