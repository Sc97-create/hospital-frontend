import { Card, Col, Descriptions, Flex, Row, Tag, Modal, Button } from "antd"
import './general-info.css'
import { useState } from "react";

function GeneralInfo() {
    const tagList = ['magenta', 'red', 'volcano', 'orange', 'gold', 'smooth', 'aryan', 'aryan', 'aryan', 'aryan', 'aryan', 'aryan', 'aryan', 'aryan'];
    const [isModalOpen, setIsModalOpen] = useState(false);
    const handleCancel = () => {
        setIsModalOpen(false);
    };
    const visibleTags = tagList.slice(0, 5);
    const hiddenTags = tagList.slice(5);
    return (
        <>
            <div className="info-layout">
                <Row className="general-info-layout" gutter={[4, 8]} wrap={false}>
                    <Col span={8}>
                        <Card className="basic-info">
                            <div className="detail-layout">
                                <h3>Basic Details</h3>
                            </div>
                            <div className="description-layout">
                                <Descriptions layout="horizontal" column={1} size="small" labelStyle={{ width: 100, minWidth: 100, color: '#6B7280', fontWeight: 600, fontSize: 12 }}>
                                    <Descriptions.Item label='Name'>
                                        <span className="desc-value">Sachin</span>
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Age'>
                                        <span className="desc-value">29</span>
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Weight'>
                                        <span className="desc-value">69</span>
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Gender'>
                                        <span className="desc-value">Female</span>
                                    </Descriptions.Item>
                                </Descriptions>
                            </div>
                            <div className="detail-layout">
                                <h3>Contact Details</h3>
                            </div>
                            <div className="description-layout">
                                <Descriptions layout="horizontal" column={1} size="small" labelStyle={{ width: 100, minWidth: 100, color: '#6B7280', fontWeight: 600, fontSize: 12 }}>
                                    <Descriptions.Item label='Place'>
                                        <span className="desc-value">Belagavi</span>
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Phone No'>
                                        <span className="desc-value">9538776586</span>
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Email-ID'>
                                        <span className="desc-value">sachinchate34@gmail.com</span>
                                    </Descriptions.Item>
                                </Descriptions>
                            </div>
                            <div className="detail-layout">
                                <h3>Symptoms</h3>
                            </div>
                            <div className="tag-list">
                                <Flex gap="8px 0" wrap>
                                    {visibleTags.map(tag => (
                                        <Tag key={tag} className="custom-tag" closable>
                                            {tag}
                                        </Tag>
                                    ))}
                                    {hiddenTags.length > 0 && (
                                        <Button
                                            size="small"
                                            onClick={() => setIsModalOpen(true)}
                                            className="more-button-layout"
                                        >
                                            more
                                        </Button>
                                    )}
                                </Flex>
                                <Modal
                                    title="Symptoms List"
                                    closable
                                    open={isModalOpen}
                                    onCancel={handleCancel}
                                    footer={null}

                                >
                                    <Flex gap="8px 0" wrap>
                                        {tagList.map(tag => (
                                            <Tag key={tag} className="custom-tag">
                                                {tag}
                                            </Tag>
                                        ))}
                                    </Flex>

                                </Modal>

                            </div>
                            <div className="detail-layout">
                                <h3>Active Conditions</h3>
                            </div>
                            <div className="tag-list">
                                <Flex gap="8px 0" wrap>
                                    {visibleTags.map(tag => (
                                        <Tag key={tag} className="custom-tag" closable>
                                            {tag}
                                        </Tag>
                                    ))}
                                    {hiddenTags.length > 0 && (
                                        <Button
                                            size="small"
                                            onClick={() => setIsModalOpen(true)}
                                            className="more-button-layout"
                                        >
                                            more
                                        </Button>
                                    )}
                                </Flex>
                                <Modal
                                    title="Symptoms List"
                                    closable
                                    open={isModalOpen}
                                    onCancel={handleCancel}
                                    footer={null}

                                >
                                    <Flex gap="8px 0" wrap>
                                        {tagList.map(tag => (
                                            <Tag key={tag} className="custom-tag">
                                                {tag}
                                            </Tag>
                                        ))}
                                    </Flex>

                                </Modal>

                            </div>
                        </Card>
                    </Col>
                    <Col span={12}>
                        <div className="chart-card-layout">
                            <Card className="bp-chart-layout">
                                <h3>Bp Insights</h3>

                            </Card>
                            <Card className="bp-chart-layout">
                                <h3>Thyroid Insights</h3>
                            </Card>
                        </div>
                    </Col>
                    <Col span={4}>
                        <div className="mini-chart-layout">
                            <Card className="bp-chart-layout">
                                <h3>Thyroid Insights</h3>
                            </Card>
                            <Card className="bp-chart-layout">
                                <h3>Lipid Profile</h3>
                            </Card>
                        </div>
                    </Col>
                </Row>
            </div>
            
        </>
    )
}
export default GeneralInfo