import React, { useContext, useEffect, useState } from "react";
import DoctorContext from "@/Context/Doctor/DoctorContext";
import { Link, useNavigate } from "react-router-dom";
import { useDoctorAuth } from "@/Body/Auth/Doctor/AuthContext";
import "./Login.css";

const initialDoctorState = { email: "", password: "" };

const DoctorLoginpage = () => {
  const { login } = useContext(DoctorContext);
  const { isAuthenticated } = useDoctorAuth();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(initialDoctorState);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = ({ target: { name, value } }) => {
    setDoctor((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!doctor.email || !doctor.password) {
      alert("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    const success = await login(doctor.email, doctor.password);
    setIsLoading(false);

    if (success) {
      navigate("/");
    }

    setDoctor(initialDoctorState);
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="auth-shell-bg">
      <div className="auth-shell-card">
        <section className="auth-shell-hero">
          <h2>CareConnect Doctor</h2>
          <p>Manage schedule, consult patients, and update your complete profile.</p>
        </section>

        <section className="auth-shell-form">
          <h3 className="mb-3">Doctor login</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
                <input
                  type="email"
                className="form-control"
                  name="email"
                  placeholder="doctor@example.com"
                  value={doctor.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoComplete="email"
                />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
                <input
                  type="password"
                className="form-control"
                  name="password"
                  placeholder="Password"
                  value={doctor.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
            </div>

            <button type="submit" className="btn btn-dark w-100 rounded-pill py-2" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Log in"}
            </button>
          </form>
          <div className="mt-3 small text-muted">
            Patient? <Link to="/login/user">User login</Link> | New doctor?{" "}
            <Link to="/register/doctor">Register</Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DoctorLoginpage;
