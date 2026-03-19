import { MdOutlineSupportAgent, MdNotificationsNone } from "react-icons/md";
import { RiSearch2Fill, RiHome9Fill } from "react-icons/ri";
import { FaRegCalendarCheck } from "react-icons/fa";
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useUserAuth } from "@/Body/Auth/User/AuthContext";
import { useDoctorAuth } from "@/Body/Auth/Doctor/AuthContext";

function Header() {
  const location = useLocation();
  const userAuth = useUserAuth();
  const doctorAuth = useDoctorAuth();
  const isUser = userAuth.isAuthenticated;
  const isDoctor = doctorAuth.isAuthenticated;
  const isAuthenticated = isUser || isDoctor;

  // 🔔 Notification count (can be fetched from backend later)
  const [unreadCount, setUnreadCount] = useState(2); // demo value

  useEffect(() => {
    console.log("📍 Current path:", location.pathname);
  }, [location]);

  return (
    <div className="container">
      <header
        className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-between fixed-top"
        style={{ marginTop: "0px", paddingTop: "0px" }}
      >
        <div className="col-md-2 d-flex justify-content-start"></div>

        {/* NAV ICONS */}
        <ul
          className="nav col-12 col-md-auto mb-2 justify-content-center mb-md-0 shadow"
          style={{
            borderRadius: "20px",
            borderTopLeftRadius: "0px",
            borderTopRightRadius: "0px",
            paddingTop: "15px",
            paddingBottom: "5px",
            backgroundColor: "rgba(255,255,255,0.6)",
          }}
        >
          <li style={{ padding: "0px 30px" }}>
            <Link className="nav-link px-2" to="/home">
              <RiHome9Fill size={42} color="black" />
            </Link>
          </li>

          <li style={{ padding: "0px 30px" }}>
            <Link className="nav-link px-2" to="/search">
              <RiSearch2Fill size={42} color="black" />
            </Link>
          </li>

          <li style={{ padding: "0px 30px" }}>
            <Link
              className="nav-link px-2"
              to={isDoctor ? "/doctor/dashboard" : "/appointments"}
            >
              <FaRegCalendarCheck size={42} color="black" />
            </Link>
          </li>

          <li style={{ padding: "0px 30px" }}>
            <Link className="nav-link px-2" to="/help">
              <MdOutlineSupportAgent size={42} color="black" />
            </Link>
          </li>
        </ul>

        {/* RIGHT SIDE */}
        <div className="col-md-2 d-flex align-items-center justify-content-end gap-2">
          {isAuthenticated ? (
            <>
              {/* 🔔 Notification Icon */}
              <Link
                to="/help"
                style={{ position: "relative", marginRight: "10px" }}
                onClick={() => setUnreadCount(0)} // auto-clear
              >
                <MdNotificationsNone size={28} color="black" />

                {unreadCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-4px",
                      right: "-4px",
                      backgroundColor: "#C62828",
                      color: "white",
                      fontSize: "10px",
                      fontWeight: "bold",
                      borderRadius: "50%",
                      padding: "2px 6px",
                      lineHeight: "1",
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </Link>

              {/* LOGOUT */}
              <button
                onClick={() => (isDoctor ? doctorAuth.logout() : userAuth.logout())}
                className="btn btn-outline-primary"
                style={{
                  backgroundColor: "rgba(255,255,255,0.6)",
                  marginRight: "10px",
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login/user"
                className="btn btn-outline-primary"
                style={{ backgroundColor: "rgba(255,255,255,0.6)" }}
              >
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Register
              </Link>
            </>
          )}
        </div>
      </header>
    </div>
  );
}

export default Header;
