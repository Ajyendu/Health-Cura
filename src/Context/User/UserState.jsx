import { useState, useEffect } from "react";
import UserContext from "./UserContext";
import { useUserAuth } from "@/Body/Auth/User/AuthContext";

const UserState = (props) => {
  const host = "http://localhost:8005";
  const [user, setUser] = useState(null);

  const {
    isAuthenticated,
    loading,
    logout: authLogout,
    checkAuth: authCheckAuth,
  } = useUserAuth();

  // ✅ Fetch profile ONLY if user is authenticated
  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      setUser(null);
      return;
    }

    console.log("📦 User authenticated! Fetching profile...");
    getProfile();
  }, [isAuthenticated, loading]);

  // ✅ USER LOGIN (ONLY calls backend + auth check)
  const login = async (email, password) => {
    try {
      console.log("🔐 Attempting user login...");
      const response = await fetch(`${host}/users/login`, {
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

      console.log("📨 User login response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ User login failed:", errorData);
        alert(errorData.error || "Invalid credentials");
        return false;
      }

      console.log("✅ User login successful");

      // ✅ Let AuthContext decide auth state
      await authCheckAuth();
      return true;
    } catch (error) {
      console.error("🔥 User login error:", error);
      alert("Something went wrong!");
      return false;
    }
  };

  // ✅ LOGOUT
  const logout = async () => {
    try {
      await fetch(`${host}/users/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("User logout error:", error);
    } finally {
      setUser(null);
      authLogout();
    }
  };

  // ✅ FETCH USER PROFILE (NO auth mutations here)
  const getProfile = async () => {
    try {
      console.log("📋 Fetching user profile...");
      const res = await fetch(`${host}/users/getuser`, {
        method: "POST",
        credentials: "include",
      });

      console.log("📊 User profile response status:", res.status);

      if (res.status === 401) {
        console.warn("⚠️ User not authenticated");
        setUser(null);
        return;
      }

      if (!res.ok) {
        console.error("❌ Server error:", res.status);
        return;
      }

      const data = await res.json();
      console.log("✅ User profile data:", data);

      setUser(data);
    } catch (err) {
      console.error("❌ Error fetching user profile:", err);
    }
  };

  // ✅ REGISTER
  const register = async (name, email, password) => {
    try {
      console.log("👤 Attempting user registration...");
      const response = await fetch(`${host}/users/createuser`, {
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

      console.log("📨 User registration response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ User registration failed:", errorData);
        alert(errorData.error || "Registration failed");
        return false;
      }

      console.log("✅ User registration successful");
      await authCheckAuth();
      return true;
    } catch (err) {
      console.error("🔥 User registration error:", err);
      alert("Something went wrong");
      return false;
    }
  };

  return (
    <UserContext.Provider value={{ user, login, register, logout }}>
      {props.children}
    </UserContext.Provider>
  );
};

export default UserState;
