import React, { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { MdOutlineSupportAgent, MdNotificationsNone } from "react-icons/md";
import { RiSearch2Fill, RiHome9Fill, RiUser3Line } from "react-icons/ri";
import { FaRegCalendarCheck, FaHeartbeat } from "react-icons/fa";
import { HiOutlineDocumentText, HiOutlineLogout } from "react-icons/hi";
import { useUserAuth } from "@/Body/Auth/User/AuthContext";
import { useDoctorAuth } from "@/Body/Auth/Doctor/AuthContext";

function Header() {
  const location = useLocation();
  const userAuth = useUserAuth();
  const doctorAuth = useDoctorAuth();
  const isUser = userAuth.isAuthenticated;
  const isDoctor = doctorAuth.isAuthenticated;
  const isAuthenticated = isUser || isDoctor;

  const [unreadCount, setUnreadCount] = useState(2);

  const navItems = useMemo(() => {
    const base = [
      { to: "/home", label: "Home", icon: <RiHome9Fill size={16} /> },
      { to: "/search", label: "Find Doctors", icon: <RiSearch2Fill size={16} /> },
      {
        to: isDoctor ? "/doctor/dashboard" : "/appointments",
        label: "Appointments",
        icon: <FaRegCalendarCheck size={15} />,
      },
      {
        to: isDoctor ? "/doctor/profile" : "/profile",
        label: "Profile",
        icon: <RiUser3Line size={15} />,
      },
      { to: "/help", label: "Help", icon: <MdOutlineSupportAgent size={16} /> },
    ];

    if (!isDoctor) {
      base.splice(4, 0, {
        to: "/records",
        label: "Records",
        icon: <HiOutlineDocumentText size={16} />,
      });
    }
    return base;
  }, [isDoctor]);

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Link to="/" className="app-brand">
          <FaHeartbeat />
          <span>HealthCura</span>
        </Link>
        <nav className="app-main-nav">
          {navItems.map((item) => (
            <Link
              key={item.to + item.label}
              to={item.to}
              className={`app-nav-pill ${location.pathname === item.to ? "active" : ""}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="app-header-actions">
          {isAuthenticated ? (
            <>
              <Link
                to="/help"
                className="btn btn-outline-secondary btn-sm position-relative app-notify-btn"
                onClick={() => setUnreadCount(0)}
              >
                <MdNotificationsNone size={20} />
                {unreadCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill text-bg-danger">
                    {unreadCount}
                  </span>
                )}
              </Link>
              <button
                onClick={() => (isDoctor ? doctorAuth.logout() : userAuth.logout())}
                className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
              >
                <HiOutlineLogout size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login/user"
                className="btn btn-outline-primary btn-sm"
              >
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
