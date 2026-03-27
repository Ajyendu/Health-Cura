import React from "react";
import { Link } from "react-router-dom";
import "./Login.css";

const Register = () => {
  return (
    <div className="auth-shell-bg">
      <div className="auth-shell-card">
        <section className="auth-shell-hero">
          <h2>Create your CareConnect account</h2>
          <p>Choose the right onboarding flow to get started quickly.</p>
        </section>
        <section className="auth-shell-form">
          <h3 className="mb-3">Register as</h3>
          <div className="d-grid gap-2">
            <Link to="/register/doctor" className="btn btn-dark btn-lg rounded-pill">
              Doctor
            </Link>
            <Link to="/register/user" className="btn btn-outline-dark btn-lg rounded-pill">
              Patient
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Register;
