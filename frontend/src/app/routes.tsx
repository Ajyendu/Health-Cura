import { createBrowserRouter } from "react-router";
import Welcome from "./pages/Welcome";
import UserLogin from "./pages/auth/UserLogin";
import UserRegister from "./pages/auth/UserRegister";
import DoctorLogin from "./pages/auth/DoctorLogin";
import DoctorRegister from "./pages/auth/DoctorRegister";
import UserHome from "./pages/user/UserHome";
import DoctorProfile from "./pages/user/DoctorProfile";
import UserAppointments from "./pages/user/UserAppointments";
import UserProfile from "./pages/user/UserProfile";
import MedicalRecords from "./pages/user/MedicalRecords";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorProfileManagement from "./pages/doctor/DoctorProfileManagement";
import NotFound from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Welcome,
  },
  {
    path: "/user/login",
    Component: UserLogin,
  },
  {
    path: "/user/register",
    Component: UserRegister,
  },
  {
    path: "/doctor/login",
    Component: DoctorLogin,
  },
  {
    path: "/doctor/register",
    Component: DoctorRegister,
  },
  {
    path: "/user/home",
    Component: UserHome,
  },
  {
    path: "/user/doctor/:id",
    Component: DoctorProfile,
  },
  {
    path: "/doctors/:id",
    Component: DoctorProfile,
  },
  {
    path: "/user/appointments",
    Component: UserAppointments,
  },
  {
    path: "/user/profile",
    Component: UserProfile,
  },
  {
    path: "/user/records",
    Component: MedicalRecords,
  },
  {
    path: "/doctor/dashboard",
    Component: DoctorDashboard,
  },
  {
    path: "/doctor/profile",
    Component: DoctorProfileManagement,
  },
  {
    path: "*",
    Component: NotFound,
  },
]);
