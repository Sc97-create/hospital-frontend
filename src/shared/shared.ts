import { GetDepartments } from "./api/shared-api";
import type { Department } from "./types/share-type";

export let deptArray: Department[] = [];

export const getDepartments = async () => {
    try {
        const response = await GetDepartments("4c02d9f5-7388-4382-b2c7-aa3fe3852625", 1, 10);
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
