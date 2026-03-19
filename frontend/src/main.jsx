import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@/index.css";
import App from "@/App.jsx";

import { UserAuthProvider } from "@/Body/Auth/User/AuthContext";
import { DoctorAuthProvider } from "@/Body/Auth/Doctor/AuthContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <UserAuthProvider>
        <DoctorAuthProvider>
          <App />
        </DoctorAuthProvider>
      </UserAuthProvider>
    </BrowserRouter>
  </StrictMode>
);