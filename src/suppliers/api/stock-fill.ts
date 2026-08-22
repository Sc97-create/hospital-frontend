import apiClient from "../../lib/api-client";
import type { AddMedicinePayload, AddMedicineResponse } from "../types/stock-fill";

/** POST /api/v1/medicine/addMedicine */
export const AddMedicine = async (
    payload: AddMedicinePayload,
): Promise<AddMedicineResponse> => {
    const response = await apiClient.post<AddMedicineResponse>(
        "/medicine/addMedicine",
        payload,
    );
    return response.data;
};
