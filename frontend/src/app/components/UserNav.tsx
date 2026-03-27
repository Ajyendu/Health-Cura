import { Link, useLocation } from "react-router";
import { HeartPulse, Home, Calendar, User, FileText, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router";
import { authApi } from "@/shared/api/services";
import { useUserAuth } from "@/Body/Auth/User/AuthContext";

export function UserNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useUserAuth();

  const navItems = [
    { path: "/user/home", label: "Find Doctors", icon: Home },
    { path: "/user/appointments", label: "Appointments", icon: Calendar },
    { path: "/user/records", label: "Records", icon: FileText },
    { path: "/user/profile", label: "Profile", icon: User },
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
          <Link to="/user/home" className="flex items-center gap-2">
            <HeartPulse className="w-7 h-7 text-teal-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
              HealthCura
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={
                      isActive
                        ? "bg-gradient-to-r from-teal-600 to-blue-600 text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Logout */}
          <Button variant="ghost" className="text-gray-600 hover:text-red-600" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex gap-1 pb-2 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={
                    isActive
                      ? "bg-gradient-to-r from-teal-600 to-blue-600 text-white"
                      : "text-gray-600"
                  }
                >
                  <Icon className="w-4 h-4 mr-1" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
