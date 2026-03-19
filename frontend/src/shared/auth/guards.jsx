import React from "react";
import { Navigate } from "react-router-dom";
import { useUserAuth } from "@/Body/Auth/User/AuthContext";
import { useDoctorAuth } from "@/Body/Auth/Doctor/AuthContext";

export const RequireUser = ({ children }) => {
  const { isAuthenticated, loading } = useUserAuth();
  if (loading) return <p style={{ padding: "2rem" }}>Loading...</p>;
  if (!isAuthenticated) return <Navigate to="/login/user" replace />;
  return children;
};

export const RequireDoctor = ({ children }) => {
  const { isAuthenticated, loading } = useDoctorAuth();
  if (loading) return <p style={{ padding: "2rem" }}>Loading...</p>;
  if (!isAuthenticated) return <Navigate to="/login/doctor" replace />;
  return children;
};
