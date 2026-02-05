import { createContext, useContext, useState, useEffect } from "react";

const UserAuthContext = createContext();

export const UserAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check USER authentication status on mount
  const checkAuth = async () => {
    try {
      console.log("🔍 Checking USER authentication...");
      const res = await fetch("http://localhost:8005/users/getuser", {
        method: "POST",
        credentials: "include",
      });

      console.log("📊 USER auth response status:", res.status);

      if (res.ok) {
        const userData = await res.json();
        console.log("📦 USER auth data:", userData);

        if (userData && userData._id) {
          console.log("✅ USER authenticated successfully");
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          console.warn("⚠️ USER auth returned null data");
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        console.log("❌ USER not authenticated (status:", res.status, ")");
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (err) {
      console.error("🔴 USER auth check error:", err);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await fetch("http://localhost:8005/users/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("USER logout error:", err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <UserAuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        loading,
        checkAuth,
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
};

export const useUserAuth = () => useContext(UserAuthContext);
