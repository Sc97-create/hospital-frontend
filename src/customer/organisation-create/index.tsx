import { useEffect, useState } from 'react'
import { Button, Col, Form, Input, Row, Select, Spin, message } from 'antd'
import {
  BankOutlined,
  EnvironmentOutlined,
  MedicineBoxOutlined,
} from '@ant-design/icons'
import { useCreateTenant, useGetTenantById, useUpdateTenant } from '../api/use-create-tenant'
import type {
  CreateTenantPayload,
  PrimaryTenantOrganisation,
  UpdateTenantPayload,
} from '../types/tenant'
import { normalizeGetTenantByIdResponse } from '../types/tenant'
import './organisation-create.css'

export type OrganisationCreateForm = {
  legalName: string
  organisationType: string
  facilityName: string
  streetAddress?: string
  address2?: string
  city?: string
  state?: string
  country?: string
  pincode?: string
}

type OrganisationCreateStepProps = {
  initialValues?: Partial<OrganisationCreateForm>
  onContinue: (values: OrganisationCreateForm) => void
}

const ORG_TYPES = [
  { value: 'hospital', label: 'Hospital' },
  { value: 'clinic', label: 'Clinic' },
  { value: 'diagnostic', label: 'Diagnostic Center' },
  { value: 'private', label: 'Private Hospital' },
  { value: 'government', label: 'Government Hospital' },
]

function FieldLabel({
  text,
  hint,
}: {
  text: string
  hint?: string
}) {
  return (
    <span className="co-field-label">
      <span>{text}</span>
      {hint ? <span className="co-field-label__hint">{hint}</span> : null}
    </span>
  )
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'data' in error.response &&
    error.response.data &&
    typeof error.response.data === 'object' &&
    'message' in error.response.data &&
    typeof error.response.data.message === 'string'
  ) {
    return error.response.data.message
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return fallback
}

function tenantResponseToForm(data: PrimaryTenantOrganisation): OrganisationCreateForm {
  const address = data.facility_address ?? {}
  return {
    legalName: data.legal_entity_name ?? '',
    organisationType: data.hospital_type || 'hospital',
    facilityName: data.facility_name ?? '',
    streetAddress: address.address1 || undefined,
    address2: address.address2 || undefined,
    city: address.city || undefined,
    state: address.state || undefined,
    country: 'India',
  }
}

function toTenantBody(values: OrganisationCreateForm): CreateTenantPayload {
  return {
    legal_entity_name: values.legalName.trim(),
    facility_name: values.facilityName.trim(),
    hospital_type: values.organisationType,
    facility_address: {
      address1: values.streetAddress?.trim() || '',
      address2: values.address2?.trim() || '',
      city: values.city?.trim() || '',
      state: values.state?.trim() || '',
    },
  }
}

export default function OrganisationCreateStep({
  initialValues,
  onContinue,
}: OrganisationCreateStepProps) {
  const [form] = Form.useForm<OrganisationCreateForm>()
  const [messageApi, contextHolder] = message.useMessage()
  const [tenantId] = useState(() => localStorage.getItem('tenant_id'))
  const [organisationId, setOrganisationId] = useState(
    () => localStorage.getItem('organisation_id'),
  )

  const { data: tenantResponse, isLoading: isLoadingTenant, isError: isTenantError, error: tenantError } =
    useGetTenantById(tenantId)

  const primaryOrg = tenantResponse
    ? normalizeGetTenantByIdResponse(tenantResponse)
    : null

  const { mutate: createTenant, isPending: isCreating } = useCreateTenant()
  const { mutate: updateTenant, isPending: isUpdating } = useUpdateTenant()
  const isPending = isCreating || isUpdating

  /** Only update after getById returned a primary organisation. */
  const shouldUpdateExisting = Boolean(primaryOrg?.organisation_id && primaryOrg?.tenant_id)

  useEffect(() => {
    if (!primaryOrg) return

    localStorage.setItem('organisation_id', primaryOrg.organisation_id)
    localStorage.setItem('tenant_id', primaryOrg.tenant_id)
    setOrganisationId(primaryOrg.organisation_id)

    form.setFieldsValue(tenantResponseToForm(primaryOrg))
  }, [primaryOrg, form])

  useEffect(() => {
    if (isTenantError && tenantId) {
      messageApi.error(
        getApiErrorMessage(tenantError, 'Could not load organisation details. You can still edit and save.'),
      )
    }
  }, [isTenantError, tenantError, tenantId, messageApi])

  const submitTenant = (values: OrganisationCreateForm) => {
    const body = toTenantBody(values)

    if (shouldUpdateExisting && primaryOrg) {
      const payload: UpdateTenantPayload = {
        tenant_id: primaryOrg.tenant_id,
        organisation_id: primaryOrg.organisation_id,
        ...body,
        registration_no: primaryOrg.registration_no ?? '',
        license_number: primaryOrg.license_number ?? '',
        gstin: primaryOrg.gstin ?? '',
      }

      updateTenant(payload, {
        onSuccess: (data) => {
          if (data.tenant_id) {
            localStorage.setItem('tenant_id', String(data.tenant_id))
          }
          if (data.organisation_id) {
            localStorage.setItem('organisation_id', String(data.organisation_id))
            setOrganisationId(String(data.organisation_id))
          }
          messageApi.success(data.message || 'Organisation updated successfully')
          onContinue(values)
        },
        onError: (error) => {
          messageApi.error(getApiErrorMessage(error, 'Failed to update organisation. Please try again.'))
        },
      })
      return
    }

    createTenant(body, {
      onSuccess: (data) => {
        if (data.tenant_id) {
          localStorage.setItem('tenant_id', String(data.tenant_id))
        }
        if (data.organisation_id) {
          localStorage.setItem('organisation_id', String(data.organisation_id))
          setOrganisationId(String(data.organisation_id))
        }
        messageApi.success(data.message || 'Organisation created successfully')
        onContinue(values)
      },
      onError: (error) => {
        messageApi.error(getApiErrorMessage(error, 'Failed to create organisation. Please try again.'))
      },
    })
  }

  const submitRequiredOnly = async () => {
    try {
      const values = await form.validateFields(['legalName', 'organisationType', 'facilityName'])
      submitTenant({
        ...form.getFieldsValue(true),
        ...values,
        streetAddress: undefined,
        address2: undefined,
        city: undefined,
        state: undefined,
        country: undefined,
        pincode: undefined,
      })
    } catch {
      // validation messages shown by Form
    }
  }

  const isEditMode = shouldUpdateExisting

  return (
    <div className="co-org">
      {contextHolder}
      <div className="co-org__header">
        <h1 className="co-org__title">
          {isEditMode ? 'Review organisation details' : 'Let’s set up the organisation'}
        </h1>
        <p className="co-org__subtitle">
          {isEditMode
            ? 'Update the organisation details below, then continue.'
            : 'Tell us a little about the organisation so we can get Floato ready.'}
        </p>
      </div>

      {isLoadingTenant ? (
        <div className="co-org__loading">
          <Spin tip="Loading organisation…" />
        </div>
      ) : (
        <>
          <Form
            form={form}
            name="customer-organisation-create"
            layout="vertical"
            className="co-org-form"
            requiredMark={false}
            initialValues={{
              organisationType: 'hospital',
              country: 'India',
              ...initialValues,
            }}
            onFinish={submitTenant}
            autoComplete="on"
            disabled={isPending}
          >
            <Form.Item
              label={<FieldLabel text="Legal / Organisation Name" hint="Required" />}
              name="legalName"
              rules={[{ required: true, message: 'Please enter the organisation name' }]}
              extra="The legal or business name of the organisation."
            >
              <Input
                prefix={<BankOutlined />}
                placeholder="e.g. Sachin Healthcare Pvt Ltd"
                allowClear
                size="large"
              />
            </Form.Item>

            <Form.Item
              label={<FieldLabel text="Organisation Type" hint="Select one" />}
              name="organisationType"
              rules={[{ required: true, message: 'Please select an organisation type' }]}
            >
              <Select
                size="large"
                options={ORG_TYPES}
                prefix={<MedicineBoxOutlined />}
              />
            </Form.Item>

            <Form.Item
              label={<FieldLabel text="Facility Name" hint="Required" />}
              name="facilityName"
              rules={[{ required: true, message: 'Please enter the facility name' }]}
              extra="The name patients know the facility by."
            >
              <Input
                prefix={<BankOutlined />}
                placeholder="e.g. Sachin Hospital"
                allowClear
                size="large"
              />
            </Form.Item>

            <div className="co-org__section">
              <p className="co-org__section-title">Facility Address</p>

              <Form.Item name="streetAddress" className="co-org__tight-item">
                <Input
                  prefix={<EnvironmentOutlined />}
                  placeholder="Street address or building"
                  allowClear
                  size="large"
                />
              </Form.Item>

              <Form.Item name="address2" className="co-org__tight-item">
                <Input placeholder="Address line 2 (optional)" allowClear size="large" />
              </Form.Item>

              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item name="city" className="co-org__tight-item">
                    <Input placeholder="e.g. Bengaluru" allowClear size="large" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="state" className="co-org__tight-item">
                    <Input placeholder="e.g. Karnataka" allowClear size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item name="country" className="co-org__tight-item">
                    <Input placeholder="Country" allowClear size="large" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="pincode" className="co-org__tight-item">
                    <Input placeholder="Pincode" allowClear size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <p className="co-org__section-note">Address details can also be updated anytime later.</p>
            </div>

            <Form.Item className="co-org__submit-item">
              <Button
                htmlType="submit"
                type="primary"
                className="co-org__submit"
                block
                size="large"
                loading={isPending}
              >
                Continue →
              </Button>
            </Form.Item>
          </Form>

          {!isEditMode ? (
            <button
              type="button"
              className="co-org__skip"
              onClick={submitRequiredOnly}
              disabled={isPending}
            >
              Skip optional address fields for now
            </button>
          ) : null}
        </>
      )}
    </div>
  )
}
