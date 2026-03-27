import { Link, useLocation } from "react-router";
import { Stethoscope, LayoutDashboard, User, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router";
import { authApi } from "@/shared/api/services";
import { useDoctorAuth } from "@/Body/Auth/Doctor/AuthContext";

export function DoctorNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useDoctorAuth();

  const navItems = [
    { path: "/doctor/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/doctor/profile", label: "My Profile", icon: User },
  ];

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {}
    await logout();
    navigate("/");
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/doctor/dashboard" className="flex items-center gap-2">
            <Stethoscope className="w-7 h-7 text-blue-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              HealthCura
            </span>
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
              Doctor
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
            <Button variant="ghost" className="text-gray-600 hover:text-red-600" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
