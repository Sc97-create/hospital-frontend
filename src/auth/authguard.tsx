
import { Navigate } from "react-router-dom";

const AuthGuard = ({ children }: any)=>{
    const token = localStorage.getItem("access_token")
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
}
export default AuthGuard