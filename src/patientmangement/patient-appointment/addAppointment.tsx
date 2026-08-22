import React, { useEffect, useState } from "react";
import dayjs from "dayjs"
import {
  Breadcrumb,
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  Form,
  Input,
  Layout,
  message,
  Modal,
  Row,
  Select,
  Space,
  type SelectProps,
} from "antd";
import {
  CalendarOutlined,
  HomeOutlined,
  UserOutlined,
} from "@ant-design/icons";

import "./addAppointment.css";
import { Content } from "antd/es/layout/layout";
import { Link, useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../sidebar";
import type { appointmentPayload, slots } from "../types/appointments";
import { CreateAppointment, GetSlots } from "../api/appointments";
import { GetDoctors } from "../../shared/api/shared-api";


interface doctors {
  id: string,
  username: string

}

const AddAppointment: React.FC = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<SelectProps["options"]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<slots | null>(null);
  const [openSlotModal, setOpenSlotModal] = useState(false);
  const [slots, addSlots] = useState<slots[] | null>()
  const [form] = Form.useForm();
  //const visibleSlots = slots?.slice(0, 5) ?? [];
  //const remainingSlots = slots?.slice(5) ?? []
  const { patientID } = useParams<{ patientID: string }>();
  const organisation_id = localStorage.getItem("organisation_id") || "";
  const orderedSlots = React.useMemo(() => {
    if (!selectedSlot) {
      return slots ?? [];
    }

    return [
      selectedSlot,
      ...(slots ?? []).filter(
        slot =>
          slot.start_time !== selectedSlot.start_time ||
          slot.end_time !== selectedSlot.end_time
      ),
    ];
  }, [slots, selectedSlot]);
  const visibleSlots = orderedSlots.slice(0, 5);
  const remainingSlots = orderedSlots.slice(5);
  const selectedDoctor = Form.useWatch("doctor_id", form);
  const getAllSlots = async (doctorId: string, date: string) => {
    try {
      const response = await GetSlots(organisation_id, doctorId, date);
      addSlots(response.appointment_slots);
      console.log(slots)
    } catch (err) {
      console.log(err)
    }

  }
  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (!date) {
      addSlots([]);
      form.setFieldValue("slot_id", undefined);
      return;
    }
    const doctorId = form.getFieldValue("doctor_id");
    if (doctorId) {
      getAllSlots(doctorId, date.format("YYYY-MM-DD"));
    }
  };
  const formatSlotTime = (time: string) =>
    new Date(time).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).toUpperCase();
  const getDoctors = async (search: string) => {
    try {
      setLoading(true);

      const response = await GetDoctors(search, organisation_id);
      console.log(response)

      const options = response.data.map((doctor: doctors) => ({
        value: doctor.id,
        label: doctor.username,
      }));

      setDoctors(options);

    } catch (error) {
      console.error(error);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!slots?.length) {
      setSelectedSlot(null);
      return;
    }

    const firstAvailableSlot = slots.find(slot => slot.allow);

    if (firstAvailableSlot) {
      setSelectedSlot(firstAvailableSlot);
    }
  }, [slots]);

  const createAppointment = async (values: appointmentPayload) => {
    if (!selectedSlot) {
      console.log("slot not selected")
    }
    console.log("days", values.daysjs_appointment_date)
    const payload: appointmentPayload = {
      start_time: selectedSlot?.start_time ?? "",
      end_time: selectedSlot?.end_time ?? "",
      appointment_date: values.daysjs_appointment_date.format("YYYY-MM-DD"),
      doctor_id: values.doctor_id,
      patient_id: patientID ? patientID : "",
      visit_type: values.visit_type,
      organisation_id: organisation_id,
      user_id: localStorage.getItem("user_id") || "",
      daysjs_appointment_date: values.daysjs_appointment_date

    }
    try {
      const resp = await CreateAppointment(payload)
      message.success("Appointment created successfully");

      navigate("/appointments")
      console.log(resp)
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <Layout>
      <Sidebar />
      <Content>
        <Breadcrumb className="appointment-breadcrumb-layout">
          <Breadcrumb.Item>
            <HomeOutlined />
            <Link to="/dashboard">Home</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <UserOutlined />
            <Link to={`/patients/patient-overview/${patientID}`}>Patient Overview</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <CalendarOutlined />
            <Link to="/appointments">Appointments</Link>
          </Breadcrumb.Item>
        </Breadcrumb>
        <div className="appointment-wrapper">
          <Card className="appointment-card">
            <div className="appointment-header">
              <h1>Book Appointment</h1>
              <p>Complete the form below to schedule your visit.</p>
            </div>

            <Form layout="vertical" form={form} onFinish={createAppointment}>
              <Row gutter={[24, 24]}>
                <Col xs={24}>
                  <Form.Item
                    label="Doctor"
                    name="doctor_id"
                    rules={[
                      {
                        required: true,
                        message: "Please select a doctor",
                      },
                    ]}
                  >
                    <Select
                      showSearch
                      size="large"
                      placeholder="Search doctor"
                      filterOption={false}
                      loading={loading}
                      options={doctors}
                      onOpenChange={(open) => {
                        if (open) {
                          getDoctors("");
                        }
                      }}
                      onSearch={getDoctors}
                      allowClear
                    />
                  </Form.Item>
                </Col>

                <Col xs={24}>
                  <Form.Item
                    label="Appointment Date"
                    name="daysjs_appointment_date"
                    required
                  >
                    <DatePicker
                      disabled={!selectedDoctor}
                      size="large"
                      className="full-width"
                      format="DD-MM-YYYY"
                      placeholder="dd-mm-yyyy"
                      suffixIcon={<CalendarOutlined />}
                      disabledDate={(current) =>
                        current && current.isBefore(dayjs().startOf("day"))
                      }
                      onChange={handleDateChange}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24}>
                  <Form.Item label="Time Slot" name="time_slot" required>
                    {!slots?.length ? (
                      <div
                        style={{
                          padding: "24px 0",
                          border: "1px dashed #d9d9d9",
                          borderRadius: 8,
                        }}
                      >
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description="No available slots"
                        />
                      </div>
                    ) : (
                      <div className="time-slot-grid">
                        {visibleSlots.map((slot) => (
                          <Button
                            key={`${slot.start_time}-${slot.end_time}`}
                            disabled={!slot.allow}
                            type={
                              selectedSlot?.start_time === slot.start_time
                                ? "primary"
                                : "default"
                            }
                            onClick={() => setSelectedSlot(slot)}
                          >
                            {formatSlotTime(slot.start_time)}
                          </Button>
                        ))}

                        {remainingSlots.length > 0 && (
                          <Button
                            className="slot-btn more-btn"
                            onClick={() => setOpenSlotModal(true)}
                          >
                            +{remainingSlots.length} More
                          </Button>
                        )}
                      </div>
                    )}
                  </Form.Item>
                </Col>

                <Col xs={24}>
                  <Form.Item
                    label="Visit Type"
                    name="visit_type"
                    rules={[
                      {
                        required: true,
                        message: "Please select a visit type",
                      },
                    ]}
                  >
                    <Select
                      size="large"
                      placeholder="Select visit type"
                      options={[
                        {
                          label: "New Patient",
                          value: "new_patient",
                        },
                        // {
                        //   label: "Follow Up",
                        //   value: "follow_up",
                        // },
                        {
                          label: "OPD",
                          value: "opd",
                        },
                      ]}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24}>
                  <Form.Item label="Notes (Optional)" name="notes">
                    <Input.TextArea
                      rows={3}
                      placeholder="Requested evening slot"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <div className="appointment-footer">
                <div className="footer-left">
                  <span className="secure-dot" />
                  Secured Appointment System
                </div>

                <Space>
                  <Button>Cancel</Button>

                  <Button type="primary" htmlType="submit">
                    Book Appointment
                  </Button>
                </Space>
              </div>
            </Form>
            <Modal
              title="Available Time Slots"
              open={openSlotModal}
              footer={null}
              onCancel={() => setOpenSlotModal(false)}
              width={600}
            >
              <div className="modal-slot-grid">
                {remainingSlots.map((slot) => (
                  <Button
                    key={`${slot.start_time}-${slot.end_time}`}
                    disabled={!slot.allow}
                    type={
                      selectedSlot?.start_time === slot.start_time
                        ? "primary"
                        : "default"
                    }
                    onClick={() => {
                      setSelectedSlot(slot);
                      setOpenSlotModal(false);
                    }}
                  >
                    {formatSlotTime(slot.start_time)} - {formatSlotTime(slot.end_time)}
                  </Button>
                ))}
              </div>
            </Modal>
          </Card>
        </div>

      </Content>
    </Layout>

  );
};

export default AddAppointment;