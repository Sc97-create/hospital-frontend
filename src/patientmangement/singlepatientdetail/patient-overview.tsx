import { Card, Col, Row, Tag } from "antd";
import type { patientlist } from "../types/patients";

interface Props {
    patient: patientlist | null;
}

function PatientOverview({ patient }: Props) {
    return (
        <>
            <Row gutter={[16, 16]}>
                {/* Basic Info */}
                <Col span={8}>
                    <Card className="overview-card">
                        <div className="card-title">
                            <h3>Basic Info</h3>
                            <span className="edit-link">Edit</span>
                        </div>

                        <div className="info-grid">
                            {/* <div>
                                <label>DOB</label>
                                <p>15 May 1989</p>
                            </div> */}

                            <div>
                                <label>Gender</label>
                                <p>{patient?.patient_gender ?? 'Male'}</p>
                            </div>

                            <div>
                                <label>Weight</label>
                                <p>{patient?.patient_weight ?? '72'} kg</p>
                            </div>

                            <div>
                                <label>Blood Group</label>
                                <p>{patient?.patient_bg ?? 'O+ Positive'}</p>
                            </div>
                        </div>
                    </Card>
                </Col>

                {/* Contact */}
                <Col span={8}>
                    <Card className="overview-card">
                        <div className="card-title">
                            <h3>Contact</h3>
                        </div>

                        <div className="contact-layout">
                            <div className="contact-item">
                                <label>Phone</label>
                                <p>{patient?.patient_phone ?? '+91 98765 43210'}</p>
                            </div>

                            <div className="contact-item">
                                <label>Email</label>
                                <p>{patient?.patient_email ?? 'rajesh@example.com'}</p>
                            </div>

                            <div className="contact-item">
                                <label>Address</label>
                                <p>
                                   {patient?.patient_address ?? '123, MG Road, Bengaluru, Karnataka, India'}
                                </p>
                            </div>
                        </div>
                    </Card>
                </Col>

                {/* Medical Snapshot */}
                <Col span={8}>
                    <Card className="overview-card">
                        <div className="card-title">
                            <h3>Medical Snapshot</h3>
                        </div>

                        <div className="medical-layout">
                            <div className="medical-item">
                                <label>Allergies</label>

                                <div className="medical-tags">
                                    <Tag color="red">Penicillin</Tag>
                                    <Tag color="volcano">Peanuts</Tag>
                                </div>
                            </div>

                            <div className="medical-item">
                                <label>Chronic Conditions</label>
                                <p>Hypertension (Diagnosed 2021)</p>
                            </div>

                            <div className="medical-item">
                                <label>Current Medications</label>
                                <p>Telmisartan 40mg (OD), Multivitamins</p>
                            </div>

                            <div className="medical-item">
                                <label>Past Surgeries</label>
                                <p>Appendectomy (2015)</p>
                            </div>
                        </div>
                    </Card>
                </Col>

                {/* Insurance */}

            </Row>
        </>
    )
}
export default PatientOverview