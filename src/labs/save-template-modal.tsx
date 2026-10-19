import { Button, Input, Modal, Pagination } from "antd";
import {
    BookOutlined,
    CloseOutlined,
    DeleteOutlined,
    ExperimentOutlined,
} from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import { StatusTag } from "../components/status-tag";
import { STATUS_INFO, STATUS_SUCCESS } from "../constants/status-colors";
import "./save-template-modal.css";

export type SaveTemplateTest = {
    id: string;
    name: string;
    code: string;
    specimen: string;
    tat: string;
};

type SaveTemplateModalProps = {
    open: boolean;
    defaultName?: string;
    selectedTests: SaveTemplateTest[];
    saving?: boolean;
    onCancel: () => void;
    onSave: (payload: {
        name: string;
        tags: string[];
        testIds: string[];
    }) => void;
};

const TEMPLATE_TAGS = ["Endocrinology", "General", "Routine", "Cardiology"];
const PAGE_SIZE = 5;

function SaveTemplateModal({
    open,
    defaultName = "",
    selectedTests,
    saving = false,
    onCancel,
    onSave,
}: SaveTemplateModalProps) {
    const [templateName, setTemplateName] = useState(defaultName);
    const [selectedTags, setSelectedTags] = useState<string[]>(["Cardiology"]);
    const [includedTests, setIncludedTests] = useState<SaveTemplateTest[]>([]);
    const [page, setPage] = useState(1);

    useEffect(() => {
        if (!open) return;
        setTemplateName(defaultName);
        setSelectedTags(["Cardiology"]);
        setIncludedTests(selectedTests);
        setPage(1);
    }, [open, defaultName, selectedTests]);

    const total = includedTests.length;
    const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
    const rangeEnd = Math.min(page * PAGE_SIZE, total);
    const pageTests = useMemo(
        () => includedTests.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
        [includedTests, page],
    );

    const toggleTag = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
        );
    };

    const removeTest = (id: string) => {
        setIncludedTests((prev) => {
            const next = prev.filter((test) => test.id !== id);
            const maxPage = Math.max(1, Math.ceil(next.length / PAGE_SIZE));
            if (page > maxPage) setPage(maxPage);
            return next;
        });
    };

    const handleSave = () => {
        const name = templateName.trim();
        if (!name || !includedTests.length) return;
        onSave({
            name,
            tags: selectedTags,
            testIds: includedTests.map((test) => test.id),
        });
    };

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            footer={null}
            closable={false}
            maskClosable={!saving}
            width={720}
            centered
            className="save-template-modal"
            destroyOnClose
        >
            <div className="save-template-modal-inner">
                <div className="save-template-header">
                    <div className="save-template-header-main">
                        <div className="save-template-icon">
                            <BookOutlined />
                        </div>
                        <div>
                            <h3>Save as Clinical Template</h3>
                            <p>Save these tests as a template for quick order shortcut for your clinic</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="save-template-close"
                        onClick={onCancel}
                        disabled={saving}
                        aria-label="Close"
                    >
                        <CloseOutlined />
                    </button>
                </div>

                <div className="save-template-body">
                    <div className="save-template-field">
                        <div className="save-template-label-row">
                            <label htmlFor="template-name">
                                Template Name <span className="required">*</span>
                            </label>
                            <span className="save-template-hint">e.g. Senior Health Screen</span>
                        </div>
                        <Input
                            id="template-name"
                            className="save-template-input"
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            placeholder="Diabetes Follow-up Custom"
                        />
                        <p className="save-template-helper">
                            E.g., Senior Health Screen, Hypertension Panel, Diabetes Follow-up
                        </p>
                    </div>

                    <div className="save-template-field">
                        <label>Category / Tag Selection</label>
                        <div className="save-template-tags">
                            {TEMPLATE_TAGS.map((tag) => {
                                const active = selectedTags.includes(tag);
                                return (
                                    <button
                                        key={tag}
                                        type="button"
                                        className={`save-template-tag${active ? " is-active" : ""}`}
                                        onClick={() => toggleTag(tag)}
                                    >
                                        {tag}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="save-template-tests-header">
                        <h4>Included Tests ({total} Selected)</h4>
                        <StatusTag type={STATUS_SUCCESS} bordered>
                            {total} tests included
                        </StatusTag>
                    </div>

                    <div className="save-template-tests-list">
                        {pageTests.length === 0 ? (
                            <div className="save-template-empty">No tests selected</div>
                        ) : (
                            pageTests.map((test) => (
                                <div key={test.id} className="save-template-test-row">
                                    <div className="save-template-test-icon">
                                        <ExperimentOutlined />
                                    </div>
                                    <div className="save-template-test-info">
                                        <span className="save-template-test-name">{test.name}</span>
                                        <span className="save-template-test-meta">
                                            {test.code} · {test.specimen}
                                        </span>
                                    </div>
                                    <StatusTag type={STATUS_INFO} className="code-badge">
                                        {test.tat}
                                    </StatusTag>
                                    <button
                                        type="button"
                                        className="save-template-remove"
                                        onClick={() => removeTest(test.id)}
                                        aria-label={`Remove ${test.name}`}
                                    >
                                        <DeleteOutlined />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="save-template-tests-footer">
                        <span>
                            {total === 0
                                ? "No tests"
                                : `Showing ${rangeStart}-${rangeEnd} of ${total} tests`}
                        </span>
                        <Pagination
                            current={page}
                            total={total}
                            pageSize={PAGE_SIZE}
                            onChange={setPage}
                            showSizeChanger={false}
                            size="small"
                        />
                    </div>
                </div>

                <div className="save-template-footer">
                    <Button type="text" disabled={saving} onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        icon={<BookOutlined />}
                        loading={saving}
                        disabled={saving || !templateName.trim() || includedTests.length === 0}
                        onClick={handleSave}
                    >
                        Save Template
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

export default SaveTemplateModal;
