import { useState, useEffect } from "react";
import DoctorContext from "./DoctorContext";
import { useDoctorAuth } from "@/Body/Auth/Doctor/AuthContext";

const DoctorState = (props) => {
  const host = "http://localhost:8005";
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
      console.log("🔐 Attempting doctor login...");
      const response = await fetch(`${host}/doctor/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.toLowerCase(), // 🔥 important
          password,
        }),
      });

      console.log("📨 Doctor login response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Doctor login failed:", errorData);
        alert(errorData.error || "Invalid credentials");
        return false;
      }

      console.log("✅ Doctor login successful");

      // ✅ Let DoctorAuth decide auth state
      await authCheckAuth();
      return true;
    } catch (error) {
      console.error("🔥 Doctor login error:", error);
      alert("Something went wrong!");
      return false;
    }
  };

  // ✅ LOGOUT
  const logout = async () => {
    try {
      await fetch(`${host}/doctor/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Doctor logout error:", error);
    } finally {
      setDoctor(null);
      authLogout();
    }
  };

  // ✅ FETCH DOCTOR PROFILE (NO auth mutations here)
  const getProfile = async () => {
    try {
      console.log("📋 Fetching doctor profile...");
      const res = await fetch(`${host}/doctor/getdoctor`, {
        method: "POST",
        credentials: "include",
      });

      console.log("📊 Doctor profile response status:", res.status);

      if (res.status === 401) {
        console.warn("⚠️ Doctor not authenticated");
        setDoctor(null);
        return;
      }

      if (!res.ok) {
        console.error("❌ Server error:", res.status);
        return;
      }

      const data = await res.json();
      console.log("✅ Doctor profile data:", data);

      setDoctor(data);
    } catch (err) {
      console.error("❌ Error fetching doctor profile:", err);
    }
  };

  // ✅ DOCTOR REGISTER
  const register = async (name, email, password) => {
    try {
      console.log("👤 Attempting doctor registration...");
      const response = await fetch(`${host}/doctor/createdoctor`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email: email.toLowerCase(), // 🔥 important
          password,
        }),
      });

      console.log("📨 Doctor registration response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Doctor registration failed:", errorData);
        alert(errorData.error || "Registration failed");
        return false;
      }

      console.log("✅ Doctor registration successful");

      await authCheckAuth();
      return true;
    } catch (err) {
      console.error("🔥 Doctor registration error:", err);
      alert("Something went wrong");
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
