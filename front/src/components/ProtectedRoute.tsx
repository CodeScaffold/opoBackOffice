import { useAuth } from "../hooks/auth";
import { Navigate, Outlet } from "react-router";

const ProtectedRoute = () => {
  const { isAuth } = useAuth();
  if (!isAuth) {
    return <Navigate to="/login" />;
  }
  return <Outlet />;
};
export default ProtectedRoute;
