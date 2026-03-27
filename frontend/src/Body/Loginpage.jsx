import React from "react";
import { Link } from "react-router-dom";
import "./Login.css";

const Loginpage = () => {
  return (
    <div className="auth-shell-bg">
      <div className="auth-shell-card">
        <section className="auth-shell-hero">
          <h2>CareConnect Pro</h2>
          <p>Secure patient and doctor dashboards with instant booking and profile tools.</p>
        </section>
        <section className="auth-shell-form">
          <h3 className="mb-3">Choose your sign in</h3>
          <div className="d-grid gap-2">
            <Link to="/login/doctor" className="btn btn-dark btn-lg rounded-pill">
              Continue as Doctor
            </Link>
            <Link to="/login/user" className="btn btn-outline-dark btn-lg rounded-pill">
              Continue as Patient
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Loginpage;
