import React, { useContext, useState } from "react";
import "./Login.css";

const Loginpage = () => {
  return (
    <div className="register-container">
      <div className="button-group">
        <a href="/login/doctor" className="button">
          Doctor
        </a>
        <a href="/login/user" className="button gray">
          User
        </a>
      </div>
    </div>
  );
};

export default Loginpage;
