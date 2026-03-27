import Search from "./Search";
import docprofile from "./doctorData";
import { useDoctorAuth } from "@/Body/Auth/Doctor/AuthContext";

// Debug: Check if data is loading
console.log(
  "Doctor data imported:",
  docprofile ? `Array with ${docprofile.length} items` : "UNDEFINED"
);
function Profiles() {
  const { loading } = useDoctorAuth(); // Get loading state

  if (loading) {
    return <div>Checking authentication...</div>;
  }

  return <Search docprofile={docprofile} />;
}
export default Profiles;
