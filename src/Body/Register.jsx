import React from "react";
import "./Register.css";

const Register = () => {

  return (
    <div className="register-container">
      <div className="button-group">
        <a href="/register/doctor" className="button">
          Doctor
        </a>
        <a href="/register/user" className="button gray">
          User
        </a>
      </div>
    </div>
  );
};

export default Register;
