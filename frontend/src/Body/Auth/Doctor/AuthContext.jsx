import { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "@/shared/api/services";

const DoctorAuthContext = createContext();

export const DoctorAuthProvider = ({ children }) => {
  const [doctor, setDoctor] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check DOCTOR authentication status on mount
  const checkAuth = async () => {
    try {
      const payload = await authApi.me();
      const doctorData = payload?.data;
      if (doctorData?.role === "doctor") {
        setDoctor(doctorData);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setDoctor(null);
      }
    } catch {
      setIsAuthenticated(false);
      setDoctor(null);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    checkAuth();
  }, []);

  const login = (doctorData) => {
    setDoctor(doctorData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Doctor logout failed:", error);
    }
    setDoctor(null);
    setIsAuthenticated(false);
  };

  return (
    <DoctorAuthContext.Provider
      value={{
        doctor,
        isAuthenticated,
        login,
        logout,
        loading,
        checkAuth,
      }}
    >
      {children}
    </DoctorAuthContext.Provider>
  );
};

export const useDoctorAuth = () => useContext(DoctorAuthContext);
