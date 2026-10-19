export type LabTestTemplateType = "blood_test" | "urine_test" | string;

export interface LabTestTemplateDefault {
    test_code: string;
    test_name: string;
    specimens: string[];
    type: LabTestTemplateType;
    tat_minutes: number;
    description?: string;
}

export interface LabTestTemplateSaved {
    id: string;
    name: string;
    description: string;
    tests: LabTestTemplateDefault[];
    tests_count: number;
    status: string;
    organisation_id: string;
    created_by: string;
    created_at: string;
    updated_at: string;
}

export interface GetLabTestTemplateDefaultsResponse {
    code: number | string;
    defaults?: LabTestTemplateDefault[];
    defaults_count?: number;
    templates?: LabTestTemplateSaved[];
    templates_count?: number;
    /** Legacy shape fallback */
    count?: number;
    data?: LabTestTemplateDefault[];
}

export interface CreateLabTestTemplateTestItem {
    test_code: string;
    test_name: string;
    specimens: string[];
    type: LabTestTemplateType;
    tat_minutes: number;
    description?: string;
}

export interface CreateLabTestTemplatePayload {
    organisation_id: string;
    created_by: string;
    name: string;
    description: string;
    tests: CreateLabTestTemplateTestItem[];
}

export interface CreateLabTestTemplateResponse {
    code: number | string;
    message?: string;
    data?: {
        id?: string;
        template_id?: string;
    };
    id?: string;
    template_id?: string;
}
