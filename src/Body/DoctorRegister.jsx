import React, { useContext, useState } from "react";
import DoctorContext from "@/Context/Doctor/DoctorContext";
import { useNavigate } from "react-router-dom";

const DoctorRegister = () => {
  const context = useContext(DoctorContext);
  const { register } = context;

  const navigate = useNavigate();

  // ... rest of the code remains the same
  // ... rest of DoctorRegister remains the same
  const [doctor, setDoctor] = useState({ name: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setDoctor({ ...doctor, [e.target.name]: e.target.value });
  };

  const handleClick = async (e) => {
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

  // Redirect if already authenticated

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <div
        style={{
          padding: "20px",
          borderRadius: "10px solid black",
          textAlign: "center",
          width: "35vw",
        }}
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content rounded-4 shadow">
            <div
              className="modal-header p-5 pb-4 border-bottom-0"
              style={{ justifyContent: "center" }}
            >
              <h1 className="fw-bold mb-0 fs-2">Doctor Sign up</h1>
            </div>

            <div className="modal-body p-5 pt-0">
              <form>
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control rounded-3"
                    id="name"
                    name="name"
                    placeholder="Full name"
                    value={doctor.name}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <label htmlFor="floatingInput">Full name</label>
                </div>
                <div className="form-floating mb-3">
                  <input
                    type="email"
                    className="form-control rounded-3"
                    id="email"
                    name="email"
                    placeholder="name@example.com"
                    value={doctor.email}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <label htmlFor="floatingInput">Email address</label>
                </div>
                <div className="form-floating mb-3">
                  <input
                    type="password"
                    className="form-control rounded-3"
                    id="password"
                    name="password"
                    placeholder="Password"
                    value={doctor.password}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <label htmlFor="floatingPassword">Password</label>
                </div>
                <button
                  className="w-100 mb-2 btn btn-lg rounded-3 btn-primary"
                  type="submit"
                  onClick={handleClick}
                  disabled={isLoading}
                >
                  {isLoading ? "Signing up..." : "Sign up as Doctor"}
                </button>
                <small className="text-body-secondary">
                  By clicking Sign up, you agree to the terms of use.
                </small>
                <hr className="my-4" />
                <h2 className="fs-5 fw-bold mb-3">Or use a third-party</h2>
                <button
                  className="w-100 py-2 mb-2 btn btn-outline-secondary rounded-3"
                  type="button"
                  disabled={isLoading}
                >
                  <svg className="bi me-1" width="16" height="16">
                    <use xlinkHref="#Gmail"></use>
                  </svg>
                  Sign up with Gmail
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorRegister;
