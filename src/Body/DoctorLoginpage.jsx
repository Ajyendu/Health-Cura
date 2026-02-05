import React, { useContext, useState, useEffect } from "react";
import DoctorContext from "@/Context/Doctor/DoctorContext";
import { useNavigate } from "react-router-dom";
import { useDoctorAuth } from "@/Body/Auth/Doctor/AuthContext";

const DoctorLoginpage = () => {
  const { login } = useContext(DoctorContext);
  const { isAuthenticated } = useDoctorAuth();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setDoctor({ ...doctor, [e.target.name]: e.target.value });
  };

  const handleClick = async (e) => {
    e.preventDefault();

    if (!doctor.email || !doctor.password) {
      alert("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    const success = await login(doctor.email, doctor.password);
    setIsLoading(false);

    if (success) {
      navigate("/"); // 🔥 let RoleRedirect decide
    }

    setDoctor({ email: "", password: "" });
  };

  // ✅ Auto redirect if already logged in as doctor
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/"); // handled by RoleRedirect
    }
  }, [isAuthenticated, navigate]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <div style={{ width: "35vw" }}>
        <div className="modal-content rounded-4 shadow">
          <div className="modal-header p-5 pb-4 border-bottom-0 justify-content-center">
            <h1 className="fw-bold fs-2">Doctor Login</h1>
          </div>

          <div className="modal-body p-5 pt-0">
            <form>
              <div className="form-floating mb-3">
                <input
                  type="email"
                  className="form-control rounded-3"
                  name="email"
                  placeholder="doctor@example.com"
                  value={doctor.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <label>Email address</label>
              </div>

              <div className="form-floating mb-3">
                <input
                  type="password"
                  className="form-control rounded-3"
                  name="password"
                  placeholder="Password"
                  value={doctor.password}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <label>Password</label>
              </div>

              <button
                className="w-100 btn btn-lg btn-primary"
                onClick={handleClick}
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login as Doctor"}
              </button>

              <hr className="my-4" />

              <div className="text-center">
                <p>
                  Not a doctor?{" "}
                  <a href="/login" className="text-primary">
                    User login
                  </a>
                </p>
                <p>
                  New doctor?{" "}
                  <a href="/register/doctor" className="text-primary">
                    Register here
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorLoginpage;
