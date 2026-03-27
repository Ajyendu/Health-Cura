
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import { UserAuthProvider } from "@/Body/Auth/User/AuthContext";
import { DoctorAuthProvider } from "@/Body/Auth/Doctor/AuthContext";

createRoot(document.getElementById("root")!).render(
  <UserAuthProvider>
    <DoctorAuthProvider>
      <App />
    </DoctorAuthProvider>
  </UserAuthProvider>
);
  