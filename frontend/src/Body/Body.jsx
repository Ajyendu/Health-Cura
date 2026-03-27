import Home from "./Home";
import Login from "./Login";
import Appointments from "./Appointments";
import Help from "./Help";
import Search from "./Search";
import Register from "./Register";
import Profiles from "./Profiles";

function Body({ CurrentPage }) {
  return (
    <>
      {CurrentPage === "Home" && <Home />}
      {CurrentPage === "Login" && <Login />}
      {CurrentPage === "Appointments" && <Appointments />}
      {CurrentPage === "Help" && <Help />}
      {CurrentPage === "Search" && <Search />}
      {CurrentPage === "Register" && <Register />}
      {CurrentPage === "Profiles" && <Profiles />}
    </>
  );
}

export default Body;
