import { GetDepartments } from "./api/shared-api";
import type { Department } from "./types/share-type";

export let deptArray: Department[] = [];

export const getDepartments = async () => {
    try {
        const response = await GetDepartments(localStorage.getItem("organisation_id") || "", 1, 10);
        console.log(response);
        setDeptArray(response.data);
        return deptArray;
    } catch (error) {
        console.error(error);
        return [];
    }
}

function setDeptArray(data: Department[]) {
    deptArray = [...deptArray, ...data];
}
