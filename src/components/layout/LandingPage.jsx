import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/landing.css";

const LandingPage = () => {
  const navigate = useNavigate();

  const goToLogin = () => {
    navigate("/teacher-login");
  };

  return (
    <div className="landingpage">
      <nav className="navbar">
        <a href="#" className="navlogo">
          <img
            src="/src/assets/ScribbieLogoV2.png"
            alt="Scribbie Logo"
            style={{ height: '60px', marginRight: '30px', cursor: 'pointer' }}
            className="navlogo-img"
          />
        </a>
        
        <div className="buttonwrap">
          <button className="createbtn selectedbtn" onClick={goToLogin}>SIGN IN</button>
        </div>
      </nav>

      <main className="box">
        <section className="infobox">
          <p className="infobox-boldtext">Have fun to learn!</p>
          <p className="infobox-slimtext">An English Learning App</p>
          <div className="infobox-btnwrapper">
            <button className="infobox-explorebtn selected" onClick={goToLogin}>Register</button>
          </div>
        </section>

        
      </main>


      <section className="started">
        <p className="started-boldtext">Getting started</p>
        <p className="started-slimtext">
          Eu, molestie commodo, enim pellentesque turpis integer sagittis
        </p>
        <div className="started-items">
          <div className="itemwrapper">
            <div className="started-items-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" aria-hidden="true">
                <path style={{ stroke: "none", fillRule: "nonzero", fill: "#e0e0e0" }} d="M12 12v18h4v-7h4v7h4V12h-12z" />
                <path style={{ stroke: "none", fillRule: "nonzero", fill: "#e0e0e0" }} d="M12 8h12v4H12z" />
              </svg>
              <p className="itembold">Interactive reading and writing lessons</p>
            </div>
          </div>

          <div className="itemwrapper">
            <div className="started-items-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" aria-hidden="true">
                <circle cx="18" cy="18" r="16" style={{ stroke: "none", fill: "#e0e0e0" }} />
                <path d="M9 21h18v3H9zM13.5 15v3H16v-3z" style={{ stroke: "none", fill: "#b0b0b0" }} />
              </svg>
              <p className="itembold">User-friendly interface</p>
            </div>
          </div>

          <div className="itemwrapper">
            <div className="started-items-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" aria-hidden="true">
                <circle cx="18" cy="18" r="16" style={{ stroke: "none", fill: "#e0e0e0" }} />
                <path d="M12 12h12v3H12zM12 18h12v3H12z" style={{ stroke: "none", fill: "#b0b0b0" }} />
              </svg>
              <p className="itembold"> Scalable and secure platform</p>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <p>© 2025 Scribbie. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
