import React, { useContext, useState } from "react";
import UserContext from "@/Context/User/UserContext";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

const UserRegister = () => {
  const context = useContext(UserContext);
  const { register } = context;
  const navigate = useNavigate();

  const [user, setUser] = useState({ name: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setUser((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user.name || !user.email || !user.password) {
      alert("Fill all the blanks");
      return;
    }

    setIsLoading(true);
    const success = await register(user.name, user.email, user.password);
    setIsLoading(false);

    if (success) {
      navigate("/home");
    }
    setUser({ name: "", email: "", password: "" });
  };

  return (
    <div className="auth-shell-bg">
      <div className="auth-shell-card">
        <section className="auth-shell-hero">
          <h2>Create Patient Account</h2>
          <p>Register to search doctors, manage family profiles and upload records.</p>
        </section>
        <section className="auth-shell-form">
          <h3 className="mb-3">Patient registration</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Full name</label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                placeholder="Full name"
                value={user.name}
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
                value={user.email}
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
                value={user.password}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <button className="btn btn-dark w-100 rounded-pill py-2" type="submit" disabled={isLoading}>
              {isLoading ? "Signing up..." : "Create account"}
            </button>
          </form>
          <div className="mt-3 small text-muted">
            Already have an account? <Link to="/login/user">Login</Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default UserRegister;
