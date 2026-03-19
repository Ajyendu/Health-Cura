import React, { useContext, useState } from "react";
import UserContext from "@/Context/User/UserContext";
import { useNavigate } from "react-router-dom";

const UserLogin = () => {
  const context = useContext(UserContext);
  const { login } = context;
  const navigate = useNavigate();

  const [user, setUser] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleClick = async (e) => {
    e.preventDefault();
    if (!user.email || !user.password) {
      alert("Invalid Credentials");
      return;
    }
    await login(user.email, user.password);

    if (localStorage.getItem("token")) {
      navigate("/home");
    }
    setUser({ email: "", password: "" });
  };

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
          borderRadius: "10px",
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
                  />
                  <label htmlFor="floatingPassword">Password</label>
                </div>
                <button
                  className="w-100 mb-2 btn btn-lg rounded-3 btn-primary"
                  type="submit"
                  onClick={handleClick}
                >
                  Continue
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin; // ✅ Default export
