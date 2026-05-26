import axios from "axios";

export const GetPermissions = async (): Promise<any> => {
    const response = await axios.get(
        `http://localhost:9069/api/v1/permission/getAll`
    );
    return response.data
}