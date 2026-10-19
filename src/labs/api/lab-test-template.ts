import apiClient from "../../lib/api-client";
import type {
    CreateLabTestTemplatePayload,
    CreateLabTestTemplateResponse,
    GetLabTestTemplateDefaultsResponse,
    LabTestTemplateDefault,
    LabTestTemplateSaved,
} from "../types/lab-test-template";

export const ListLabTestTemplateDefaults = async (
    organisationId: string,
): Promise<{
    code: number | string;
    defaults: LabTestTemplateDefault[];
    defaults_count: number;
    templates: LabTestTemplateSaved[];
    templates_count: number;
}> => {
    const response = await apiClient.get<GetLabTestTemplateDefaultsResponse>(
        "/lab-test-templates/defaults",
        {
            params: {
                organisation_id: organisationId,
            },
        },
    );

    const body = response.data;
    const defaults = Array.isArray(body.defaults)
        ? body.defaults
        : Array.isArray(body.data)
          ? body.data
          : [];
    const templates = Array.isArray(body.templates) ? body.templates : [];

    return {
        code: body.code,
        defaults,
        defaults_count: body.defaults_count ?? defaults.length,
        templates,
        templates_count: body.templates_count ?? templates.length,
    };
};

export const CreateLabTestTemplate = async (
    payload: CreateLabTestTemplatePayload,
): Promise<CreateLabTestTemplateResponse> => {
    const response = await apiClient.post<CreateLabTestTemplateResponse>(
        "/lab-test-templates/create",
        payload,
    );
    return response.data;
};
