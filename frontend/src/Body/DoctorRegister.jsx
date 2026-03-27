import React, { useContext, useState } from "react";
import DoctorContext from "@/Context/Doctor/DoctorContext";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

const DoctorRegister = () => {
  const context = useContext(DoctorContext);
  const { register } = context;

  const navigate = useNavigate();

  const [doctor, setDoctor] = useState({ name: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setDoctor((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!doctor.name || !doctor.email || !doctor.password) {
      alert("Fill all the blanks");
      return;
    }

    setIsLoading(true);
    const success = await register(doctor.name, doctor.email, doctor.password);
    setIsLoading(false);

    if (success) {
      navigate("/home");
    }
    setDoctor({ name: "", email: "", password: "" });
  };

  return (
    <div className="auth-shell-bg">
      <div className="auth-shell-card">
        <section className="auth-shell-hero">
          <h2>Create Doctor Account</h2>
          <p>Set up your doctor profile, consultation details, and appointment availability.</p>
        </section>
        <section className="auth-shell-form">
          <h3 className="mb-3">Doctor registration</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Full name</label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                placeholder="Full name"
                value={doctor.name}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                placeholder="name@example.com"
                value={doctor.email}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                placeholder="Password"
                value={doctor.password}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <button className="btn btn-dark w-100 rounded-pill py-2" type="submit" disabled={isLoading}>
              {isLoading ? "Signing up..." : "Create doctor account"}
            </button>
          </form>
          <div className="mt-3 small text-muted">
            Already registered? <Link to="/login/doctor">Login</Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DoctorRegister;
