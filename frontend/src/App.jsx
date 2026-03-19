import "bootstrap/dist/css/bootstrap.min.css";
import "@/App.css";
import "@/Header/Header.css";
import UserState from "@/Context/User/UserState";
import Header from "@/Header/Header";
import Footer from "@/Footer/Footer";
import { Routes, Route } from "react-router-dom";
import Home from "@/Body/Home";
import Login from "@/Body/Loginpage";
import Register from "@/Body/Register";
import Help from "@/Body/Help";
import UserRegister from "./Body/UserRegister";
import DoctorRegister from "./Body/DoctorRegister";
import DoctorLoginpage from "./Body/DoctorLoginpage";
import UserLoginpage from "./Body/UserLoginpage";
import DoctorState from "./Context/Doctor/DoctorState";
import RoleRedirect from "@/Body/Auth/RoleRedirect";
import { RequireDoctor, RequireUser } from "@/shared/auth/guards";
import DoctorSearchPage from "@/features/doctor-search/DoctorSearchPage";
import DoctorProfilePage from "@/features/doctor-profile/DoctorProfilePage";
import UserAppointmentsPage from "@/features/appointments/UserAppointmentsPage";
import DoctorDashboardPage from "@/features/appointments/DoctorDashboardPage";
import ProfilePage from "@/features/profile/ProfilePage";
import RecordsPage from "@/features/records/RecordsPage";

function App() {
  return (
    <>
      <UserState>
        <DoctorState>
          <Header />
          <main>
            <Routes>
              <Route path="/home" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/login/user" element={<UserLoginpage />} />
              <Route path="/login/doctor" element={<DoctorLoginpage />} />
              <Route path="/register" element={<Register />} />
              <Route path="/register/user" element={<UserRegister />} />
              <Route path="/register/doctor" element={<DoctorRegister />} />
              <Route
                path="/appointments"
                element={
                  <RequireUser>
                    <UserAppointmentsPage />
                  </RequireUser>
                }
              />
              <Route
                path="/doctor/dashboard"
                element={
                  <RequireDoctor>
                    <DoctorDashboardPage />
                  </RequireDoctor>
                }
              />
              <Route path="/doctors/:doctorId" element={<DoctorProfilePage />} />
              <Route path="/search" element={<DoctorSearchPage />} />
              <Route
                path="/profile"
                element={
                  <RequireUser>
                    <ProfilePage />
                  </RequireUser>
                }
              />
              <Route
                path="/records"
                element={
                  <RequireUser>
                    <RecordsPage />
                  </RequireUser>
                }
              />
              <Route path="/" element={<RoleRedirect />} />

              <Route path="/help" element={<Help />} />
            </Routes>
          </main>
          <Footer />
        </DoctorState>
      </UserState>
    </>
  );
}

export default App;
