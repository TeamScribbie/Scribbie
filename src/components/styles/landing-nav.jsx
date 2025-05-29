import React from "react";
import "../styles/landing.css";

const LandingNavbar = () => {
  return (
    <nav className="navbar">
      <a href="#" className="navlogo">Scribbie</a>
      <button className="hamburger" aria-label="Toggle menu">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="feather feather-menu"
        >
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>
      <div className="navlinkwrap">
        <span className="navlink selectedlink">Home</span>
        <span className="navlink">My Profile</span>
        <span className="navlink">Activity</span>
        <span className="navlink">How It Works</span>
      </div>
      <div className="buttonwrap">
        <button className="createbtn selectedbtn">CREATE</button>
        <button className="createbtn">SIGN IN</button>
      </div>
    </nav>
  );
};

export default LandingNavbar;
