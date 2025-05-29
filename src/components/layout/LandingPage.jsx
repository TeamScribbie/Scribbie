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
          <p className="infobox-slimtext">Feels like real classroom</p>
          <div className="infobox-btnwrapper">
            <button className="infobox-explorebtn selected" onClick={goToLogin}>Explore</button>
          </div>
        </section>

        <section className="infobox">
          <div className="infobox-content">
            <img
              src="/src/assets/landingface.png"
              alt="Scribbie Character"
              className="infobox-image"
            />
          </div>
        </section>
      </main>


      <section className="started">
        <p className="started-boldtext">Getting started</p>
        <div className="started-items">
          <div className="itemwrapper">
            <div className="started-items-item">
              <p className="itembold">Interactive reading and writing lessons</p>
            </div>
          </div>

          <div className="itemwrapper">
            <div className="started-items-item">
              <p className="itembold">User-friendly interface</p>
            </div>
          </div>

          <div className="itemwrapper">
            <div className="started-items-item">
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
