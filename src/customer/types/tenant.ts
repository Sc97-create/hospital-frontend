export type TenantFacilityAddress = {
  address1: string
  address2: string
  city: string
  state: string
}

export type CreateTenantPayload = {
  legal_entity_name: string
  facility_name: string
  hospital_type: string
  facility_address: TenantFacilityAddress
}

export type CreateTenantResponse = {
  message?: string
  tenant_id?: string
  organisation_id?: string
  [key: string]: unknown
}

export type TenantRecord = {
  id?: string
  name?: string
  status?: string
  created_at?: string
  updated_at?: string
}

export type TenantOrganisationRecord = {
  id?: string
  tenant_id?: string
  is_primary?: boolean
  legal_entity_name?: string
  organisation_type?: string
  hospital_type?: string
  facility_name?: string
  address?: Partial<TenantFacilityAddress>
  facility_address?: Partial<TenantFacilityAddress>
  registration_no?: string
  license_number?: string
  gstin?: string
  status?: string
}

/** GET /central/tenant/getById/:tenant_id */
export type GetTenantByIdResponse = {
  message?: string
  data?: {
    tenant?: TenantRecord
    organisation?: TenantOrganisationRecord
    organisations?: TenantOrganisationRecord[]
  }
  /** Flat shape fallback (older responses) */
  organisation_id?: string
  legal_entity_name?: string
  facility_name?: string
  hospital_type?: string
  facility_address?: Partial<TenantFacilityAddress>
  registration_no?: string
  license_number?: string
  gstin?: string
  status?: string
  tenant_status?: string
  tenant_id?: string
}

/** Normalized view used by the organisation form */
export type PrimaryTenantOrganisation = {
  tenant_id: string
  organisation_id: string
  legal_entity_name: string
  hospital_type: string
  facility_name: string
  facility_address: Partial<TenantFacilityAddress>
  registration_no?: string
  license_number?: string
  gstin?: string
  status?: string
  tenant_status?: string
}

/** PATCH /central/tenant/update */
export type UpdateTenantPayload = {
  tenant_id: string
  organisation_id: string
  legal_entity_name: string
  facility_name: string
  hospital_type: string
  facility_address: TenantFacilityAddress
  registration_no?: string
  license_number?: string
  gstin?: string
}

export type UpdateTenantResponse = {
  message?: string
  tenant_id?: string
  organisation_id?: string
  [key: string]: unknown
}

function pickPrimaryOrganisation(
  data: GetTenantByIdResponse['data'],
): TenantOrganisationRecord | undefined {
  if (!data) return undefined
  if (data.organisation) return data.organisation
  if (Array.isArray(data.organisations) && data.organisations.length > 0) {
    return (
      data.organisations.find((org) => org.is_primary) ?? data.organisations[0]
    )
  }
  return undefined
}

/** Map getById API payload (nested or flat) into form-ready fields. */
export function normalizeGetTenantByIdResponse(
  response: GetTenantByIdResponse,
): PrimaryTenantOrganisation | null {
  const nestedOrg = pickPrimaryOrganisation(response.data)
  const nestedTenant = response.data?.tenant

  if (nestedOrg || nestedTenant) {
    const address = nestedOrg?.address ?? nestedOrg?.facility_address ?? {}
    const tenantId = nestedTenant?.id || nestedOrg?.tenant_id || ''
    const organisationId = nestedOrg?.id || ''
    if (!tenantId || !organisationId) return null

    return {
      tenant_id: tenantId,
      organisation_id: organisationId,
      legal_entity_name: nestedOrg?.legal_entity_name ?? nestedTenant?.name ?? '',
      hospital_type:
        nestedOrg?.organisation_type || nestedOrg?.hospital_type || 'hospital',
      facility_name: nestedOrg?.facility_name ?? '',
      facility_address: address,
      registration_no: nestedOrg?.registration_no,
      license_number: nestedOrg?.license_number,
      gstin: nestedOrg?.gstin,
      status: nestedOrg?.status,
      tenant_status: nestedTenant?.status,
    }
  }

  if (response.organisation_id && (response.tenant_id || response.organisation_id)) {
    return {
      tenant_id: response.tenant_id || '',
      organisation_id: response.organisation_id,
      legal_entity_name: response.legal_entity_name ?? '',
      hospital_type: response.hospital_type || 'hospital',
      facility_name: response.facility_name ?? '',
      facility_address: response.facility_address ?? {},
      registration_no: response.registration_no,
      license_number: response.license_number,
      gstin: response.gstin,
      status: response.status,
      tenant_status: response.tenant_status,
    }
  }

  return null
}
