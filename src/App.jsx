import "bootstrap/dist/css/bootstrap.min.css";
import "@/App.css";
import "@/Header/Header.css";
import UserState from "@/Context/User/UserState";
import Header from "@/Header/Header";
import Footer from "@/Footer/Footer";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/Body/Home";
import Login from "@/Body/Loginpage";
import Register from "@/Body/Register";
import DoctorAppointments from "@/Body/DoctorAppointments";
import Help from "@/Body/Help";
import Search from "@/Body/Search";
import UserRegister from "./Body/UserRegister";
import DoctorRegister from "./Body/DoctorRegister";
import DoctorLoginpage from "./Body/DoctorLoginpage";
import UserLoginpage from "./Body/UserLoginpage";
import DoctorState from "./Context/Doctor/DoctorState";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import MyAppointments from "./Body/MyAppointments";
import RoleRedirect from "@/Body/Auth/RoleRedirect";

function App() {
  const location = useLocation();

  useEffect(() => {
    // Bypass auth check for /profiles route
    if (location.pathname === "/profiles") {
      console.log("Profiles route accessed - bypassing auth checks");
    }
  }, [location.pathname]);
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
              <Route path="/appointments" element={<MyAppointments />} />
              <Route
                path="/doctor/appointments"
                element={<DoctorAppointments />}
              />
              <Route path="/" element={<RoleRedirect />} />

              <Route path="/help" element={<Help />} />
              <Route path="/search" element={<Search />} />
            </Routes>
          </main>
          <Footer />
        </DoctorState>
      </UserState>
    </>
  );
}

export default App;
