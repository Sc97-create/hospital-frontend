import apiClient from "../lib/api-client";

/** GET /api/v1/central/organisation/getorganisationDetailsByUserId/:user_id */
export type OrganisationDetailsByUserId = {
  id: string;
  tenant_id: string;
  is_primary: boolean;
  legal_entity_name: string;
  organisation_type: string;
  facility_name: string;
  registration_no?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
};

export type GetOrganisationDetailsByUserIdResponse = {
  data: OrganisationDetailsByUserId;
  code: number | string;
};

export type GetOrganisationDetailsByUserIdError = {
  error: string;
  code: number | string;
};

export function organisationDisplayName(
  organisation: Pick<OrganisationDetailsByUserId, "facility_name" | "legal_entity_name">,
): string {
  const facility = organisation.facility_name?.trim();
  if (facility) return facility;
  return organisation.legal_entity_name?.trim() || "";
}

export const GetOrganisationDetailsByUserId = async (
  userId: string,
): Promise<GetOrganisationDetailsByUserIdResponse> => {
  const response = await apiClient.get<GetOrganisationDetailsByUserIdResponse>(
    `/central/organisation/getorganisationDetailsByUserId/${userId}`,
  );
  return response.data;
};
