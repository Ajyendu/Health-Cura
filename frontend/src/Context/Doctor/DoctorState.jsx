import { useState, useEffect } from "react";
import DoctorContext from "./DoctorContext";
import { useDoctorAuth } from "@/Body/Auth/Doctor/AuthContext";
import { authApi } from "@/shared/api/services";

const DoctorState = (props) => {
  const [doctor, setDoctor] = useState(null);

  const {
    isAuthenticated,
    loading,
    logout: authLogout,
    checkAuth: authCheckAuth,
  } = useDoctorAuth();

  // ✅ Fetch profile ONLY if doctor is authenticated
  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      setDoctor(null);
      return;
    }

    console.log("📦 Doctor authenticated! Fetching profile...");
    getProfile();
  }, [isAuthenticated, loading]);

  // ✅ DOCTOR LOGIN
  const login = async (email, password) => {
    try {
      await authApi.loginDoctor({ email: email.toLowerCase(), password });
      await authCheckAuth();
      return true;
    } catch (error) {
      alert(error.message || "Something went wrong!");
      return false;
    }
  };

  // ✅ LOGOUT
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("DoctorState logout failed:", error);
    }
    setDoctor(null);
    authLogout();
  };

  // ✅ FETCH DOCTOR PROFILE (NO auth mutations here)
  const getProfile = async () => {
    try {
      const payload = await authApi.me();
      setDoctor(payload.data?.role === "doctor" ? payload.data : null);
    } catch (error) {
      console.error("DoctorState getProfile failed:", error);
      setDoctor(null);
    }
  };

  // ✅ DOCTOR REGISTER
  const register = async (name, email, password) => {
    try {
      await authApi.registerDoctor({ name, email: email.toLowerCase(), password });
      await authCheckAuth();
      return true;
    } catch (err) {
      alert(err.message || "Something went wrong");
      return false;
    }
  };

  return (
    <DoctorContext.Provider
      value={{
        doctor,
        login,
        register,
        logout,
      }}
    >
      {props.children}
    </DoctorContext.Provider>
  );
};

export default DoctorState;
