import { useState, useEffect } from "react";
import UserContext from "./UserContext";
import { useUserAuth } from "@/Body/Auth/User/AuthContext";
import { authApi, profileApi } from "@/shared/api/services";

const UserState = (props) => {
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
      await authApi.loginUser({ email: email.toLowerCase(), password });
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
    } catch {}
    setUser(null);
    authLogout();
  };

  // ✅ FETCH USER PROFILE (NO auth mutations here)
  const getProfile = async () => {
    try {
      const payload = await profileApi.getProfile();
      setUser(payload.data);
    } catch {}
  };

  // ✅ REGISTER
  const register = async (name, email, password) => {
    try {
      await authApi.registerUser({ name, email: email.toLowerCase(), password });
      await authCheckAuth();
      return true;
    } catch (err) {
      alert(err.message || "Something went wrong");
      return false;
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, login, register, logout }}>
      {props.children}
    </UserContext.Provider>
  );
};

export default UserState;
