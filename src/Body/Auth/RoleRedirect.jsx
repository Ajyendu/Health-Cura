import { Navigate } from "react-router-dom";
import { useUserAuth } from "@/Body/Auth/User/AuthContext";
import { useDoctorAuth } from "@/Body/Auth/Doctor/AuthContext";

const RoleRedirect = () => {
  const userAuth = useUserAuth();
  const doctorAuth = useDoctorAuth();

  // Still checking cookies
  if (userAuth.loading || doctorAuth.loading) {
    return <div>Loading...</div>;
  }

  // Doctor has priority
  if (doctorAuth.isAuthenticated) {
    return <Navigate to="/doctor/dashboard" replace />;
  }

  if (userAuth.isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  // Not logged in
  return <Navigate to="/login" replace />;
};

export default RoleRedirect;
