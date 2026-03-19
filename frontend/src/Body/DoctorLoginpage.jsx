import React, { useContext, useEffect, useState } from "react";
import DoctorContext from "@/Context/Doctor/DoctorContext";
import { Link, useNavigate } from "react-router-dom";
import { useDoctorAuth } from "@/Body/Auth/Doctor/AuthContext";

const initialDoctorState = { email: "", password: "" };
const containerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
};
const cardWrapperStyle = { width: "35vw" };

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
    <div style={containerStyle}>
      <div style={cardWrapperStyle}>
        <div className="modal-content rounded-4 shadow">
          <div className="modal-header p-5 pb-4 border-bottom-0 justify-content-center">
            <h1 className="fw-bold fs-2">Doctor Login</h1>
          </div>

          <div className="modal-body p-5 pt-0">
            <form onSubmit={handleSubmit}>
              <div className="form-floating mb-3">
                <input
                  type="email"
                  className="form-control rounded-3"
                  name="email"
                  placeholder="doctor@example.com"
                  value={doctor.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoComplete="email"
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
                  autoComplete="current-password"
                />
                <label>Password</label>
              </div>

              <button
                type="submit"
                className="w-100 btn btn-lg btn-primary"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login as Doctor"}
              </button>

              <hr className="my-4" />

              <div className="text-center">
                <p>
                  Not a doctor?{" "}
                  <Link to="/login" className="text-primary">
                    User login
                  </Link>
                </p>
                <p>
                  New doctor?{" "}
                  <Link to="/register/doctor" className="text-primary">
                    Register here
                  </Link>
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
