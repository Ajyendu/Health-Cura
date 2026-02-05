import { createContext, useContext, useState, useEffect } from "react";

const DoctorAuthContext = createContext();

export const DoctorAuthProvider = ({ children }) => {
  const [doctor, setDoctor] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check DOCTOR authentication status on mount
  const checkAuth = async () => {
    try {
      // First check if we already have a user token (user is logged in)
      // If user is logged in, skip doctor check entirely
      const userToken = document.cookie.includes("userToken");
      if (userToken) {
        console.log("ℹ️ User is logged in, skipping doctor auth check");
        setIsAuthenticated(false);
        setDoctor(null);
        setLoading(false);
        return;
      }

      console.log("🔍 Checking DOCTOR authentication...");
      const res = await fetch("http://localhost:8005/doctor/getdoctor", {
        method: "POST",
        credentials: "include",
      });

      console.log("📊 DOCTOR auth response status:", res.status);

      if (res.ok) {
        const doctorData = await res.json();
        console.log("📦 DOCTOR auth data:", doctorData);

        if (doctorData && doctorData._id) {
          console.log("✅ DOCTOR authenticated successfully");
          setDoctor(doctorData);
          setIsAuthenticated(true);
          return;
        }
      }

      // Silently handle 401 - it's expected for non-doctors
      if (res.status !== 401) {
        console.log("❌ DOCTOR not authenticated (status:", res.status, ")");
      }

      setIsAuthenticated(false);
      setDoctor(null);
    } catch (err) {
      console.error("🔴 DOCTOR auth check error:", err);
      setIsAuthenticated(false);
      setDoctor(null);
    } finally {
      setTimeout(() => setLoading(false), 3000);
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
      await fetch("http://localhost:8005/doctor/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("DOCTOR logout error:", err);
    } finally {
      setDoctor(null);
      setIsAuthenticated(false);
    }
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
