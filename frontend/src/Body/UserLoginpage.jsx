import React, { useContext, useState } from "react";
import UserContext from "@/Context/User/UserContext";
import { useNavigate } from "react-router-dom";
import { useUserAuth } from "@/Body/Auth/User/AuthContext"; // Changed from useAuth to useUserAuth

const UserLoginpage = () => {
  const context = useContext(UserContext);
  const { login } = context;
  const { isAuthenticated } = useUserAuth(); // Changed from useAuth to useUserAuth
  const navigate = useNavigate();

  // ... rest of the code remains the same
  // ... rest of Loginpage remains the same
  const [user, setUser] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleClick = async (e) => {
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

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/home");
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
              <h1 className="fw-bold mb-0 fs-2">Login</h1>
            </div>

            <div className="modal-body p-5 pt-0">
              <form>
                <div className="form-floating mb-3">
                  <input
                    type="email"
                    className="form-control rounded-3"
                    id="email"
                    name="email"
                    placeholder="name@example.com"
                    value={user.email}
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
                    value={user.password}
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
                  {isLoading ? "Logging in..." : "Continue"}
                </button>
                <small className="text-body-secondary">
                  By clicking Login, you agree to the terms of use.
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
                  Login with Gmail
                </button>
                <div className="mt-3">
                  <p>
                    Don't have an account?{" "}
                    <a href="/register" className="text-primary">
                      Register here
                    </a>
                  </p>
                  <p>
                    Are you a doctor?{" "}
                    <a href="/register/doctor" className="text-primary">
                      Doctor registration
                    </a>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLoginpage;
