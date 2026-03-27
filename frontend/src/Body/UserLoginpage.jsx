import React, { useContext, useState } from "react";
import UserContext from "@/Context/User/UserContext";
import { Link, useNavigate } from "react-router-dom";
import { useUserAuth } from "@/Body/Auth/User/AuthContext";
import "./Login.css";

const UserLoginpage = () => {
  const context = useContext(UserContext);
  const { login } = context;
  const { isAuthenticated } = useUserAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setUser((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user.email || !user.password) {
      alert("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    const success = await login(user.email, user.password);
    setIsLoading(false);

    if (success) {
      navigate("/home");
    }
    setUser({ email: "", password: "" });
  };

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/home");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="auth-shell-bg">
      <div className="auth-shell-card">
        <section className="auth-shell-hero">
          <h2>CareConnect Pro</h2>
          <p>Patient portal for doctor search, appointments, records and follow-ups.</p>
        </section>

        <section className="auth-shell-form">
          <h3 className="mb-3">Patient login</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                placeholder="patient@example.com"
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
              {isLoading ? "Logging in..." : "Log in"}
            </button>
          </form>
          <div className="mt-3 small text-muted">
            New patient? <Link to="/register">Create account</Link> | Doctor?{" "}
            <Link to="/login/doctor">Doctor login</Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default UserLoginpage;
